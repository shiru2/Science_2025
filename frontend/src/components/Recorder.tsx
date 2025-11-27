import { useState, useRef } from 'react'
import axios from 'axios'

interface RecorderProps {
  onAudioLoaded: (data: any) => void
}

const Recorder = ({ onAudioLoaded }: RecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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

  // ファイルアップロード
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadAudio(file)
  }

  // テスト音声を読み込み
  const loadTestAudio = async () => {
    setIsUploading(true)
    try {
      const response = await axios.get('/api/test-audio')

      if (response.data.success) {
        onAudioLoaded(response.data.data)
      }
    } catch (error) {
      console.error('Error loading test audio:', error)
      alert('テスト音声の読み込み中にエラーが発生しました')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* 録音ボタン */}
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isUploading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 px-8 py-4 rounded-lg text-lg font-bold transition-colors flex items-center gap-3"
          >
            <span className="text-2xl">🎤</span>
            録音開始
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-700 hover:bg-gray-800 px-8 py-4 rounded-lg text-lg font-bold transition-colors flex items-center gap-3 animate-pulse"
          >
            <span className="text-2xl">⏹️</span>
            録音停止
          </button>
        )}

        {/* ファイル選択ボタン */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRecording}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 px-8 py-4 rounded-lg text-lg font-bold transition-colors flex items-center gap-3"
        >
          <span className="text-2xl">📁</span>
          ファイル選択
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* テスト音声ボタン */}
        <button
          onClick={loadTestAudio}
          disabled={isUploading || isRecording}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 px-8 py-4 rounded-lg text-lg font-bold transition-colors flex items-center gap-3"
        >
          <span className="text-2xl">🧪</span>
          テスト音声
        </button>
      </div>

      {isUploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-2 text-gray-300">処理中...</p>
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        <p>💡 録音またはファイルを選択して、声を分析してみよう！</p>
      </div>
    </div>
  )
}

export default Recorder
