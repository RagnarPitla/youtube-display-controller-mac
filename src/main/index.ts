import { app, BrowserWindow, screen, protocol, net } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'

// Register custom protocol for serving local media files
// Must be called before app.whenReady()
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-media',
    privileges: {
      standard: true,
      secure: true,
      stream: true,
      bypassCSP: true,
      supportFetchAPI: true
    }
  }
])

let controlWindow: BrowserWindow | null = null
let displayWindow: BrowserWindow | null = null

function createWindows(): void {
  // Control window - standard window for the operator
  controlWindow = new BrowserWindow({
    width: 850,
    height: 850,
    title: 'BreathEva Player',
    webPreferences: {
      preload: join(__dirname, '../preload/control.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true
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

  // Make display window non-interactive (ignore all mouse events)
  displayWindow.setIgnoreMouseEvents(true)

  // Default control window to always-on-top
  controlWindow.setAlwaysOnTop(true)

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
    // Open DevTools on display window in dev mode for debugging
    displayWindow.webContents.openDevTools({ mode: 'detach' })
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
    displayWindow = null
  })

  displayWindow.on('closed', () => {
    displayWindow = null
    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.close()
    }
    controlWindow = null
  })
}

app.whenReady().then(() => {
  // Handle local-media:// protocol requests by serving local files
  protocol.handle('local-media', (request) => {
    // Swap scheme back to file: and let net.fetch serve it
    const fileUrl = request.url.replace('local-media:', 'file:')
    return net.fetch(fileUrl)
  })

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
