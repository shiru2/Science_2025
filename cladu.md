# science-child

## 概要

science-childプロジェクトのドキュメントです。

## 環境構築

このプロジェクトは[uv](https://docs.astral.sh/uv/)を使用して環境管理を行っています。

### 必要要件

- Python 3.13以上
- uv

### uvのインストール

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### セットアップ手順

1. リポジトリをクローン

```bash
git clone <repository-url>
cd science_child
```

2. 依存関係のインストール

```bash
uv sync
```

これにより、`.venv`ディレクトリに仮想環境が作成され、必要な依存関係がインストールされます。

3. 仮想環境の有効化

```bash
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

または、uvコマンドで直接実行することも可能です：

```bash
uv run python your_script.py
```

## 使い方

### Spectral Remover（スペクトル編集ツール）

音声ファイルのスペクトログラムを表示し、特定の周波数範囲を選択して削除できるツールです。
マイクからのリアルタイム録音にも対応しています。

#### 実行方法

```bash
# uvコマンドで直接実行
uv run python spectral_remover.py

# または仮想環境を有効化してから実行
source .venv/bin/activate
python spectral_remover.py

# ファイルを直接指定して実行
uv run python spectral_remover.py your_audio.wav
```

#### 機能

- **リアルタイム録音**: マイクから直接音声を録音してスペクトログラム表示
- **スペクトログラム表示**: WAVファイルまたは録音音声を周波数と時間の2次元マップで表示
- **範囲選択削除**: マウスドラッグで時間と周波数の範囲を選択し、その部分の音を削除
- **リアルタイム再生**: 編集前後の音声を即座に再生して比較
- **ファイル保存**: 編集後の音声をタイムスタンプ付きで自動保存

#### 使用方法

1. プログラムを起動すると3つのモードから選択：
   - **r (録音モード)**: マイクから音声を録音し、Enterキーで停止
   - **f (ファイルモード)**: 既存のWAVファイルを読み込み
   - **t (テストモード)**: テスト用の音声を自動生成

2. 録音モードを選択した場合：
   - 🔴 録音開始の表示が出たら、マイクに向かって音声を入力
   - Enterキーを押すと録音停止
   - 自動的に `recorded_YYYYMMDD_HHMMSS.wav` として保存

3. スペクトログラムが表示されたら、マウスの左ボタンでドラッグして削除したい範囲を選択

4. 画面下部のボタンで操作：
   - **Play Original**: 元の音声を再生
   - **Play Processed**: 編集後の音声を再生
   - **Save Result**: 編集後の音声を `processed_YYYYMMDD_HHMMSS.wav` として保存

#### 使用技術

- **NumPy**: 数値計算とデータ処理
- **SciPy**: STFT/iSTFTによる周波数変換、WAVファイルの読み書き
- **Matplotlib**: スペクトログラムの表示と対話的な範囲選択UI
- **sounddevice**: 音声の再生

#### 応用例

- 特定の周波数のノイズ除去（ハムノイズ、ビープ音など）
- 楽器の特定の音域のみを抽出
- 音声から背景音を除去

### Voice Visualizer（音声ビジュアライザー）

マイクからの音声をリアルタイムで視覚化するプログラムです。

#### 実行方法

```bash
# uvコマンドで直接実行
uv run python voice_visualizer.py

# または仮想環境を有効化してから実行
source .venv/bin/activate
python voice_visualizer.py
```

#### 機能

- **波形表示**: マイクから入力された音声の波形をリアルタイムで表示
- **周波数スペクトル表示**: FFT（高速フーリエ変換）を使用して、音声の周波数成分を視覚化

#### 使用技術

- **NumPy**: 数値計算とFFT処理
- **Matplotlib**: グラフのリアルタイム描画
- **sounddevice**: マイクからの音声入力

#### 注意事項

- 実行前にマイクが接続されているか確認してください
- macOSの場合、初回実行時にマイクへのアクセス許可を求められる場合があります
- ウィンドウを閉じるとプログラムが終了します
- Ctrl+Cでも終了できます

## プロジェクト構造

```
science_child/
├── src/
│   └── science_child/
├── .venv/
├── pyproject.toml
├── uv.lock
├── README.md
├── spectral_remover.py    # スペクトル編集ツール
├── voice_visualizer.py    # 音声ビジュアライザー
├── test.wav               # テスト用音声ファイル
├── processed_result.wav   # 編集後の音声ファイル
└── cladu.md
```

## 依存関係の追加

新しいパッケージを追加する場合：

```bash
uv add <package-name>
```

開発用の依存関係を追加する場合：

```bash
uv add --dev <package-name>
```

## その他のuvコマンド

```bash
# 依存関係の更新
uv sync --upgrade

# 仮想環境の再作成
uv venv --python 3.13

# インストール済みパッケージの確認
uv pip list
```
