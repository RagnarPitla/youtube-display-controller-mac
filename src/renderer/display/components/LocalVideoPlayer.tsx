import { useEffect, useRef, useCallback } from 'react'
import type { PlaybackCommand, PlaybackState, VideoFitMode, LoopSettings } from '../../../shared/types'

interface Props {
  fileUrl: string
  fitMode: VideoFitMode
}

export default function LocalVideoPlayer({ fileUrl, fitMode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pollIntervalRef = useRef<number | null>(null)
  const loopRef = useRef<LoopSettings>({ mode: 'off', count: 1 })
  const loopCounterRef = useRef(0)

  const sendState = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const state: PlaybackState = {
      currentTime: video.currentTime,
      duration: video.duration || 0,
      isPlaying: !video.paused && !video.ended
    }
    window.displayAPI.sendPlaybackState(state)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    loopCounterRef.current = 0

    // Start polling playback state
    pollIntervalRef.current = window.setInterval(sendState, 250)

    const handleCanPlay = () => {
      sendState()
    }
    video.addEventListener('canplay', handleCanPlay)

    // Handle loop on video end
    const handleEnded = () => {
      const loop = loopRef.current
      if (loop.mode === 'infinite') {
        video.currentTime = 0
        video.play()
      } else if (loop.mode === 'count') {
        loopCounterRef.current++
        if (loopCounterRef.current < loop.count) {
          video.currentTime = 0
          video.play()
        }
      }
    }
    video.addEventListener('ended', handleEnded)

    // Listen for playback commands
    const unsubPlayback = window.displayAPI.onPlaybackCommand((cmd: PlaybackCommand) => {
      if (!video) return
      switch (cmd.type) {
        case 'play':
          video.play()
          break
        case 'pause':
          video.pause()
          break
        case 'seek':
          video.currentTime = cmd.time
          break
        case 'seekRelative':
          video.currentTime = video.currentTime + cmd.delta
          break
      }
    })

    // Listen for loop settings
    const unsubLoop = window.displayAPI.onLoopSettings((settings) => {
      loopRef.current = settings
      loopCounterRef.current = 0
    })

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('ended', handleEnded)
      unsubPlayback()
      unsubLoop()
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [sendState])

  return (
    <video
      ref={videoRef}
      src={fileUrl}
      autoPlay
      style={{
        width: '100%',
        height: '100%',
        objectFit: fitMode === 'none' ? 'none' : fitMode,
        background: '#000'
      }}
    />
  )
}
