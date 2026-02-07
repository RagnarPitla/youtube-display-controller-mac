import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { TransformState, PlaybackCommand, PlaybackState } from '../shared/types'

const controlAPI = {
  sendLoadVideo: (videoId: string) => {
    ipcRenderer.send(IPC.LOAD_VIDEO, videoId)
  },
  sendTransform: (transform: TransformState) => {
    ipcRenderer.send(IPC.TRANSFORM_UPDATE, transform)
  },
  sendPlaybackCommand: (command: PlaybackCommand) => {
    ipcRenderer.send(IPC.PLAYBACK_COMMAND, command)
  },
  onPlaybackState: (callback: (state: PlaybackState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: PlaybackState) => callback(state)
    ipcRenderer.on(IPC.PLAYBACK_STATE, handler)
    return () => ipcRenderer.removeListener(IPC.PLAYBACK_STATE, handler)
  },
  onPlayerReady: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IPC.PLAYER_READY, handler)
    return () => ipcRenderer.removeListener(IPC.PLAYER_READY, handler)
  }
}

contextBridge.exposeInMainWorld('controlAPI', controlAPI)

export type ControlAPI = typeof controlAPI
