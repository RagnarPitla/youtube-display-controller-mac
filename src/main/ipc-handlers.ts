import { ipcMain, BrowserWindow, screen, dialog } from 'electron'
import { pathToFileURL } from 'url'
import { readdir, stat } from 'fs/promises'
import { join, extname } from 'path'
import { IPC } from '../shared/ipc-channels'
import type { DisplayInfo, LocalFileInfo } from '../shared/types'

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v'])

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

  ipcMain.on(IPC.SHOW_LOGO, (_event, visible: boolean) => {
    displayWindow.webContents.send(IPC.SHOW_LOGO, visible)
  })

  // Display -> Control
  ipcMain.on(IPC.PLAYBACK_STATE, (_event, state) => {
    controlWindow.webContents.send(IPC.PLAYBACK_STATE, state)
  })

  ipcMain.on(IPC.PLAYER_READY, () => {
    controlWindow.webContents.send(IPC.PLAYER_READY)
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
    const allDisplays = screen.getAllDisplays()
    const target = allDisplays.find((d) => d.id === displayId)
    if (target) {
      displayWindow.setPosition(target.bounds.x, target.bounds.y)
    }
  })

  // Local file playback
  ipcMain.handle(IPC.OPEN_LOCAL_FILE, async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog(controlWindow, {
      title: 'Open Video File',
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return pathToFileURL(result.filePaths[0]).href.replace('file:', 'local-media:')
  })

  ipcMain.on(IPC.PLAY_LOCAL_FILE, (_event, fileUrl: string) => {
    displayWindow.webContents.send(IPC.PLAY_LOCAL_FILE, fileUrl)
  })

  ipcMain.on(IPC.VIDEO_FIT_MODE, (_event, mode: string) => {
    displayWindow.webContents.send(IPC.VIDEO_FIT_MODE, mode)
  })

  ipcMain.on(IPC.LOOP_SETTINGS, (_event, settings) => {
    displayWindow.webContents.send(IPC.LOOP_SETTINGS, settings)
  })

  // Folder browsing for local files
  ipcMain.handle(IPC.BROWSE_FOLDER, async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog(controlWindow, {
      title: 'Select Video Folder',
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
        if (!VIDEO_EXTENSIONS.has(ext)) continue
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
