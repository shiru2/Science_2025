# 音のひみつ解説動画

子供向けの音声処理解説動画をManimで作成するためのスクリプトです。

## 動画の内容

この動画では、以下の3つのステップで「音の分解とフィルタリング」を子供にも分かりやすく説明します：

1. **導入**：「音は波でできている」
   - 複雑な波形を表示し、これが「みんなの声」であることを示します

2. **分解**：「音の積み木」
   - 複雑な波が3つの単純な波（基音、倍音1、倍音2）に分解される様子をアニメーション
   - 「音の積み木」という比喩で直感的に理解

3. **フィルタリング**：「高い音を消す実験」
   - フィルターの「壁」が降りてきて高い音を隠すアニメーション
   - 残った波だけで再合成すると、シンプルな音になることを視覚化

## 必要な環境

### 1. Manimのインストール

```bash
# pipでインストール
pip install manim

# または、condaでインストール
conda install -c conda-forge manim
```

詳細は[Manim公式ドキュメント](https://docs.manim.community/en/stable/installation.html)を参照してください。

### 2. FFmpegのインストール（必要に応じて）

Manimは動画生成にFFmpegを使用します。

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
- [FFmpegダウンロードページ](https://ffmpeg.org/download.html)からインストーラーをダウンロード

**Linux:**
```bash
sudo apt install ffmpeg
```

## 動画の生成方法

### 高画質で出力（本番用 - 1080p）

```bash
manim -pqh sound_mystery.py SoundMystery
```

- `-p`: 完了後に動画を再生（preview）
- `-q h`: 高画質（quality high）で出力

### 低画質で出力（テスト用 - 480p）

```bash
manim -pql sound_mystery.py SoundMystery
```

- `-q l`: 低画質（quality low）で出力
- 動作確認やテストに最適

### その他のオプション

```bash
# 4K画質で出力
manim -pqk sound_mystery.py SoundMystery

# 再生なしで出力のみ
manim -qh sound_mystery.py SoundMystery

# 特定のフレームレートで出力（例：30fps）
manim -pqh --frame_rate 30 sound_mystery.py SoundMystery
```

## 出力ファイルの場所

生成された動画は以下の場所に保存されます：

```
movie/media/videos/sound_mystery/1080p60/SoundMystery.mp4
```

品質によって異なるディレクトリに保存されます：
- 高画質（-qh）: `1080p60/`
- 低画質（-ql）: `480p15/`
- 4K（-qk）: `2160p60/`

## 活用方法

### 1. イベント当日のデモ用

- PCのメディアプレイヤーでループ再生
- 体験の前に見せて、これから何をするか説明

### 2. Webアプリへの埋め込み

生成された動画をWebアプリに埋め込むことも可能です：

```typescript
// React での例
<video controls loop autoPlay muted>
  <source src="/videos/SoundMystery.mp4" type="video/mp4" />
</video>
```

### 3. 説明資料として

- プレゼンテーションに組み込む
- SNSで共有して事前告知

## カスタマイズ

`sound_mystery.py`のパラメータを変更することで、動画の内容を調整できます：

```python
# 基本周波数（波の速さ）
f0 = 0.5  # 大きくすると波が早く動く

# 振幅（波の高さ）
amp1 = 1.0  # 基音の強さ
amp2 = 0.5  # 倍音1の強さ
amp3 = 0.3  # 倍音2の強さ

# 色の設定
COLOR_FUNDAMENTAL = BLUE_C   # 基音の色
COLOR_HARMONIC1 = YELLOW_C   # 倍音1の色
COLOR_HARMONIC2 = RED_C      # 倍音2の色
```

## トラブルシューティング

### エラー: "ModuleNotFoundError: No module named 'manim'"

Manimがインストールされていません。インストールコマンドを実行してください。

### エラー: "FFmpeg not found"

FFmpegがインストールされていないか、パスが通っていません。FFmpegをインストールしてください。

### 動画が生成されない

- コマンドを正しく実行しているか確認
- エラーメッセージを確認して対処

## 参考リンク

- [Manim Community Documentation](https://docs.manim.community/)
- [Manim Examples Gallery](https://docs.manim.community/en/stable/examples.html)
- [3Blue1Brown (Manimの作者)](https://www.3blue1brown.com/)

## ライセンス

このプロジェクトは倍音体験ツールの一部です。教育目的での使用を想定しています。
