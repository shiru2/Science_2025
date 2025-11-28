import { useEffect, useRef } from 'react'

interface WaveformProps {
  audioStream: MediaStream | null
  isRecording: boolean
}

const Waveform = ({ audioStream, isRecording }: WaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const audioContextRef = useRef<AudioContext>()

  useEffect(() => {
    if (!audioStream || !isRecording) {
      // 録音していない時はクリア
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
      return
    }

    // Web Audio API のセットアップ
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(audioStream)

    analyser.fftSize = 2048
    source.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isRecording || !analyserRef.current) return

      animationRef.current = requestAnimationFrame(draw)

      analyserRef.current.getByteTimeDomainData(dataArray)

      // 背景をクリア
      ctx.fillStyle = 'rgb(240, 240, 240)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 波形を描画
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgb(147, 51, 234)' // 紫色
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * (canvas.height / 2)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [audioStream, isRecording])

  return (
    <div className="w-full bg-gray-100 rounded-xl overflow-hidden p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={150}
        className="w-full h-auto"
      />
      <p className="text-sm text-gray-600 text-center mt-2">
        {isRecording ? '🎤 録音中の波形' : '波形がここに表示されます'}
      </p>
    </div>
  )
}

export default Waveform
