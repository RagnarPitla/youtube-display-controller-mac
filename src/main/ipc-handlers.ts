import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from '../shared/ipc-channels'

export function registerIpcHandlers(
  controlWindow: BrowserWindow,
  displayWindow: BrowserWindow
): void {
  // Control -> Display
  ipcMain.on(IPC.LOAD_VIDEO, (_event, videoId: string) => {
    displayWindow.webContents.send(IPC.LOAD_VIDEO, videoId)
  })

  ipcMain.on(IPC.TRANSFORM_UPDATE, (_event, transform) => {
    displayWindow.webContents.send(IPC.TRANSFORM_UPDATE, transform)
  })

  ipcMain.on(IPC.PLAYBACK_COMMAND, (_event, command) => {
    displayWindow.webContents.send(IPC.PLAYBACK_COMMAND, command)
  })

  // Display -> Control
  ipcMain.on(IPC.PLAYBACK_STATE, (_event, state) => {
    controlWindow.webContents.send(IPC.PLAYBACK_STATE, state)
  })

  ipcMain.on(IPC.PLAYER_READY, () => {
    controlWindow.webContents.send(IPC.PLAYER_READY)
  })
}
