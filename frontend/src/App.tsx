import { useState } from 'react'
import Recorder from './components/Recorder'
import Spectrogram from './components/Spectrogram'
import FrequencySlider from './components/FrequencySlider'
import axios from 'axios'

interface AudioData {
  sampleRate: number
  duration: number
  frequencies: number[]
  times: number[]
  spectrogram: number[][]
  originalAudio: string
}

function App() {
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [lowCut, setLowCut] = useState<number | null>(null)
  const [highCut, setHighCut] = useState<number | null>(null)
  const [filteredAudio, setFilteredAudio] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 音声データを読み込んだときの処理
  const handleAudioLoaded = (data: AudioData) => {
    setAudioData(data)
    setFilteredAudio(null)
    setLowCut(null)
    setHighCut(null)
  }

  // フィルター適用
  const applyFilter = async () => {
    if (!audioData) return

    setIsProcessing(true)
    try {
      const response = await axios.post('/api/process', {
        audio_base64: audioData.originalAudio,
        low_cut: lowCut,
        high_cut: highCut,
      })

      if (response.data.success) {
        setFilteredAudio(response.data.data.filteredAudio)
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      alert('音声の処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  // 音声再生
  const playAudio = (audioBase64: string) => {
    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`)
    audio.play()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🎵 倍音体験ツール</h1>
          <p className="text-xl text-gray-300">
            声は波でできている。分解して、操作してみよう！
          </p>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* ステップ 1: 録音 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="bg-purple-500 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                1
              </span>
              録音してみよう
            </h2>
            <Recorder onAudioLoaded={handleAudioLoaded} />
          </div>

          {/* ステップ 2: スペクトログラム表示 */}
          {audioData && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                  2
                </span>
                声の正体を見てみよう
              </h2>
              <Spectrogram audioData={audioData} />
              <div className="mt-6 p-4 bg-blue-500/20 rounded-lg">
                <p className="text-lg">
                  ✨ これがあなたの声の正体です！横軸が時間、縦軸が周波数（音の高さ）を表しています。
                </p>
              </div>
            </div>
          )}

          {/* ステップ 3: 周波数フィルター */}
          {audioData && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                  3
                </span>
                音の層を操作してみよう
              </h2>
              <FrequencySlider
                maxFrequency={audioData.sampleRate / 2}
                lowCut={lowCut}
                highCut={highCut}
                onLowCutChange={setLowCut}
                onHighCutChange={setHighCut}
              />
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={applyFilter}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 px-8 py-3 rounded-lg text-lg font-bold transition-colors"
                >
                  {isProcessing ? '処理中...' : 'フィルター適用'}
                </button>
              </div>
            </div>
          )}

          {/* ステップ 4: 再生 */}
          {audioData && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-yellow-500 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                  4
                </span>
                聞き比べてみよう
              </h2>
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => playAudio(audioData.originalAudio)}
                  className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-lg text-lg font-bold transition-colors"
                >
                  🎧 元の音声を再生
                </button>
                {filteredAudio && (
                  <button
                    onClick={() => playAudio(filteredAudio)}
                    className="bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-lg text-lg font-bold transition-colors"
                  >
                    🔊 加工後の音声を再生
                  </button>
                )}
              </div>
              {filteredAudio && (
                <div className="mt-6 p-4 bg-yellow-500/20 rounded-lg">
                  <p className="text-lg">
                    🎉 声が変わったのがわかりましたか？これが「音を操作する」ということです！
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="text-center mt-16 text-gray-400">
          <p>© 2025 倍音体験ツール - Science Child Project</p>
        </footer>
      </div>
    </div>
  )
}

export default App
