import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { TransformState, PlaybackCommand, PlaybackState, LoopSettings } from '../shared/types'

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
  },
  onShowLogo: (callback: (visible: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, visible: boolean) => callback(visible)
    ipcRenderer.on(IPC.SHOW_LOGO, handler)
    return () => ipcRenderer.removeListener(IPC.SHOW_LOGO, handler)
  },
  onPlayLocalFile: (callback: (fileUrl: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, fileUrl: string) => callback(fileUrl)
    ipcRenderer.on(IPC.PLAY_LOCAL_FILE, handler)
    return () => ipcRenderer.removeListener(IPC.PLAY_LOCAL_FILE, handler)
  },
  onVideoFitMode: (callback: (mode: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, mode: string) => callback(mode)
    ipcRenderer.on(IPC.VIDEO_FIT_MODE, handler)
    return () => ipcRenderer.removeListener(IPC.VIDEO_FIT_MODE, handler)
  },
  onLoopSettings: (callback: (settings: LoopSettings) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, settings: LoopSettings) =>
      callback(settings)
    ipcRenderer.on(IPC.LOOP_SETTINGS, handler)
    return () => ipcRenderer.removeListener(IPC.LOOP_SETTINGS, handler)
  }
}

contextBridge.exposeInMainWorld('displayAPI', displayAPI)

export type DisplayAPI = typeof displayAPI
