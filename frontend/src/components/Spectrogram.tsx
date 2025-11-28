import { useEffect, useRef } from 'react'

interface SpectrogramProps {
  audioData: {
    frequencies: number[]
    times: number[]
    spectrogram: number[][]
  }
  lowCut?: number | null
  highCut?: number | null
  maxFrequency?: number
}

const Spectrogram = ({ audioData, lowCut, highCut, maxFrequency }: SpectrogramProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !audioData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { frequencies, times, spectrogram } = audioData

    // キャンバスサイズを設定
    const width = times.length
    const height = frequencies.length
    canvas.width = width
    canvas.height = height

    // スペクトログラムを描画
    const imageData = ctx.createImageData(width, height)

    // スペクトログラムデータを正規化
    let minVal = Infinity
    let maxVal = -Infinity
    for (let i = 0; i < spectrogram.length; i++) {
      for (let j = 0; j < spectrogram[i].length; j++) {
        minVal = Math.min(minVal, spectrogram[i][j])
        maxVal = Math.max(maxVal, spectrogram[i][j])
      }
    }

    // カラーマップを適用（viridis風: カラフルで見やすい）
    for (let freqIdx = 0; freqIdx < height; freqIdx++) {
      for (let timeIdx = 0; timeIdx < width; timeIdx++) {
        const value = spectrogram[freqIdx][timeIdx]
        const normalized = (value - minVal) / (maxVal - minVal)

        // ピクセル位置（Y軸を反転）
        const pixelIndex = ((height - 1 - freqIdx) * width + timeIdx) * 4

        // カラーマップ（viridis風: 青→緑→黄）
        const r = Math.floor(normalized * 255)
        const g = Math.floor(Math.sin(normalized * Math.PI) * 255)
        const b = Math.floor((1 - normalized) * 200)

        imageData.data[pixelIndex] = r
        imageData.data[pixelIndex + 1] = g
        imageData.data[pixelIndex + 2] = b
        imageData.data[pixelIndex + 3] = 255 // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [audioData])

  // カーテンの高さを計算（周波数の範囲から％を計算）
  const calculateCurtainHeight = (frequency: number | null | undefined, isHighCut: boolean) => {
    if (!frequency) return 0

    // 表示範囲は0〜4000Hzに固定されているので、この範囲で計算
    const displayMaxFreq = 4000
    const ratio = frequency / displayMaxFreq
    // ハイカットの場合：上から下へ（frequency以上を隠す）
    // ローカットの場合：下から上へ（frequency以下を隠す）
    return isHighCut ? (1 - ratio) * 100 : ratio * 100
  }

  const highCutHeight = calculateCurtainHeight(highCut, true)
  const lowCutHeight = calculateCurtainHeight(lowCut, false)

  return (
    <div className="space-y-4">
      {/* スペクトログラムとカーテンのコンテナ */}
      <div className="relative bg-black/50 rounded-lg p-4" style={{ height: '400px' }}>
        <div className="relative w-full h-full overflow-hidden rounded">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* ハイカットカーテン（上から降りる） */}
          {highCut && highCut <= 4000 && highCutHeight > 0 && (
            <div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-pink-900/80 to-pink-600/60 border-b-4 border-pink-400 transition-all duration-300 ease-out flex items-end justify-center pb-2"
              style={{ height: `${highCutHeight}%` }}
            >
              <span className="text-pink-200 font-bold text-sm drop-shadow-lg">
                ✂️ {highCut >= 1000 ? `${(highCut / 1000).toFixed(1)} kHz` : `${highCut} Hz`} より上をカット中
              </span>
            </div>
          )}

          {/* ローカットカーテン（下から上がる） */}
          {lowCut && lowCut <= 4000 && lowCutHeight > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-blue-600/60 border-t-4 border-blue-400 transition-all duration-300 ease-out flex items-start justify-center pt-2"
              style={{ height: `${lowCutHeight}%` }}
            >
              <span className="text-blue-200 font-bold text-sm drop-shadow-lg">
                ✂️ {lowCut >= 1000 ? `${(lowCut / 1000).toFixed(1)} kHz` : `${lowCut} Hz`} より下をカット中
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 軸の説明 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-500/20 p-3 rounded-lg">
          <p className="font-bold">横軸 (X)</p>
          <p className="text-gray-700">時間の流れ →</p>
        </div>
        <div className="bg-purple-500/20 p-3 rounded-lg">
          <p className="font-bold">縦軸 (Y)</p>
          <p className="text-gray-700">周波数（音の高さ） ↑</p>
        </div>
      </div>
    </div>
  )
}

export default Spectrogram
