import { useState, useEffect } from 'react'
import type { TransformState, VideoFitMode } from '../../../shared/types'

const defaultTransform: TransformState = {
  scale: 1,
  translateX: 0,
  translateY: 0
}

export function useDisplayIpc() {
  const [transform, setTransform] = useState<TransformState>(defaultTransform)
  const [showLogo, setShowLogo] = useState(true)
  const [localFileUrl, setLocalFileUrl] = useState<string | null>(null)
  const [fitMode, setFitMode] = useState<VideoFitMode>('contain')

  useEffect(() => {
    const unsubTransform = window.displayAPI.onTransformUpdate((t) => {
      setTransform(t)
    })
    const unsubLogo = window.displayAPI.onShowLogo((visible) => {
      setShowLogo(visible)
    })
    const unsubLocalFile = window.displayAPI.onPlayLocalFile((fileUrl) => {
      setLocalFileUrl(fileUrl)
    })
    const unsubLoadVideo = window.displayAPI.onLoadVideo(() => {
      setLocalFileUrl(null)
    })
    const unsubFitMode = window.displayAPI.onVideoFitMode((mode) => {
      setFitMode(mode as VideoFitMode)
    })
    return () => {
      unsubTransform()
      unsubLogo()
      unsubLocalFile()
      unsubLoadVideo()
      unsubFitMode()
    }
  }, [])

  return { transform, showLogo, localFileUrl, fitMode }
}
