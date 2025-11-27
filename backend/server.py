#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI Server for Harmonic Experience Tool
倍音体験ツールのバックエンドサーバー
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional
import os

from audio_processor import AudioProcessor, process_audio_with_filters

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="Harmonic Experience API",
    description="音声処理APIサーバー - 倍音体験ツール",
    version="0.1.0",
)

# CORS設定（開発用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に制限すること
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 音声処理プロセッサーのインスタンス
processor = AudioProcessor()


# リクエストモデル
class FilterRequest(BaseModel):
    """フィルターリクエストのモデル"""

    audio_base64: str
    low_cut: Optional[float] = None
    high_cut: Optional[float] = None

    class Config:
        # スネークケースとキャメルケースの両方を受け入れる
        populate_by_name = True


# エンドポイント
@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {"message": "Harmonic Experience API Server", "version": "0.1.0"}


@app.get("/api/health")
async def health_check():
    """ヘルスチェック"""
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    音声ファイルをアップロードしてスペクトログラムを返す

    Args:
        file: WAVファイル

    Returns:
        スペクトログラムデータ
    """
    try:
        # ファイル読み込み
        audio_bytes = await file.read()

        # 音声処理
        sample_rate, audio_data = processor.load_audio(audio_bytes)

        # スペクトログラム計算
        frequencies, times, spectrogram = processor.compute_spectrogram(audio_data)

        # 元の音声もBase64で返す
        original_audio_base64 = processor.audio_to_base64(audio_data)

        return JSONResponse(
            {
                "success": True,
                "data": {
                    "sampleRate": int(sample_rate),
                    "duration": float(len(audio_data) / sample_rate),
                    "frequencies": frequencies.tolist(),
                    "times": times.tolist(),
                    "spectrogram": spectrogram.tolist(),
                    "originalAudio": original_audio_base64,
                },
            }
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing audio: {str(e)}")


@app.post("/api/process")
async def process_audio(request: FilterRequest):
    """
    音声にフィルターを適用

    Args:
        request: フィルターリクエスト（audio_base64, low_cut, high_cut）

    Returns:
        フィルタリング後の音声データ
    """
    try:
        import base64

        # Base64デコード
        audio_bytes = base64.b64decode(request.audio_base64)

        # 音声処理
        result = process_audio_with_filters(
            audio_bytes, request.low_cut, request.high_cut
        )

        return JSONResponse({"success": True, "data": result})

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing audio: {str(e)}")


@app.get("/api/test-audio")
async def generate_test_audio():
    """
    テスト用の音声を生成

    Returns:
        テスト音声データ（Base64）
    """
    try:
        # テスト音声生成
        test_audio = processor.generate_test_audio(duration=3.0)

        # Base64エンコード
        test_audio_base64 = processor.audio_to_base64(test_audio)

        # スペクトログラム計算
        frequencies, times, spectrogram = processor.compute_spectrogram(test_audio)

        return JSONResponse(
            {
                "success": True,
                "data": {
                    "sampleRate": processor.sample_rate,
                    "duration": 3.0,
                    "frequencies": frequencies.tolist(),
                    "times": times.tolist(),
                    "spectrogram": spectrogram.tolist(),
                    "originalAudio": test_audio_base64,
                },
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating test audio: {str(e)}"
        )


# 静的ファイルの配信（フロントエンドビルド後）
frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")


# サーバー起動スクリプト
if __name__ == "__main__":
    import uvicorn

    print("=" * 50)
    print("🎵 倍音体験ツール - サーバー起動中")
    print("=" * 50)
    print()
    print("📍 サーバーURL: http://localhost:8000")
    print("📍 API docs: http://localhost:8000/docs")
    print()
    print("終了するには Ctrl+C を押してください")
    print()

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 開発時のホットリロード
    )
