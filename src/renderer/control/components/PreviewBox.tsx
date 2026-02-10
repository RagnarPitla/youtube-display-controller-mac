import { useRef, useCallback, useMemo } from 'react'
import type { TransformState, VideoFitMode } from '../../../shared/types'

interface Props {
  transform: TransformState
  onPan: (dx: number, dy: number) => void
  fitMode: VideoFitMode
}

// Preview box matches 2880:960 (3:1) display aspect ratio
const PREVIEW_WIDTH = 600
const PREVIEW_HEIGHT = 200
const DISPLAY_WIDTH = 2880
const DISPLAY_HEIGHT = 960
const SCALE_FACTOR = PREVIEW_WIDTH / DISPLAY_WIDTH // ~0.208

// Source video assumed 16:9 (same as YouTube player)
const PLAYER_W = 3840
const PLAYER_H = 2160

export default function PreviewBox({ transform, onPan, fitMode }: Props) {
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const isManual = fitMode === 'none'

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isManual) return
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return
        const dx = (ev.clientX - lastPos.current.x) / SCALE_FACTOR
        const dy = (ev.clientY - lastPos.current.y) / SCALE_FACTOR
        lastPos.current = { x: ev.clientX, y: ev.clientY }
        onPan(dx, dy)
      }

      const handleMouseUp = () => {
        isDragging.current = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [isManual, onPan]
  )

  // Compute video rect in preview coordinates based on fit mode
  const pv = useMemo(() => {
    let s: number, tx = 0, ty = 0

    if (fitMode === 'contain') {
      s = Math.min(DISPLAY_WIDTH / PLAYER_W, DISPLAY_HEIGHT / PLAYER_H)
    } else if (fitMode === 'cover') {
      s = Math.max(DISPLAY_WIDTH / PLAYER_W, DISPLAY_HEIGHT / PLAYER_H)
    } else {
      s = transform.scale
      tx = transform.translateX
      ty = transform.translateY
    }

    const w = PLAYER_W * s
    const h = PLAYER_H * s
    const x = (DISPLAY_WIDTH - w) / 2 + tx
    const y = (DISPLAY_HEIGHT - h) / 2 + ty

    return {
      x: x * SCALE_FACTOR,
      y: y * SCALE_FACTOR,
      w: w * SCALE_FACTOR,
      h: h * SCALE_FACTOR
    }
  }, [fitMode, transform])

  // Check if video extends beyond viewport (i.e. content is being cropped)
  const hasCrop =
    pv.x < -0.5 ||
    pv.y < -0.5 ||
    pv.x + pv.w > PREVIEW_WIDTH + 0.5 ||
    pv.y + pv.h > PREVIEW_HEIGHT + 0.5

  return (
    <div className="px-4">
      <label className="text-sm font-medium text-gray-300 mb-2 block">
        Preview{isManual ? ' (drag to pan)' : ''}
        {hasCrop && <span className="text-red-400 ml-2 text-xs">Red = cropped</span>}
      </label>
      <div
        style={{
          position: 'relative',
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          margin: hasCrop ? '30px auto' : '0 auto',
          cursor: isManual ? 'grab' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Full video rect with red tint — visible outside viewport to show cropped area */}
        {hasCrop && (
          <div
            style={{
              position: 'absolute',
              left: pv.x,
              top: pv.y,
              width: pv.w,
              height: pv.h,
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px dashed rgba(239, 68, 68, 0.5)',
              borderRadius: 4,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}

        {/* Viewport area — black background with video clipped to visible bounds */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            borderRadius: 8,
            overflow: 'hidden',
            zIndex: 2
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: pv.x,
              top: pv.y,
              width: pv.w,
              height: pv.h,
              background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 14,
                fontWeight: 600,
                userSelect: 'none'
              }}
            >
              VIDEO
            </span>
          </div>
        </div>

        {/* Viewport border — red when cropping, gray when not */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: `2px solid ${hasCrop ? '#ef4444' : '#333'}`,
            borderRadius: 8,
            pointerEvents: 'none',
            zIndex: 3
          }}
        />
      </div>
    </div>
  )
}
