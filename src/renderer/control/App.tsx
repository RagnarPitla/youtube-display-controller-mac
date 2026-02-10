import { useState } from 'react'
import UrlInput from './components/UrlInput'
import PreviewBox from './components/PreviewBox'
import PanControls from './components/PanControls'
import ZoomSlider from './components/ZoomSlider'
import TransportBar from './components/TransportBar'
import ScreenSelector from './components/ScreenSelector'
import YouTubeBrowser from './components/YouTubeBrowser'
import LocalFileBrowser from './components/LocalFileBrowser'
import { useControlIpc } from './hooks/useIpc'
import { useTransform } from './hooks/useTransform'

export default function App() {
  const { playbackState, isPlayerReady } = useControlIpc()
  const { transform, setScale, pan, resetCenter, resetAll } = useTransform()
  const [inputMode, setInputMode] = useState<'url' | 'browse' | 'local'>('url')
  const [logoVisible, setLogoVisible] = useState(false)
  const [localFileName, setLocalFileName] = useState<string | null>(null)
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'none'>('contain')
  const [loopMode, setLoopMode] = useState<'off' | 'infinite' | 'count'>('off')
  const [loopCount, setLoopCount] = useState(2)

  const handleToggleLogo = () => {
    const next = !logoVisible
    setLogoVisible(next)
    window.controlAPI.sendShowLogo(next)
  }

  const handleFitMode = (mode: 'contain' | 'cover' | 'none') => {
    setFitMode(mode)
    window.controlAPI.sendVideoFitMode(mode)
  }

  const handleLoopChange = (mode: 'off' | 'infinite' | 'count', count?: number) => {
    setLoopMode(mode)
    const c = count ?? loopCount
    if (count !== undefined) setLoopCount(c)
    window.controlAPI.sendLoopSettings({ mode, count: c })
  }

  const handlePlayLocalFile = (fileUrl: string, fileName: string) => {
    window.controlAPI.sendPlayLocalFile(fileUrl)
    setLocalFileName(fileName)
  }

  return (
    <div className="flex flex-col gap-4 h-full bg-[#1a1a2e] py-4">
      {/* Header */}
      <div className="px-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">YouTube Display Controller</h1>
            <p className="text-xs text-gray-500">
              Output: 2880 x 960 &middot;{' '}
              {isPlayerReady ? (
                <span className="text-green-400">Player ready</span>
              ) : (
                <span className="text-yellow-400">Waiting for player...</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleLogo}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              logoVisible
                ? 'bg-white text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={logoVisible ? 'Hide logo on display' : 'Show logo on display'}
          >
            {logoVisible ? 'LOGO ON' : 'LOGO'}
          </button>
        </div>
        <ScreenSelector />
      </div>

      {/* Input mode toggle */}
      <div className="flex gap-1 px-4">
        {([
          { key: 'url', label: 'URL Input' },
          { key: 'browse', label: 'YouTube' },
          { key: 'local', label: 'Local Files' }
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setInputMode(key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              inputMode === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Local file indicator */}
      {localFileName && inputMode !== 'local' && (
        <div className="px-4">
          <p className="text-xs text-green-400 truncate">Playing: {localFileName}</p>
        </div>
      )}

      {/* Input panels */}
      {inputMode === 'url' && <UrlInput />}
      {inputMode === 'browse' && <YouTubeBrowser />}
      {inputMode === 'local' && <LocalFileBrowser onPlay={handlePlayLocalFile} />}

      {/* Preview */}
      <PreviewBox transform={transform} onPan={pan} fitMode={fitMode} />

      {/* Fit mode + Pan + Zoom controls */}
      <div className="flex gap-1 px-4">
        {(['contain', 'cover', 'none'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleFitMode(mode)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              fitMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {mode === 'contain' ? 'Fit' : mode === 'cover' ? 'Fill' : 'Manual'}
          </button>
        ))}
      </div>
      {fitMode === 'none' && (
        <div className="flex items-start gap-2">
          <PanControls onPan={pan} onResetCenter={resetCenter} onResetAll={resetAll} />
          <ZoomSlider scale={transform.scale} onScaleChange={setScale} />
        </div>
      )}

      {/* Loop controls */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-xs text-gray-400">Loop:</span>
        {(['off', 'infinite', 'count'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleLoopChange(mode)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              loopMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {mode === 'off' ? 'Off' : mode === 'infinite' ? 'Loop' : 'Count'}
          </button>
        ))}
        {loopMode === 'count' && (
          <input
            type="number"
            min={1}
            max={99}
            value={loopCount}
            onChange={(e) => handleLoopChange('count', Math.max(1, parseInt(e.target.value) || 1))}
            title="Number of loops"
            className="w-14 px-2 py-1 rounded text-xs bg-gray-700 text-white border border-gray-600 text-center"
          />
        )}
      </div>

      {/* Transport */}
      <div className="mt-auto">
        <TransportBar playbackState={playbackState} />
      </div>
    </div>
  )
}
