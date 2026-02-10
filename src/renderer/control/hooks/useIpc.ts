import { useState, useEffect } from 'react'
import type { PlaybackState, DisplayInfo, LoopSettings, LocalFileInfo } from '../../../shared/types'

declare global {
  interface Window {
    controlAPI: {
      sendLoadVideo: (videoId: string) => void
      sendTransform: (t: { scale: number; translateX: number; translateY: number }) => void
      sendPlaybackCommand: (cmd: { type: string; time?: number; delta?: number }) => void
      onPlaybackState: (cb: (state: PlaybackState) => void) => () => void
      onPlayerReady: (cb: () => void) => () => void
      getDisplays: () => Promise<DisplayInfo[]>
      moveToDisplay: (displayId: number) => void
      sendShowLogo: (visible: boolean) => void
      openLocalFile: () => Promise<string | null>
      sendPlayLocalFile: (fileUrl: string) => void
      sendVideoFitMode: (mode: string) => void
      sendLoopSettings: (settings: LoopSettings) => void
      browseFolder: () => Promise<string | null>
      scanFolder: (folderPath: string) => Promise<LocalFileInfo[]>
      pathToMediaUrl: (filePath: string) => string
    }
  }
}

export function useControlIpc() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false
  })
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  useEffect(() => {
    const unsubState = window.controlAPI.onPlaybackState((state) => {
      setPlaybackState(state)
    })
    const unsubReady = window.controlAPI.onPlayerReady(() => {
      setIsPlayerReady(true)
    })
    return () => {
      unsubState()
      unsubReady()
    }
  }, [])

  return { playbackState, isPlayerReady }
}
