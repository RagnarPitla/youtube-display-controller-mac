import { contextBridge, ipcRenderer } from 'electron'
import { pathToFileURL } from 'url'
import { IPC } from '../shared/ipc-channels'
import type { TransformState, PlaybackCommand, PlaybackState, DisplayInfo, LoopSettings, LocalFileInfo } from '../shared/types'

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
  },
  getDisplays: (): Promise<DisplayInfo[]> => {
    return ipcRenderer.invoke(IPC.GET_DISPLAYS)
  },
  moveToDisplay: (displayId: number) => {
    ipcRenderer.send(IPC.MOVE_TO_DISPLAY, displayId)
  },
  sendShowLogo: (visible: boolean) => {
    ipcRenderer.send(IPC.SHOW_LOGO, visible)
  },
  openLocalFile: (): Promise<string | null> => {
    return ipcRenderer.invoke(IPC.OPEN_LOCAL_FILE)
  },
  sendPlayLocalFile: (fileUrl: string) => {
    ipcRenderer.send(IPC.PLAY_LOCAL_FILE, fileUrl)
  },
  sendVideoFitMode: (mode: string) => {
    ipcRenderer.send(IPC.VIDEO_FIT_MODE, mode)
  },
  sendLoopSettings: (settings: LoopSettings) => {
    ipcRenderer.send(IPC.LOOP_SETTINGS, settings)
  },
  sendVolume: (volume: number) => {
    ipcRenderer.send(IPC.VOLUME_CHANGE, volume)
  },
  setAlwaysOnTop: (enabled: boolean) => {
    ipcRenderer.send(IPC.SET_ALWAYS_ON_TOP, enabled)
  },
  browseFolder: (): Promise<string | null> => {
    return ipcRenderer.invoke(IPC.BROWSE_FOLDER)
  },
  scanFolder: (folderPath: string): Promise<LocalFileInfo[]> => {
    return ipcRenderer.invoke(IPC.SCAN_FOLDER, folderPath)
  },
  pathToMediaUrl: (filePath: string): string => {
    return pathToFileURL(filePath).href.replace('file:', 'local-media:')
  }
}

contextBridge.exposeInMainWorld('controlAPI', controlAPI)

export type ControlAPI = typeof controlAPI
