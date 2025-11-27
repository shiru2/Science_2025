#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audio Processor for Harmonic Experience Tool
音声処理ロジック: 周波数分解、フィルタリング、スペクトログラム生成
"""

import base64
import io
import subprocess
import tempfile
from typing import Optional, Tuple

import numpy as np
import soundfile as sf
from scipy import signal
from scipy.io import wavfile


class AudioProcessor:
    """音声処理クラス"""

    def __init__(self, sample_rate: int = 44100):
        """
        初期化

        Args:
            sample_rate: サンプリングレート (Hz)
        """
        self.sample_rate = sample_rate

    def load_audio(self, audio_bytes: bytes) -> Tuple[int, np.ndarray]:
        """
        音声データを読み込む（様々な形式に対応）

        Args:
            audio_bytes: 音声ファイルのバイナリデータ (WAV, FLAC, OGG, MP3, M4A, WebMなど)

        Returns:
            (sample_rate, audio_data): サンプリングレートと音声データ
        """
        try:
            # まずsoundfileで読み込みを試す（WAV, FLAC, OGGなど）
            audio_io = io.BytesIO(audio_bytes)
            audio_data, sample_rate = sf.read(audio_io, dtype="float32")

            # ステレオをモノラルに変換
            if len(audio_data.shape) > 1:
                audio_data = audio_data.mean(axis=1)

        except Exception:
            # soundfileで読めない場合、ffmpegで変換（M4A, MP3, WebMなど）
            try:
                # 一時ファイルに書き出し
                with tempfile.NamedTemporaryFile(
                    suffix=".input", delete=False
                ) as input_file:
                    input_file.write(audio_bytes)
                    input_path = input_file.name

                with tempfile.NamedTemporaryFile(
                    suffix=".wav", delete=False
                ) as output_file:
                    output_path = output_file.name

                try:
                    # ffmpegでWAVに変換
                    subprocess.run(
                        [
                            "ffmpeg",
                            "-i",
                            input_path,
                            "-ar",
                            "44100",  # サンプリングレート
                            "-ac",
                            "1",  # モノラル
                            "-f",
                            "wav",
                            output_path,
                            "-y",  # 上書き許可
                        ],
                        check=True,
                        capture_output=True,
                    )

                    # 変換後のWAVファイルを読み込み
                    audio_data, sample_rate = sf.read(output_path, dtype="float32")

                finally:
                    # 一時ファイルを削除
                    import os

                    try:
                        os.unlink(input_path)
                    except Exception:
                        pass
                    try:
                        os.unlink(output_path)
                    except Exception:
                        pass

            except Exception as e:
                raise ValueError(f"音声ファイルの読み込みに失敗しました: {str(e)}")

        self.sample_rate = sample_rate
        return sample_rate, audio_data

    def compute_spectrogram(
        self, audio_data: np.ndarray, nperseg: int = 2048
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        スペクトログラムを計算

        Args:
            audio_data: 音声データ
            nperseg: STFTのウィンドウサイズ

        Returns:
            (frequencies, times, spectrogram): 周波数軸、時間軸、スペクトログラム
        """
        frequencies, times, stft_matrix = signal.stft(
            audio_data, fs=self.sample_rate, nperseg=nperseg
        )

        # パワースペクトルに変換（デシベル）
        spectrogram = 20 * np.log10(np.abs(stft_matrix) + 1e-10)

        return frequencies, times, spectrogram

    def apply_frequency_filter(
        self,
        audio_data: np.ndarray,
        low_cut: Optional[float] = None,
        high_cut: Optional[float] = None,
        nperseg: int = 2048,
    ) -> np.ndarray:
        """
        周波数フィルターを適用

        Args:
            audio_data: 音声データ
            low_cut: ローカット周波数 (Hz) - これより低い周波数をカット
            high_cut: ハイカット周波数 (Hz) - これより高い周波数をカット
            nperseg: STFTのウィンドウサイズ

        Returns:
            filtered_audio: フィルタリング後の音声データ
        """
        # STFT
        frequencies, times, stft_matrix = signal.stft(
            audio_data, fs=self.sample_rate, nperseg=nperseg
        )

        # フィルターマスクを作成
        freq_mask = np.ones(stft_matrix.shape, dtype=bool)

        if low_cut is not None:
            # low_cutより低い周波数をマスク
            freq_mask[frequencies < low_cut, :] = False

        if high_cut is not None:
            # high_cutより高い周波数をマスク
            freq_mask[frequencies > high_cut, :] = False

        # フィルターを適用
        filtered_stft = stft_matrix.copy()
        filtered_stft[~freq_mask] = 0

        # iSTFT（逆変換）
        _, filtered_audio = signal.istft(
            filtered_stft, fs=self.sample_rate, nperseg=nperseg
        )

        return filtered_audio

    def audio_to_wav_bytes(self, audio_data: np.ndarray) -> bytes:
        """
        音声データをWAVバイナリに変換

        Args:
            audio_data: 音声データ (float32)

        Returns:
            WAVファイルのバイナリデータ
        """
        # 正規化（-1.0 ~ 1.0の範囲に）
        max_val = np.max(np.abs(audio_data))
        if max_val > 0:
            audio_normalized = audio_data / max_val
        else:
            audio_normalized = audio_data

        # float32 -> int16に変換（0.95倍でクリッピング防止）
        audio_int16 = (audio_normalized * 32767 * 0.95).astype(np.int16)

        # WAVファイルとして書き出し
        wav_io = io.BytesIO()
        wavfile.write(wav_io, self.sample_rate, audio_int16)
        wav_io.seek(0)

        return wav_io.read()

    def audio_to_base64(self, audio_data: np.ndarray) -> str:
        """
        音声データをBase64エンコード

        Args:
            audio_data: 音声データ

        Returns:
            Base64エンコードされた文字列
        """
        wav_bytes = self.audio_to_wav_bytes(audio_data)
        return base64.b64encode(wav_bytes).decode("utf-8")

    def spectrogram_to_base64(
        self, spectrogram: np.ndarray, format: str = "png"
    ) -> str:
        """
        スペクトログラムを画像としてBase64エンコード

        Args:
            spectrogram: スペクトログラムデータ
            format: 画像フォーマット（png, jpg）

        Returns:
            Base64エンコードされた画像データ
        """
        # 注: matplotlib依存を避けるため、フロントエンドで描画することを推奨
        # ここでは生のスペクトログラムデータをJSON形式で返すことを想定
        pass

    def generate_test_audio(self, duration: float = 3.0) -> np.ndarray:
        """
        テスト用の音声を生成（複数の周波数を含む）

        Args:
            duration: 音声の長さ (秒)

        Returns:
            テスト音声データ
        """
        t = np.linspace(0, duration, int(self.sample_rate * duration), False)

        # 基音（200 Hz）+ 倍音（400, 600, 800 Hz）
        frequencies = [200, 400, 600, 800]
        amplitudes = [1.0, 0.5, 0.3, 0.2]

        audio = np.zeros_like(t)
        for freq, amp in zip(frequencies, amplitudes):
            audio += amp * np.sin(2 * np.pi * freq * t)

        # 正規化
        audio = audio / np.max(np.abs(audio))

        return audio


# ユーティリティ関数
def process_audio_with_filters(
    audio_bytes: bytes, low_cut: Optional[float], high_cut: Optional[float]
) -> dict:
    """
    音声にフィルターを適用して結果を返す

    Args:
        audio_bytes: 元の音声データ（WAV）
        low_cut: ローカット周波数
        high_cut: ハイカット周波数

    Returns:
        処理結果の辞書
    """
    processor = AudioProcessor()

    # 音声読み込み
    sample_rate, audio_data = processor.load_audio(audio_bytes)

    # スペクトログラム計算
    frequencies, times, spectrogram = processor.compute_spectrogram(audio_data)

    # フィルター適用
    filtered_audio = processor.apply_frequency_filter(audio_data, low_cut, high_cut)

    # 結果をBase64エンコード
    filtered_audio_base64 = processor.audio_to_base64(filtered_audio)

    return {
        "sampleRate": int(sample_rate),
        "duration": float(len(audio_data) / sample_rate),
        "frequencies": frequencies.tolist(),
        "times": times.tolist(),
        "spectrogram": spectrogram.tolist(),
        "filteredAudio": filtered_audio_base64,
    }
