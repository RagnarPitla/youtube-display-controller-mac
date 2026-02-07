import { useEffect, useRef, useCallback } from 'react'
import type { PlaybackCommand, PlaybackState } from '../../../shared/types'

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
    displayAPI: {
      onLoadVideo: (cb: (videoId: string) => void) => () => void
      onPlaybackCommand: (cb: (cmd: PlaybackCommand) => void) => () => void
      onTransformUpdate: (cb: (t: { scale: number; translateX: number; translateY: number }) => void) => () => void
      sendPlaybackState: (state: PlaybackState) => void
      sendPlayerReady: () => void
    }
  }
}

export function useYouTubePlayer(containerId: string) {
  const playerRef = useRef<YT.Player | null>(null)
  const pollIntervalRef = useRef<number | null>(null)

  const sendState = useCallback(() => {
    const player = playerRef.current
    if (!player || typeof player.getCurrentTime !== 'function') return
    try {
      const state: PlaybackState = {
        currentTime: player.getCurrentTime(),
        duration: player.getDuration() || 0,
        isPlaying: player.getPlayerState() === YT.PlayerState.PLAYING
      }
      window.displayAPI.sendPlaybackState(state)
    } catch {
      // Player not ready yet
    }
  }, [])

  useEffect(() => {
    let apiReady = false

    const initPlayer = (videoId?: string) => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }

      playerRef.current = new YT.Player(containerId, {
        width: '3840',
        height: '2160',
        videoId: videoId || undefined,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            window.displayAPI.sendPlayerReady()
            // Start polling playback state
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = window.setInterval(sendState, 250)
          },
          onStateChange: () => {
            sendState()
          }
        }
      })
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true
      initPlayer()
    }

    // Listen for video load commands
    const unsubVideo = window.displayAPI.onLoadVideo((videoId: string) => {
      if (apiReady && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(videoId)
      } else if (apiReady) {
        initPlayer(videoId)
      }
    })

    // Listen for playback commands
    const unsubPlayback = window.displayAPI.onPlaybackCommand((cmd: PlaybackCommand) => {
      const player = playerRef.current
      if (!player) return
      switch (cmd.type) {
        case 'play':
          player.playVideo()
          break
        case 'pause':
          player.pauseVideo()
          break
        case 'seek':
          player.seekTo(cmd.time, true)
          break
        case 'seekRelative':
          player.seekTo(player.getCurrentTime() + cmd.delta, true)
          break
      }
    })

    return () => {
      unsubVideo()
      unsubPlayback()
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (playerRef.current) playerRef.current.destroy()
    }
  }, [containerId, sendState])
}
