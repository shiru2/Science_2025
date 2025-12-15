import { useEffect, useRef } from 'react'

interface AudioWaveformProps {
  audioBase64: string
  label: string
  color?: string
}

const AudioWaveform = ({ audioBase64, label, color = 'rgb(147, 51, 234)' }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!audioBase64 || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Base64デコードして音声データを取得
    const decodeAudio = async () => {
      try {
        // Base64をArrayBufferに変換
        const binaryString = atob(audioBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // AudioContextで音声データをデコード
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer)

        // チャンネル0のデータを取得
        const channelData = audioBuffer.getChannelData(0)

        // 波形を描画
        drawWaveform(ctx, canvas, channelData, color)

        // AudioContextをクローズ
        audioContext.close()
      } catch (error) {
        console.error('Error decoding audio:', error)
      }
    }

    decodeAudio()
  }, [audioBase64, color])

  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    audioData: Float32Array,
    strokeColor: string
  ) => {
    // 背景をクリア
    ctx.fillStyle = 'rgb(240, 240, 240)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 中央線を描画
    ctx.strokeStyle = 'rgb(200, 200, 200)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    // 波形を描画
    ctx.lineWidth = 2
    ctx.strokeStyle = strokeColor
    ctx.beginPath()

    // サンプリング（表示用にデータを間引く）
    const step = Math.ceil(audioData.length / canvas.width)
    const amp = canvas.height / 2

    for (let i = 0; i < canvas.width; i++) {
      const dataIndex = i * step
      if (dataIndex >= audioData.length) break

      // サンプル値を取得（-1.0〜1.0の範囲）
      const sample = audioData[dataIndex]
      const x = i
      const y = amp - sample * amp * 0.9 // 0.9は振幅の余裕

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  return (
    <div className="w-full bg-gray-100 rounded-xl overflow-hidden p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={150}
        className="w-full h-auto"
      />
      <p className="text-sm text-gray-600 text-center mt-2">{label}</p>
    </div>
  )
}

export default AudioWaveform
