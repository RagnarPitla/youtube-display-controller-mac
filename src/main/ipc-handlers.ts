import { ipcMain, BrowserWindow, screen, dialog } from 'electron'
import { pathToFileURL } from 'url'
import { readdir, stat } from 'fs/promises'
import { join, extname } from 'path'
import { IPC } from '../shared/ipc-channels'
import type { DisplayInfo, LocalFileInfo } from '../shared/types'

const MEDIA_EXTENSIONS = new Set([
  // Video
  '.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v', '.m4p', '.mpg', '.mpeg', '.wmv', '.flv',
  // Image
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.svg'
])

export function registerIpcHandlers(
  controlWindow: BrowserWindow,
  displayWindow: BrowserWindow
): void {
  const sendToDisplay = (channel: string, ...args: unknown[]) => {
    if (!displayWindow.isDestroyed()) {
      displayWindow.webContents.send(channel, ...args)
    }
  }

  const sendToControl = (channel: string, ...args: unknown[]) => {
    if (!controlWindow.isDestroyed()) {
      controlWindow.webContents.send(channel, ...args)
    }
  }

  // Control -> Display
  ipcMain.on(IPC.LOAD_VIDEO, (_event, videoId: string) => {
    sendToDisplay(IPC.LOAD_VIDEO, videoId)
  })

  ipcMain.on(IPC.TRANSFORM_UPDATE, (_event, transform) => {
    sendToDisplay(IPC.TRANSFORM_UPDATE, transform)
  })

  ipcMain.on(IPC.PLAYBACK_COMMAND, (_event, command) => {
    sendToDisplay(IPC.PLAYBACK_COMMAND, command)
  })

  ipcMain.on(IPC.SHOW_LOGO, (_event, visible: boolean) => {
    sendToDisplay(IPC.SHOW_LOGO, visible)
  })

  // Display -> Control
  ipcMain.on(IPC.PLAYBACK_STATE, (_event, state) => {
    sendToControl(IPC.PLAYBACK_STATE, state)
  })

  ipcMain.on(IPC.PLAYER_READY, () => {
    sendToControl(IPC.PLAYER_READY)
  })

  // Screen management
  ipcMain.handle(IPC.GET_DISPLAYS, (): DisplayInfo[] => {
    const allDisplays = screen.getAllDisplays()
    const primary = screen.getPrimaryDisplay()
    return allDisplays.map((d, i) => ({
      id: d.id,
      label: `Display ${i + 1}${d.id === primary.id ? ' (Primary)' : ''} — ${d.bounds.width}×${d.bounds.height}`,
      bounds: d.bounds
    }))
  })

  ipcMain.on(IPC.MOVE_TO_DISPLAY, (_event, displayId: number) => {
    if (displayWindow.isDestroyed()) return
    const allDisplays = screen.getAllDisplays()
    const target = allDisplays.find((d) => d.id === displayId)
    if (target) {
      displayWindow.setPosition(target.bounds.x, target.bounds.y)
    }
  })

  // Local file playback
  ipcMain.handle(IPC.OPEN_LOCAL_FILE, async (): Promise<string | null> => {
    if (controlWindow.isDestroyed()) return null
    const result = await dialog.showOpenDialog(controlWindow, {
      title: 'Open Media File',
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'mpg', 'mpeg', 'wmv', 'flv', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return pathToFileURL(result.filePaths[0]).href.replace('file:', 'local-media:')
  })

  ipcMain.on(IPC.PLAY_LOCAL_FILE, (_event, fileUrl: string) => {
    sendToDisplay(IPC.PLAY_LOCAL_FILE, fileUrl)
  })

  ipcMain.on(IPC.VIDEO_FIT_MODE, (_event, mode: string) => {
    sendToDisplay(IPC.VIDEO_FIT_MODE, mode)
  })

  ipcMain.on(IPC.LOOP_SETTINGS, (_event, settings) => {
    sendToDisplay(IPC.LOOP_SETTINGS, settings)
  })

  ipcMain.on(IPC.VOLUME_CHANGE, (_event, volume: number) => {
    sendToDisplay(IPC.VOLUME_CHANGE, volume)
  })

  ipcMain.on(IPC.SET_ALWAYS_ON_TOP, (_event, enabled: boolean) => {
    if (!controlWindow.isDestroyed()) {
      controlWindow.setAlwaysOnTop(enabled)
    }
  })

  // Folder browsing for local files
  ipcMain.handle(IPC.BROWSE_FOLDER, async (): Promise<string | null> => {
    if (controlWindow.isDestroyed()) return null
    const result = await dialog.showOpenDialog(controlWindow, {
      title: 'Select Media Folder',
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle(IPC.SCAN_FOLDER, async (_event, folderPath: string): Promise<LocalFileInfo[]> => {
    const files: LocalFileInfo[] = []
    try {
      const entries = await readdir(folderPath)
      for (const entry of entries) {
        const ext = extname(entry).toLowerCase()
        if (!MEDIA_EXTENSIONS.has(ext)) continue
        const fullPath = join(folderPath, entry)
        const info = await stat(fullPath)
        if (info.isFile()) {
          files.push({
            name: entry,
            path: fullPath,
            fileUrl: pathToFileURL(fullPath).href.replace('file:', 'local-media:'),
            size: info.size
          })
        }
      }
    } catch {
      // Folder not readable
    }
    return files.sort((a, b) => a.name.localeCompare(b.name))
  })
}
