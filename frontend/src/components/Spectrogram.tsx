import { useEffect, useRef } from 'react'

interface SpectrogramProps {
  audioData: {
    frequencies: number[]
    times: number[]
    spectrogram: number[][]
  }
}

const Spectrogram = ({ audioData }: SpectrogramProps) => {
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

    // カラーマップを適用（青→緑→黄→赤）
    for (let freqIdx = 0; freqIdx < height; freqIdx++) {
      for (let timeIdx = 0; timeIdx < width; timeIdx++) {
        const value = spectrogram[freqIdx][timeIdx]
        const normalized = (value - minVal) / (maxVal - minVal)

        // ピクセル位置（Y軸を反転）
        const pixelIndex = ((height - 1 - freqIdx) * width + timeIdx) * 4

        // カラーマップ（viridis風）
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

  return (
    <div className="space-y-4">
      <div className="bg-black/50 rounded-lg p-4 overflow-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-500/20 p-3 rounded-lg">
          <p className="font-bold">横軸 (X)</p>
          <p className="text-gray-300">時間の流れ →</p>
        </div>
        <div className="bg-purple-500/20 p-3 rounded-lg">
          <p className="font-bold">縦軸 (Y)</p>
          <p className="text-gray-300">周波数（音の高さ） ↑</p>
        </div>
      </div>
    </div>
  )
}

export default Spectrogram
