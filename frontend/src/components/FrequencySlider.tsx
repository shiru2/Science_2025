interface FrequencySliderProps {
  maxFrequency: number
  lowCut: number | null
  highCut: number | null
  onLowCutChange: (value: number | null) => void
  onHighCutChange: (value: number | null) => void
}

const FrequencySlider = ({
  maxFrequency,
  lowCut,
  highCut,
  onLowCutChange,
  onHighCutChange,
}: FrequencySliderProps) => {
  const formatFrequency = (freq: number | null) => {
    if (freq === null) return 'なし'
    if (freq >= 1000) return `${(freq / 1000).toFixed(1)} kHz`
    return `${freq.toFixed(0)} Hz`
  }

  return (
    <div className="space-y-8">
      {/* ローカットフィルター（低い周波数をカット） */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xl font-bold">🔻 ローカット（低音を削除）</label>
          <span className="text-2xl font-mono bg-blue-500/30 px-4 py-2 rounded-lg">
            {formatFrequency(lowCut)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max={maxFrequency}
            step="10"
            value={lowCut || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              onLowCutChange(value > 0 ? value : null)
            }}
            className="flex-1 h-3 bg-gradient-to-r from-gray-700 to-blue-500 rounded-lg appearance-none cursor-pointer slider"
          />
          <button
            onClick={() => onLowCutChange(null)}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            リセット
          </button>
        </div>
        <p className="text-base text-gray-700">
          ✂️ スライダーを右に動かすと、低い音（低周波数）がカットされます
        </p>
      </div>

      {/* ハイカットフィルター（高い周波数をカット） */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xl font-bold">🔺 ハイカット（高音を削除）</label>
          <span className="text-2xl font-mono bg-purple-500/30 px-4 py-2 rounded-lg">
            {formatFrequency(highCut)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max={maxFrequency}
            step="10"
            value={highCut || maxFrequency}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              onHighCutChange(value < maxFrequency ? value : null)
            }}
            className="flex-1 h-3 bg-gradient-to-r from-purple-500 to-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <button
            onClick={() => onHighCutChange(null)}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            リセット
          </button>
        </div>
        <p className="text-base text-gray-700">
          ✂️ スライダーを左に動かすと、高い音（高周波数）がカットされます
        </p>
      </div>

      {/* フィルター範囲の表示 */}
      {(lowCut || highCut) && (
        <div className="bg-green-500/20 p-4 rounded-lg">
          <p className="text-lg font-bold mb-2">現在の設定</p>
          <p className="text-gray-300">
            {lowCut && `${formatFrequency(lowCut)}より低い音を削除`}
            {lowCut && highCut && ' + '}
            {highCut && `${formatFrequency(highCut)}より高い音を削除`}
          </p>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}

export default FrequencySlider
