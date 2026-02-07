import { useState, useEffect } from 'react'
import type { TransformState } from '../../../shared/types'

const defaultTransform: TransformState = {
  scale: 1,
  translateX: 0,
  translateY: 0
}

export function useDisplayIpc() {
  const [transform, setTransform] = useState<TransformState>(defaultTransform)

  useEffect(() => {
    const unsub = window.displayAPI.onTransformUpdate((t) => {
      setTransform(t)
    })
    return unsub
  }, [])

  return { transform }
}
