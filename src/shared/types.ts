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
