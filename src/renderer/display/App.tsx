import { useMemo, useState, useEffect } from 'react'
import YouTubePlayer from './components/YouTubePlayer'
import LocalVideoPlayer from './components/LocalVideoPlayer'
import Clock from './components/Clock'
import { useDisplayIpc } from './hooks/useIpc'
import breatheLogo from './assets/breathe-logo.jpg'

// YouTube player is 3840x2160, display is 2880x960
const PLAYER_W = 3840
const PLAYER_H = 2160

export default function App() {
  const { transform, showLogo, localFileUrl, fitMode } = useDisplayIpc()

  // Track window size reactively so fit calculations update on resize/move
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Compute YouTube wrapper scale based on fitMode
  const ytStyle = useMemo(() => {
    // Base: viewport is 100vw x 100vh (2880x960)
    // contain: fit entire player in viewport
    // cover: fill viewport, crop overflow
    // none: use manual transform only
    if (fitMode === 'contain') {
      // Scale so entire 16:9 player fits in 3:1 viewport
      const scaleX = windowSize.w / PLAYER_W
      const scaleY = windowSize.h / PLAYER_H
      const s = Math.min(scaleX, scaleY)
      return {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${s})`,
        transformOrigin: 'center center',
        width: `${PLAYER_W}px`,
        height: `${PLAYER_H}px`
      }
    }
    if (fitMode === 'cover') {
      // Scale so player covers entire viewport
      const scaleX = windowSize.w / PLAYER_W
      const scaleY = windowSize.h / PLAYER_H
      const s = Math.max(scaleX, scaleY)
      return {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${s})`,
        transformOrigin: 'center center',
        width: `${PLAYER_W}px`,
        height: `${PLAYER_H}px`
      }
    }
    // 'none' - use manual transform
    return {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: 'center center',
      width: `${PLAYER_W}px`,
      height: `${PLAYER_H}px`
    }
  }, [fitMode, transform, windowSize])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        position: 'relative'
      }}
    >
      <div style={ytStyle}>
        <YouTubePlayer active={!localFileUrl} />
      </div>

      {localFileUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            background: '#000'
          }}
        >
          <LocalVideoPlayer fileUrl={localFileUrl} fitMode={fitMode} />
        </div>
      )}

      {showLogo && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={breatheLogo}
            alt="Breathe"
            style={{
              width: '2880px',
              height: '960px',
              objectFit: 'contain'
            }}
          />
        </div>
      )}

      <Clock />
    </div>
  )
}
