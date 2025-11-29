import { useState, useRef } from 'react'
import Recorder from './components/Recorder'
import Spectrogram from './components/Spectrogram'
import AudioWaveform from './components/AudioWaveform'
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

// チャレンジステップの定義（startステップを追加）
type ChallengeStep = 'start' | 'video' | 'record' | 'visualize' | 'filter' | 'complete'

function App() {
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [lowCut, setLowCut] = useState<number | null>(null)
  const [highCut, setHighCut] = useState<number | null>(null)
  const [filteredAudio, setFilteredAudio] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<ChallengeStep>('start')
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'normal'>('normal')

  // 現在再生中の音声を保持
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

  // 音声再生（重複を防止）
  const playAudio = (audioBase64: string) => {
    // 既存の音声が再生中なら停止
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // 新しい音声を再生
    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`)
    audioRef.current = audio
    audio.play()
  }

  // プログレスバーの計算
  const stepIndex = ['start', 'video', 'record', 'visualize', 'filter', 'complete'].indexOf(currentStep)
  const progress = ((stepIndex - 2) / 3) * 100 // start, videoを除いた3ステップで計算

  // テキストマッピング
  const text = {
    title: difficultyLevel === 'easy' ? 'こえのふしぎなせかい' : '声の不思議な世界',
    questionSeenVoice: difficultyLevel === 'easy' ? 'あなたのこえ、見たことありますか？' : 'あなたの声、見たことありますか？',
    voiceIsWave: difficultyLevel === 'easy' ? 'こえは目に見えない「なみ」でできています。' : '声は目に見えない「波」でできています。',
    discoverMystery: difficultyLevel === 'easy' ? 'このたいけんで、こえのふしぎを見つけよう！' : 'この体験を通して、声の不思議を発見しましょう！',
    experienceFlow: difficultyLevel === 'easy' ? 'たいけんのながれ' : '体験の流れ',
    recordVoice: difficultyLevel === 'easy' ? 'こえをろくおんする' : '声を録音する',
    seeVoice: difficultyLevel === 'easy' ? 'こえのしょうたいを見る' : '声の正体を見る',
    manipulateSound: difficultyLevel === 'easy' ? 'おとをあやつる' : '音を操作する',
    learnWithVideo: difficultyLevel === 'easy' ? 'まずはどうがで学ぼう' : 'まずは動画で学ぼう',
    learnedMystery: difficultyLevel === 'easy' ? 'どうがを見て、おとのふしぎを学びましたか？' : '動画を見て、音の不思議を学びましたか？',
    tryExperiment: difficultyLevel === 'easy' ? 'さあ、こんどは自分のこえでじっけんしてみよう！' : 'さあ、今度は自分の声で実験してみましょう！',
    startExperiment: difficultyLevel === 'easy' ? 'じっけんをはじめる →' : '実験を始める →',
    step1Record: difficultyLevel === 'easy' ? 'ステップ1: こえをろくおんしよう' : 'ステップ1: 声を録音しよう',
    step2See: difficultyLevel === 'easy' ? 'ステップ2: こえのしょうたいを見てみよう' : 'ステップ2: 声の正体を見てみよう',
    thisIsSpectrogram: difficultyLevel === 'easy' ? 'これがあなたのこえの「おとの絵」です！' : 'これがあなたの声のスペクトログラムです！',
    spectrogramExplain: difficultyLevel === 'easy'
      ? 'よこが「時間」、たてが「おとのたかさ」をあらわしています。明るいところほど、そのたかさのおとが強いです。'
      : '横軸が「時間」、縦軸が「周波数（音の高さ）」を表しています。明るい色ほど、その周波数の音が強いことを示しています。',
    lookCarefully: difficultyLevel === 'easy' ? 'よく見てみよう' : 'よく見てみよう',
    coloredLayers: difficultyLevel === 'easy'
      ? '色がついているところが、あなたのこえにふくまれる「おとのそう」です。いろんなたかさのおとがまざっているのがわかりますか？'
      : '色が付いている部分が、あなたの声に含まれる「音の層」です。いろんな高さの音が混ざっているのがわかりますか？',
    spectrogram: difficultyLevel === 'easy' ? 'おとの絵' : 'スペクトログラム',
    waveform: difficultyLevel === 'easy' ? 'なみの形' : '波形',
    yourVoiceWaveform: difficultyLevel === 'easy' ? '🎤 あなたのこえのなみの形' : '🎤 あなたの声の波形',
    playAudio: difficultyLevel === 'easy' ? '🎧 おとをきく' : '🎧 音声を再生',
    nextStep: difficultyLevel === 'easy' ? 'つぎへ →' : '次のステップへ →',
    step3Manipulate: difficultyLevel === 'easy' ? 'ステップ3: おとのそうをあやつってみよう' : 'ステップ3: 音の層を操作してみよう',
    tryExperimentFilter: difficultyLevel === 'easy' ? 'じっけんしてみよう' : '実験してみよう',
    experimentQuestion: difficultyLevel === 'easy'
      ? 'ひくいおとだけのこすと？たかいおとだけのこすと？あなたのこえはどうかわるでしょうか？'
      : '低い音だけ残すと？高い音だけ残すと？あなたの声はどう変わるでしょうか？',
    originalWaveform: difficultyLevel === 'easy' ? '🎤 もとのこえのなみの形' : '🎤 元の音声の波形',
    filteredWaveform: difficultyLevel === 'easy' ? '✨ フィルターをかけたあとのなみの形' : '✨ フィルター適用後の波形',
    goBack: difficultyLevel === 'easy' ? '← まえにもどる' : '← 前に戻る',
    applyFilter: difficultyLevel === 'easy' ? 'フィルターをかける ✨' : 'フィルター適用 ✨',
    processing: difficultyLevel === 'easy' ? 'しょりちゅう...' : '処理中...',
    compareSound: difficultyLevel === 'easy' ? 'ききくらべてみよう' : '聞き比べてみよう',
    originalSound: difficultyLevel === 'easy' ? '🎧 もとのおと' : '🎧 元の音声',
    processedSound: difficultyLevel === 'easy' ? '🔊 かこうしたあとのおと' : '🔊 加工後の音声',
    noticedChange: difficultyLevel === 'easy'
      ? 'おとのへんかに気づきましたか？ちがいがわかったら、つぎにすすもう！'
      : '音の変化に気づきましたか？違いがわかったら、次に進みましょう！',
    completeAndSee: difficultyLevel === 'easy' ? 'かんりょうしてけっかを見る →' : '完了して結果を見る →',
    amazing: difficultyLevel === 'easy' ? 'すごい！おとをあやつれた！' : 'すごい！音を操作できた！',
    congratulations: difficultyLevel === 'easy' ? 'おめでとう！' : 'おめでとうございます！',
    youDidIt: difficultyLevel === 'easy'
      ? 'あなたは今、こえを「見て」、「ぶんかいして」、「あやつる」ことにせいこうしました。'
      : 'あなたは今、声を「見て」、「分解して」、「操作する」ことに成功しました。',
    whatYouLearned: difficultyLevel === 'easy' ? '学んだこと' : '学んだこと',
    learned1: difficultyLevel === 'easy' ? 'こえは目に見えない「なみ」でできている' : '声は目に見えない「波」でできている',
    learned2: difficultyLevel === 'easy' ? 'なみにはいろんなたかさのおとがまざっている' : '波にはいろんな高さ（周波数）の音が混ざっている',
    learned3: difficultyLevel === 'easy' ? 'おとのたかさをかえると、こえのきこえ方がかわる' : '周波数を操作すると、声の聞こえ方が変わる',
    realWorldUse: difficultyLevel === 'easy'
      ? 'このぎじゅつは、音がくづくり、おとをけすきかい、こえをにんしきするなど、わたしたちのせいかつのいろんなところでつかわれています。'
      : 'この技術は、音楽制作、ノイズキャンセリング、音声認識など、私たちの生活のあらゆる場所で使われています。',
    goBackOne: difficultyLevel === 'easy' ? '← ひとつまえにもどる' : '← 一つ前に戻る',
    finish: difficultyLevel === 'easy' ? 'おわり' : '終わり',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* プログレスバー */}
        {currentStep !== 'start' && currentStep !== 'video' && currentStep !== 'complete' && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>ステップ {Math.max(stepIndex - 1, 1)}/3</span>
              <span>{Math.max(Math.round(progress), 0)}%</span>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto">
          {/* スタート画面 */}
          {currentStep === 'start' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl animate-fadeIn">
              <h1 className="text-5xl font-bold mb-8 text-center text-gray-800">
                🎵 {text.title}
              </h1>
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <p className="text-2xl text-gray-700">
                    {text.questionSeenVoice}
                  </p>
                  <p className="text-lg text-gray-600">
                    {text.voiceIsWave}<br />
                    {text.discoverMystery}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 p-8 rounded-2xl">
                  <p className="text-xl font-bold text-gray-800 text-center mb-4">✨ {text.experienceFlow}</p>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-purple-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">1</span>
                      <span>{text.recordVoice}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-purple-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">2</span>
                      <span>{text.seeVoice}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-purple-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">3</span>
                      <span>{text.manipulateSound}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xl text-gray-700 text-center mb-2">むずかしさを選んでください</p>
                  <button
                    onClick={() => {
                      setDifficultyLevel('easy')
                      setCurrentStep('video')
                    }}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 px-12 py-6 rounded-2xl text-2xl font-bold text-white transition-all transform hover:scale-105 shadow-2xl"
                  >
                    😊 かんたんモード（小学3年生以下）
                  </button>
                  <button
                    onClick={() => {
                      setDifficultyLevel('normal')
                      setCurrentStep('video')
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-12 py-6 rounded-2xl text-2xl font-bold text-white transition-all transform hover:scale-105 shadow-2xl"
                  >
                    🚀 ふつうモード（小学4年生以上）
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 動画イントロ画面 */}
          {currentStep === 'video' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl animate-fadeIn">
              <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
                📺 {text.learnWithVideo}
              </h1>
              <div className="space-y-6">
                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                  <video
                    className="w-full"
                    controls
                    autoPlay
                    muted
                  >
                    <source src="/videos/sound_mystery.mp4" type="video/mp4" />
                    お使いのブラウザは動画をサポートしていません。
                  </video>
                </div>
                <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-2xl">
                  <p className="text-lg text-gray-700 text-center mb-4">
                    {text.learnedMystery}
                  </p>
                  <p className="text-base text-gray-600 text-center">
                    {text.tryExperiment}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep('record')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-12 py-6 rounded-2xl text-2xl font-bold text-white transition-all transform hover:scale-105 shadow-2xl"
                >
                  {text.startExperiment}
                </button>
              </div>
            </div>
          )}

          {/* 録音ステップ */}
          {currentStep === 'record' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">{text.step1Record}</h2>
                <Recorder onAudioLoaded={handleAudioLoaded} />
              </div>
            </div>
          )}

          {/* ビジュアライゼーションステップ */}
          {currentStep === 'visualize' && audioData && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">{text.step2See}</h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    {text.thisIsSpectrogram}
                  </p>
                  <p className="text-base text-gray-600">
                    {text.spectrogramExplain}
                  </p>
                  <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
                    <p className="font-bold text-gray-800">👀 {text.lookCarefully}</p>
                    <p className="text-sm mt-2 text-gray-600">
                      {text.coloredLayers}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* スペクトログラム */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">📊 {text.spectrogram}</h3>
                    <Spectrogram
                      audioData={audioData}
                      maxFrequency={4000}
                      height="300px"
                    />
                  </div>
                  {/* 波形表示 */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">🌊 {text.waveform}</h3>
                    <div className="space-y-4">
                      <AudioWaveform
                        audioBase64={audioData.originalAudio}
                        label={text.yourVoiceWaveform}
                        color="rgb(59, 130, 246)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => playAudio(audioData.originalAudio)}
                    className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl text-lg font-bold text-white transition-all transform hover:scale-105"
                  >
                    {text.playAudio}
                  </button>
                  <button
                    onClick={() => setCurrentStep('filter')}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-4 rounded-xl text-lg font-bold text-white transition-all transform hover:scale-105"
                  >
                    {text.nextStep}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* フィルターステップ */}
          {currentStep === 'filter' && audioData && (
            <div className="min-h-screen flex flex-col animate-fadeIn">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-4">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{text.step3Manipulate}</h2>
                <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-xl">
                  <p className="font-bold text-gray-800">🎛️ {text.tryExperimentFilter}</p>
                  <p className="text-sm mt-2 text-gray-600">
                    {text.experimentQuestion}
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* スペクトログラム */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">📊 {text.spectrogram}</h3>
                    <Spectrogram
                      audioData={audioData}
                      lowCut={lowCut}
                      highCut={highCut}
                      maxFrequency={4000}
                      height="300px"
                    />
                  </div>
                  {/* 波形表示 */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">🌊 {text.waveform}</h3>
                    <div className="space-y-4">
                      <AudioWaveform
                        audioBase64={audioData.originalAudio}
                        label={text.originalWaveform}
                        color="rgb(59, 130, 246)"
                      />
                      {filteredAudio && (
                        <AudioWaveform
                          audioBase64={filteredAudio}
                          label={text.filteredWaveform}
                          color="rgb(168, 85, 247)"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                <div className="grid grid-cols-1 gap-4">
                  <FrequencySlider
                    maxFrequency={4000}
                    lowCut={lowCut}
                    highCut={highCut}
                    onLowCutChange={setLowCut}
                    onHighCutChange={setHighCut}
                  />
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => setCurrentStep('visualize')}
                      className="bg-gray-500 hover:bg-gray-600 px-6 py-3 rounded-xl text-base font-bold text-white transition-all transform hover:scale-105"
                    >
                      {text.goBack}
                    </button>
                    <button
                      onClick={applyFilter}
                      disabled={isProcessing || (!lowCut && !highCut)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 px-8 py-3 rounded-xl text-lg font-bold text-white transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? text.processing : text.applyFilter}
                    </button>
                  </div>
                </div>
              </div>

              {filteredAudio && (
                <div className="space-y-4 mt-4 animate-fadeIn">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-800">{text.compareSound}</h3>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <button
                        onClick={() => playAudio(audioData.originalAudio)}
                        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-base font-bold text-white transition-all transform hover:scale-105"
                      >
                        {text.originalSound}
                      </button>
                      <button
                        onClick={() => playAudio(filteredAudio)}
                        className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl text-base font-bold text-white transition-all transform hover:scale-105"
                      >
                        {text.processedSound}
                      </button>
                    </div>
                  </div>
                  <div className="bg-green-50 border-2 border-green-300 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                    <p className="text-base mb-4 text-center text-gray-700">
                      {text.noticedChange}
                    </p>
                    <button
                      onClick={() => setCurrentStep('complete')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-2xl text-xl font-bold text-white transition-all transform hover:scale-105"
                    >
                      {text.completeAndSee}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 完了画面 */}
          {currentStep === 'complete' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl animate-fadeIn">
              <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
                🎉 {text.amazing}
              </h2>
              <div className="space-y-6 text-lg">
                <p className="text-2xl font-bold text-gray-800">{text.congratulations}</p>
                <p className="text-gray-700">
                  {text.youDidIt}
                </p>
                <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-2xl">
                  <p className="font-bold text-xl mb-3 text-gray-800">🧠 {text.whatYouLearned}</p>
                  <ul className="space-y-2 text-base text-gray-700">
                    <li>✓ {text.learned1}</li>
                    <li>✓ {text.learned2}</li>
                    <li>✓ {text.learned3}</li>
                  </ul>
                </div>
                <p className="text-gray-600">
                  {text.realWorldUse}
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => setCurrentStep('filter')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-xl text-xl font-bold text-white transition-all transform hover:scale-105"
                  >
                    {text.goBackOne}
                  </button>
                  <button
                    onClick={() => {
                      setAudioData(null)
                      setFilteredAudio(null)
                      setLowCut(null)
                      setHighCut(null)
                      setCurrentStep('start')
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 px-8 py-4 rounded-xl text-xl font-bold text-white transition-all transform hover:scale-105"
                  >
                    {text.finish}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-16 text-gray-500">
          <p>© 2025 倍音体験ツール - Science Child Project</p>
        </footer>
      </div>
    </div>
  )
}

export default App
