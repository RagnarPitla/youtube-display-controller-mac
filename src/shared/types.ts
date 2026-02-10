export interface TransformState {
  scale: number
  translateX: number
  translateY: number
}

export interface PlaybackState {
  currentTime: number
  duration: number
  isPlaying: boolean
}

export type PlaybackCommand =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'seek'; time: number }
  | { type: 'seekRelative'; delta: number }

export interface DisplayInfo {
  id: number
  label: string
  bounds: { x: number; y: number; width: number; height: number }
}

export type VideoFitMode = 'contain' | 'cover' | 'none'

export interface LoopSettings {
  mode: 'off' | 'infinite' | 'count'
  count: number // only used when mode === 'count'
}

export interface LocalFileInfo {
  name: string
  path: string
  fileUrl: string
  size: number
}
