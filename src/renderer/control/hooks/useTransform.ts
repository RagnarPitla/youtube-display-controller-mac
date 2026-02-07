import { useState, useCallback, useEffect } from 'react'
import type { TransformState } from '../../../shared/types'

const DEFAULT_TRANSFORM: TransformState = {
  scale: 1,
  translateX: 0,
  translateY: 0
}

export function useTransform() {
  const [transform, setTransform] = useState<TransformState>(DEFAULT_TRANSFORM)

  // Sync transform to display window whenever it changes
  useEffect(() => {
    window.controlAPI.sendTransform(transform)
  }, [transform])

  const setScale = useCallback((scale: number) => {
    setTransform((prev) => ({ ...prev, scale: Math.max(0.5, Math.min(3, scale)) }))
  }, [])

  const pan = useCallback((dx: number, dy: number) => {
    setTransform((prev) => ({
      ...prev,
      translateX: prev.translateX + dx,
      translateY: prev.translateY + dy
    }))
  }, [])

  const setPan = useCallback((x: number, y: number) => {
    setTransform((prev) => ({ ...prev, translateX: x, translateY: y }))
  }, [])

  const resetCenter = useCallback(() => {
    setTransform((prev) => ({ ...prev, translateX: 0, translateY: 0 }))
  }, [])

  const resetAll = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM)
  }, [])

  return { transform, setScale, pan, setPan, resetCenter, resetAll }
}
