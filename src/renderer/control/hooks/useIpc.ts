import { useState, useEffect } from 'react'
import type { PlaybackState } from '../../../shared/types'

declare global {
  interface Window {
    controlAPI: {
      sendLoadVideo: (videoId: string) => void
      sendTransform: (t: { scale: number; translateX: number; translateY: number }) => void
      sendPlaybackCommand: (cmd: { type: string; time?: number; delta?: number }) => void
      onPlaybackState: (cb: (state: PlaybackState) => void) => () => void
      onPlayerReady: (cb: () => void) => () => void
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
