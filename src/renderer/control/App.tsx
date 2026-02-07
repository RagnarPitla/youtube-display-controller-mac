import UrlInput from './components/UrlInput'
import PreviewBox from './components/PreviewBox'
import PanControls from './components/PanControls'
import ZoomSlider from './components/ZoomSlider'
import TransportBar from './components/TransportBar'
import { useControlIpc } from './hooks/useIpc'
import { useTransform } from './hooks/useTransform'

export default function App() {
  const { playbackState, isPlayerReady } = useControlIpc()
  const { transform, setScale, pan, resetCenter, resetAll } = useTransform()

  return (
    <div className="flex flex-col gap-4 h-full bg-[#1a1a2e] py-4">
      {/* Header */}
      <div className="px-4">
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

      {/* URL Input */}
      <UrlInput />

      {/* Preview */}
      <PreviewBox transform={transform} onPan={pan} />

      {/* Pan + Zoom controls */}
      <div className="flex items-start gap-2">
        <PanControls onPan={pan} onResetCenter={resetCenter} onResetAll={resetAll} />
        <ZoomSlider scale={transform.scale} onScaleChange={setScale} />
      </div>

      {/* Transport */}
      <div className="mt-auto">
        <TransportBar playbackState={playbackState} />
      </div>
    </div>
  )
}
