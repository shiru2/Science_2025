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

// チャレンジステップの定義
type ChallengeStep = 'intro' | 'record' | 'visualize' | 'filter' | 'complete'

function App() {
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [lowCut, setLowCut] = useState<number | null>(null)
  const [highCut, setHighCut] = useState<number | null>(null)
  const [filteredAudio, setFilteredAudio] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<ChallengeStep>('intro')

  // 音声データを読み込んだときの処理
  const handleAudioLoaded = (data: AudioData) => {
    setAudioData(data)
    setFilteredAudio(null)
    setLowCut(null)
    setHighCut(null)
    if (currentStep === 'record') {
      setCurrentStep('visualize')
    }
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

  // ストーリーコンテンツ
  const storyContent = {
    intro: {
      title: '🎵 声の不思議な世界へようこそ',
      content: (
        <div className="space-y-6 text-lg leading-relaxed">
          <p className="text-2xl font-bold">あなたの声、見たことありますか？</p>
          <p>
            普段何気なく使っている「声」。実は、声は目に見えない
            <span className="text-yellow-300 font-bold">波</span>
            でできているんです。
          </p>
          <p>
            この波には、高い音と低い音が混ざり合っています。まるでオーケストラのように、
            たくさんの音が重なって、あなただけの「声」を作り出しているのです。
          </p>
          <div className="bg-blue-500/20 p-6 rounded-2xl border-2 border-blue-400/50">
            <p className="font-bold text-xl mb-3">💡 今日の冒険</p>
            <p>このツールを使って、あなたの声を「見て」、「分解して」、「操作」してみましょう！</p>
          </div>
          <button
            onClick={() => setCurrentStep('record')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-12 py-6 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-2xl"
          >
            冒険をはじめる →
          </button>
        </div>
      ),
    },
    record: {
      title: 'ステップ1: 声を録音しよう',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            まずは、あなたの声を録音してみましょう。
            「あー」でも「こんにちは」でも、何でもOKです！
          </p>
        </div>
      ),
    },
    visualize: {
      title: 'ステップ2: 声の正体を見てみよう',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            これがあなたの声の<span className="text-yellow-300 font-bold">スペクトログラム</span>です！
          </p>
          <p className="text-base text-gray-300">
            横軸が「時間」、縦軸が「周波数（音の高さ）」を表しています。
            明るい色ほど、その周波数の音が強いことを示しています。
          </p>
          <div className="bg-green-500/20 p-4 rounded-xl border-2 border-green-400/50">
            <p className="font-bold">👀 よく見てみよう</p>
            <p className="text-sm mt-2">
              色が付いている部分が、あなたの声に含まれる「音の層」です。
              いろんな高さの音が混ざっているのがわかりますか？
            </p>
          </div>
          <button
            onClick={() => setCurrentStep('filter')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105"
          >
            次のステップへ →
          </button>
        </div>
      ),
    },
    filter: {
      title: 'ステップ3: 音の層を操作してみよう',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            さあ、ここからが本番です！スライダーを動かして、
            <span className="text-purple-300 font-bold">音を削除</span>
            してみましょう。
          </p>
          <div className="bg-purple-500/20 p-4 rounded-xl border-2 border-purple-400/50">
            <p className="font-bold">🎛️ 実験してみよう</p>
            <p className="text-sm mt-2">
              低い音だけ残すと？高い音だけ残すと？あなたの声はどう変わるでしょうか？
            </p>
          </div>
        </div>
      ),
    },
    complete: {
      title: '🎉 すごい！音を操作できた！',
      content: (
        <div className="space-y-6 text-lg">
          <p className="text-2xl font-bold">おめでとうございます！</p>
          <p>
            あなたは今、声を「見て」、「分解して」、「操作する」ことに成功しました。
          </p>
          <div className="bg-yellow-500/20 p-6 rounded-2xl border-2 border-yellow-400/50">
            <p className="font-bold text-xl mb-3">🧠 学んだこと</p>
            <ul className="space-y-2 text-base">
              <li>✓ 声は目に見えない「波」でできている</li>
              <li>✓ 波にはいろんな高さ（周波数）の音が混ざっている</li>
              <li>✓ 周波数を操作すると、声の聞こえ方が変わる</li>
            </ul>
          </div>
          <p className="text-gray-300">
            この技術は、音楽制作、ノイズキャンセリング、音声認識など、
            私たちの生活のあらゆる場所で使われています。
          </p>
          <button
            onClick={() => {
              setAudioData(null)
              setFilteredAudio(null)
              setLowCut(null)
              setHighCut(null)
              setCurrentStep('intro')
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105"
          >
            もう一度挑戦する
          </button>
        </div>
      ),
    },
  }

  // 音声再生
  const playAudio = (audioBase64: string) => {
    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`)
    audio.play()
  }

  // プログレスバーの計算
  const stepIndex = ['intro', 'record', 'visualize', 'filter', 'complete'].indexOf(currentStep)
  const progress = (stepIndex / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* プログレスバー */}
        {currentStep !== 'intro' && currentStep !== 'complete' && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>ステップ {stepIndex}/4</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto">
          {/* イントロ画面 */}
          {currentStep === 'intro' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl animate-fadeIn">
              <h1 className="text-4xl font-bold mb-8 text-center">
                {storyContent.intro.title}
              </h1>
              {storyContent.intro.content}
            </div>
          )}

          {/* 録音ステップ */}
          {currentStep === 'record' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold mb-6">{storyContent.record.title}</h2>
                {storyContent.record.content}
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <Recorder onAudioLoaded={handleAudioLoaded} />
              </div>
            </div>
          )}

          {/* ビジュアライゼーションステップ */}
          {currentStep === 'visualize' && audioData && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold mb-6">{storyContent.visualize.title}</h2>
                {storyContent.visualize.content}
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <Spectrogram audioData={audioData} />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => playAudio(audioData.originalAudio)}
                    className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
                  >
                    🎧 音声を再生
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* フィルターステップ */}
          {currentStep === 'filter' && audioData && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold mb-6">{storyContent.filter.title}</h2>
                {storyContent.filter.content}
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <Spectrogram audioData={audioData} />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <FrequencySlider
                  maxFrequency={audioData.sampleRate / 2}
                  lowCut={lowCut}
                  highCut={highCut}
                  onLowCutChange={setLowCut}
                  onHighCutChange={setHighCut}
                />
                <div className="mt-8 flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={applyFilter}
                    disabled={isProcessing || (!lowCut && !highCut)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 px-12 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? '処理中...' : 'フィルター適用 ✨'}
                  </button>
                </div>
              </div>
              {filteredAudio && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6 text-center">聞き比べてみよう</h3>
                    <div className="flex gap-6 justify-center flex-wrap">
                      <button
                        onClick={() => playAudio(audioData.originalAudio)}
                        className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
                      >
                        🎧 元の音声
                      </button>
                      <button
                        onClick={() => playAudio(filteredAudio)}
                        className="bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
                      >
                        🔊 加工後の音声
                      </button>
                    </div>
                  </div>
                  <div className="bg-green-500/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-green-400/50">
                    <p className="text-lg mb-6 text-center">
                      音の変化に気づきましたか？違いがわかったら、次に進みましょう！
                    </p>
                    <button
                      onClick={() => setCurrentStep('complete')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-12 py-5 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105"
                    >
                      完了して結果を見る →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 完了画面 */}
          {currentStep === 'complete' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl animate-fadeIn">
              <h2 className="text-4xl font-bold mb-8 text-center">
                {storyContent.complete.title}
              </h2>
              {storyContent.complete.content}
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
