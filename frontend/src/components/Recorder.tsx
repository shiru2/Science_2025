import { useState, useRef } from 'react'
import axios from 'axios'
import Waveform from './Waveform'

interface RecorderProps {
  onAudioLoaded: (data: any) => void
}

const Recorder = ({ onAudioLoaded }: RecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // 録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // MediaRecorderの実際のMIMEタイプを使用
        const mimeType = mediaRecorder.mimeType
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        await uploadAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
        setAudioStream(null)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。')
    }
  }

  // 録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // 音声をアップロード
  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.wav')

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        onAudioLoaded(response.data.data)
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      alert('音声のアップロード中にエラーが発生しました')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 波形表示 */}
      <Waveform audioStream={audioStream} isRecording={isRecording} />

      {/* 録音ボタン */}
      <div className="flex justify-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isUploading}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 px-12 py-6 rounded-2xl text-2xl font-bold text-white transition-all transform hover:scale-105 disabled:scale-100 shadow-xl flex items-center gap-4"
          >
            <span className="text-3xl">🎤</span>
            録音開始
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-700 hover:bg-gray-800 px-12 py-6 rounded-2xl text-2xl font-bold text-white transition-all flex items-center gap-4 animate-pulse shadow-xl"
          >
            <span className="text-3xl">⏹️</span>
            録音停止
          </button>
        )}
      </div>

      {isUploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">処理中...</p>
        </div>
      )}

      <div className="text-sm text-gray-600 text-center bg-blue-50 border border-blue-300 rounded-lg p-4">
        <p className="font-bold mb-1">💡 ヒント</p>
        <p>「あー」と3秒ほど声を出してみましょう！</p>
      </div>
    </div>
  )
}

export default Recorder
