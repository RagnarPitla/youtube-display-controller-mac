import { useRef, useCallback } from 'react'
import type { TransformState } from '../../../shared/types'

interface Props {
  transform: TransformState
  onPan: (dx: number, dy: number) => void
}

// Preview box is 600px wide with 3:1 aspect ratio (matching 2880:960)
const PREVIEW_WIDTH = 600
const PREVIEW_HEIGHT = 200
const DISPLAY_WIDTH = 2880
const SCALE_FACTOR = PREVIEW_WIDTH / DISPLAY_WIDTH // ~0.208

export default function PreviewBox({ transform, onPan }: Props) {
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
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
    [onPan]
  )

  // The video rectangle inside the preview, scaled and translated
  const videoWidth = 3840 * SCALE_FACTOR
  const videoHeight = 2160 * SCALE_FACTOR

  return (
    <div className="px-4">
      <label className="text-sm font-medium text-gray-300 mb-2 block">
        Preview (drag to pan)
      </label>
      <div
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          position: 'relative',
          overflow: 'hidden',
          background: '#000',
          borderRadius: 8,
          border: '2px solid #333',
          cursor: 'grab',
          margin: '0 auto'
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: videoWidth,
            height: videoHeight,
            transform: `translate(-50%, -50%) translate(${transform.translateX * SCALE_FACTOR}px, ${transform.translateY * SCALE_FACTOR}px) scale(${transform.scale})`,
            transformOrigin: 'center center',
            background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 4,
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
    </div>
  )
}
