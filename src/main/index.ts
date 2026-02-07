import { app, BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'

let controlWindow: BrowserWindow | null = null
let displayWindow: BrowserWindow | null = null

function createWindows(): void {
  // Control window - standard window for the operator
  controlWindow = new BrowserWindow({
    width: 850,
    height: 700,
    title: 'YouTube Display Controller',
    webPreferences: {
      preload: join(__dirname, '../preload/control.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Display window - frameless, meant for external ultrawide monitor
  displayWindow = new BrowserWindow({
    width: 2880,
    height: 960,
    frame: false,
    resizable: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, '../preload/display.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Try to position display window on external monitor
  const displays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()
  const externalDisplay = displays.find(
    (d) => d.id !== primaryDisplay.id
  )
  if (externalDisplay) {
    displayWindow.setPosition(
      externalDisplay.bounds.x,
      externalDisplay.bounds.y
    )
  }

  // Register IPC relay between windows
  registerIpcHandlers(controlWindow, displayWindow)

  // Load renderer pages
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    controlWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/control/`)
    displayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/display/`)
  } else {
    controlWindow.loadFile(join(__dirname, '../renderer/control/index.html'))
    displayWindow.loadFile(join(__dirname, '../renderer/display/index.html'))
  }

  // Close both windows together
  controlWindow.on('closed', () => {
    controlWindow = null
    if (displayWindow && !displayWindow.isDestroyed()) {
      displayWindow.close()
    }
  })

  displayWindow.on('closed', () => {
    displayWindow = null
  })
}

app.whenReady().then(() => {
  createWindows()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
