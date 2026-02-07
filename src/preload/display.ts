import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { TransformState, PlaybackCommand, PlaybackState } from '../shared/types'

const displayAPI = {
  onLoadVideo: (callback: (videoId: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, videoId: string) => callback(videoId)
    ipcRenderer.on(IPC.LOAD_VIDEO, handler)
    return () => ipcRenderer.removeListener(IPC.LOAD_VIDEO, handler)
  },
  onTransformUpdate: (callback: (transform: TransformState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, transform: TransformState) =>
      callback(transform)
    ipcRenderer.on(IPC.TRANSFORM_UPDATE, handler)
    return () => ipcRenderer.removeListener(IPC.TRANSFORM_UPDATE, handler)
  },
  onPlaybackCommand: (callback: (command: PlaybackCommand) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, command: PlaybackCommand) =>
      callback(command)
    ipcRenderer.on(IPC.PLAYBACK_COMMAND, handler)
    return () => ipcRenderer.removeListener(IPC.PLAYBACK_COMMAND, handler)
  },
  sendPlaybackState: (state: PlaybackState) => {
    ipcRenderer.send(IPC.PLAYBACK_STATE, state)
  },
  sendPlayerReady: () => {
    ipcRenderer.send(IPC.PLAYER_READY)
  }
}

contextBridge.exposeInMainWorld('displayAPI', displayAPI)

export type DisplayAPI = typeof displayAPI
