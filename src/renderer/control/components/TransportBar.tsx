import type { PlaybackState } from '../../../shared/types'

interface Props {
  playbackState: PlaybackState
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function TransportBar({ playbackState }: Props) {
  const { currentTime, duration, isPlaying } = playbackState

  const handlePlayPause = () => {
    window.controlAPI.sendPlaybackCommand({ type: isPlaying ? 'pause' : 'play' })
  }

  const handleSeekBack = () => {
    window.controlAPI.sendPlaybackCommand({ type: 'seekRelative', delta: -10 })
  }

  const handleSeekForward = () => {
    window.controlAPI.sendPlaybackCommand({ type: 'seekRelative', delta: 10 })
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    window.controlAPI.sendPlaybackCommand({ type: 'seek', time })
  }

  const btnClass =
    'w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors'

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-900/50 rounded-lg mx-4">
      {/* Progress scrubber */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-mono w-12">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.5}
          value={currentTime}
          onChange={handleScrub}
          className="flex-1 accent-red-500"
        />
        <span className="text-xs text-gray-400 font-mono w-12 text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Transport buttons */}
      <div className="flex items-center justify-center gap-3">
        <button className={btnClass} onClick={handleSeekBack} title="Back 10s">
          &#9198;
        </button>
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white text-xl transition-colors"
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>
        <button className={btnClass} onClick={handleSeekForward} title="Forward 10s">
          &#9197;
        </button>
      </div>
    </div>
  )
}
