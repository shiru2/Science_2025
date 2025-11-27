import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import RectangleSelector, Button
from scipy.io import wavfile
from scipy import signal
import sounddevice as sd
import os
import sys
from datetime import datetime

# --- グローバル変数の定義 ---
sample_rate = 44100  # デフォルトのサンプリングレート
audio_data = None
stft_mat = None        # 複素数のSTFTデータ
t_stft = None          # 時間軸データ
f_stft = None          # 周波数軸データ
processed_audio = None # 処理後の音声データ
fig = None
ax_spec = None
recorded_data = []     # 録音データ
is_recording = False

def record_audio(duration=None):
    """マイクから音声を録音する"""
    global sample_rate, recorded_data, is_recording

    print("\n=== 録音モード ===")
    print(f"サンプリングレート: {sample_rate} Hz")
    if duration:
        print(f"録音時間: {duration}秒")
    else:
        print("Enterキーを押すと録音を停止します...")

    recorded_data = []
    is_recording = True

    def callback(indata, frames, time, status):
        """録音のコールバック関数"""
        if status:
            print(f"録音ステータス: {status}")
        if is_recording:
            recorded_data.append(indata.copy())

    try:
        with sd.InputStream(samplerate=sample_rate, channels=1, callback=callback):
            print("\n🔴 録音中...")
            if duration:
                sd.sleep(int(duration * 1000))
            else:
                input()  # Enterキーで停止
            is_recording = False
            print("⏹ 録音停止")

        # 録音データを結合
        if recorded_data:
            audio = np.concatenate(recorded_data, axis=0).flatten()
            print(f"録音完了: {len(audio) / sample_rate:.2f}秒")

            # 録音ファイルを保存
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"recorded_{timestamp}.wav"
            audio_int16 = (audio * np.iinfo(np.int16).max * 0.95).astype(np.int16)
            wavfile.write(filename, sample_rate, audio_int16)
            print(f"ファイルを保存しました: {filename}")

            return filename, audio
        else:
            print("録音データがありません。")
            return None, None

    except KeyboardInterrupt:
        print("\n録音を中断しました。")
        is_recording = False
        return None, None
    except Exception as e:
        print(f"録音エラー: {e}")
        is_recording = False
        return None, None

def load_and_process(filename=None, audio_array=None):
    """WAVファイルまたは音声配列を読み込み、スペクトログラムを表示するメイン関数"""
    global sample_rate, audio_data, stft_mat, t_stft, f_stft, fig, ax_spec

    # 音声データの読み込み
    if audio_array is not None:
        # 録音データを直接使用
        audio_data = audio_array
        print(f"録音データを使用します（{len(audio_data) / sample_rate:.2f}秒）")
    elif filename and os.path.exists(filename):
        # ファイルから読み込み
        print(f"Loading '{filename}'...")
        sample_rate, audio_data = wavfile.read(filename)
        # ステレオの場合はモノラルに変換
        if audio_data.ndim > 1:
            audio_data = audio_data.mean(axis=1)
        audio_data = audio_data.astype(np.float32) / np.iinfo(np.int16).max # 正規化
    else:
        print(f"エラー: ファイル '{filename}' が見つかりません。")
        return

    # 短時間フーリエ変換 (STFT) でスペクトログラムを計算
    nperseg = 2048
    f_stft, t_stft, stft_mat = signal.stft(audio_data, fs=sample_rate, nperseg=nperseg)

    # 表示用に振幅をデシベル (dB) に変換
    spectrogram_db = 20 * np.log10(np.abs(stft_mat) + 1e-9)

    # プロットの準備
    fig, ax_spec = plt.subplots(figsize=(12, 7))
    plt.subplots_adjust(bottom=0.2) # ボタン配置用のスペースを空ける

    # スペクトログラムの描画
    img = ax_spec.pcolormesh(t_stft, f_stft, spectrogram_db,
                             shading='gouraud', cmap='inferno',
                             vmin=np.max(spectrogram_db)-80, vmax=np.max(spectrogram_db))
    fig.colorbar(img, ax=ax_spec, format='%+2.0f dB').set_label('Intensity [dB]')

    title = filename if filename else "Recorded Audio"
    ax_spec.set_title(f'Spectrogram of {title}\n(Drag to select a region to REMOVE)')
    ax_spec.set_ylabel('Frequency [Hz]')
    ax_spec.set_xlabel('Time [sec]')
    ax_spec.set_ylim(0, sample_rate / 2) # ナイキスト周波数まで表示

    # 範囲選択ツールの有効化
    _ = RectangleSelector(ax_spec, on_select_callback,
                          useblit=True,
                          button=[1], # 左クリックで有効
                          minspanx=5, minspany=5,
                          spancoords='pixels', interactive=True,
                          props=dict(facecolor='white', edgecolor='white', alpha=0.3, fill=True))

    # UIボタンの配置
    ax_play_orig = plt.axes([0.15, 0.05, 0.15, 0.075])
    ax_play_proc = plt.axes([0.35, 0.05, 0.15, 0.075])
    ax_save = plt.axes([0.55, 0.05, 0.15, 0.075])

    btn_play_orig = Button(ax_play_orig, 'Play Original')
    btn_play_proc = Button(ax_play_proc, 'Play Processed')
    btn_save = Button(ax_save, 'Save Result')

    btn_play_orig.on_clicked(lambda event: play_audio(audio_data))
    btn_play_proc.on_clicked(lambda event: play_audio(processed_audio))
    btn_save.on_clicked(save_audio)

    print("準備完了。スペクトログラム上で範囲を選択してください。")
    plt.show()

def on_select_callback(eclick, erelease):
    """範囲選択が完了したときに実行される処理"""
    global processed_audio, stft_mat

    # 選択範囲の座標を取得（t: 時間軸, f: 周波数軸）
    t1, t2 = sorted([eclick.xdata, erelease.xdata])
    f1, f2 = sorted([eclick.ydata, erelease.ydata])

    print(f"\n範囲選択: 時間 {t1:.2f}-{t2:.2f}秒, 周波数 {f1:.0f}-{f2:.0f}Hz")
    print("処理中... 選択範囲の成分を削除しています。")

    # 編集用にSTFTデータのコピーを作成
    stft_modified = stft_mat.copy()

    # 選択範囲に対応するインデックスのマスクを作成
    t_mask = (t_stft >= t1) & (t_stft <= t2)
    f_mask = (f_stft >= f1) & (f_stft <= f2)

    # マスクを使って、指定範囲の複素スペクトログラムの値を 0 にする（削除）
    stft_modified[np.ix_(f_mask, t_mask)] = 0 + 0j

    # 逆短時間フーリエ変換 (iSTFT) で時間領域の音声に戻す
    _, processed_audio = signal.istft(stft_modified, fs=sample_rate)

    print("完了！ 'Play Processed' ボタンで結果を確認できます。")
    ax_spec.set_title('Processing Complete. Check results with buttons below.')
    fig.canvas.draw_idle() # タイトルの更新

def play_audio(data):
    """音声データを再生する"""
    if data is None:
        print("再生するデータがありません。範囲を選択してください。")
        return
    print("再生中...")
    sd.play(data * 0.9, sample_rate)

def save_audio(event):
    """処理結果をファイルに保存する"""
    if processed_audio is None:
        print("保存するデータがありません。先に範囲を選択してください。")
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"processed_{timestamp}.wav"
    # 正規化されたfloat32データをint16に戻して保存
    save_data = (processed_audio / np.max(np.abs(processed_audio)) * np.iinfo(np.int16).max * 0.95).astype(np.int16)
    wavfile.write(output_filename, sample_rate, save_data)
    print(f"ファイルを保存しました: {output_filename}")

# === メイン処理 ===
if __name__ == "__main__":
    print("=== Spectral Remover ===")
    print("音声スペクトログラム編集ツール\n")

    # コマンドライン引数をチェック
    if len(sys.argv) > 1:
        # ファイルが指定された場合
        target_file = sys.argv[1]
        if os.path.exists(target_file):
            load_and_process(filename=target_file)
        else:
            print(f"エラー: ファイル '{target_file}' が見つかりません。")
    else:
        # 録音モードか既存ファイルモードかを選択
        print("モードを選択してください:")
        print("  1. マイクから録音 (r)")
        print("  2. WAVファイルを読み込む (f)")
        print("  3. テスト音声を生成 (t)")

        choice = input("\n選択 [r/f/t]: ").lower().strip()

        if choice == 'r' or choice == '1':
            # 録音モード
            filename, audio = record_audio()
            if audio is not None:
                load_and_process(filename=filename, audio_array=audio)
            else:
                print("録音に失敗しました。")

        elif choice == 'f' or choice == '2':
            # ファイル読み込みモード
            target_file = input("WAVファイルのパスを入力: ").strip()
            if os.path.exists(target_file):
                load_and_process(filename=target_file)
            else:
                print(f"エラー: ファイル '{target_file}' が見つかりません。")

        elif choice == 't' or choice == '3':
            # テスト音声生成モード
            print("テスト音声を生成しています...")
            fs = 44100
            t = np.linspace(0, 5, fs * 5, endpoint=False) # 5秒間
            # 440Hz(ラ), 1000Hz, 3000Hzのサイン波とノイズを混ぜる
            dummy_data = (0.5 * np.sin(2*np.pi*440*t) +
                          0.3 * np.sin(2*np.pi*1000*t) +
                          0.2 * np.sin(2*np.pi*3000*t) +
                          0.05 * np.random.randn(len(t)))

            target_file = "test.wav"
            dummy_data_int16 = (dummy_data / np.max(np.abs(dummy_data)) * np.iinfo(np.int16).max * 0.9).astype(np.int16)
            wavfile.write(target_file, fs, dummy_data_int16)
            print(f"テストファイルを作成しました: {target_file}")

            # 正規化されたfloat32配列として使用
            dummy_data_normalized = dummy_data / np.max(np.abs(dummy_data))
            load_and_process(filename=target_file, audio_array=dummy_data_normalized)
        else:
            print("無効な選択です。")
