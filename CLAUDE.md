# BreathEva Player - Claude Memory File

## What This App Is
A two-window Electron desktop app for "Breathe - cinematic infrared yoga" studio. It controls video/image playback on an ultrawide display (2880x960) from a separate control window (850x850). Built with Electron + React + TypeScript + Tailwind CSS 4.0.

## Architecture

### Two Windows
- **Control Window** (850x850): Operator interface with YouTube browser, local file browser, transport controls, volume, fit mode, loop settings. Always-on-top by default.
- **Display Window** (2880x960, frameless): Output screen for external ultrawide monitor. Non-interactive (`setIgnoreMouseEvents(true)`). Shows YouTube videos, local video/image files, or the Breathe logo.

### IPC Pattern
All communication between windows goes through the main process as a relay:
- Control -> Main (relay) -> Display
- Display -> Main (relay) -> Control
- Channels defined in `src/shared/ipc-channels.ts`
- Types defined in `src/shared/types.ts`
- Main relay handlers in `src/main/ipc-handlers.ts`
- Preload scripts expose typed APIs: `src/preload/control.ts` and `src/preload/display.ts`

### Key IPC Rule
When adding a new IPC channel, you MUST update ALL of these:
1. `src/shared/ipc-channels.ts` - add the channel constant
2. `src/shared/types.ts` - add any new types
3. `src/main/ipc-handlers.ts` - add the relay handler
4. `src/preload/control.ts` - add the send/receive method
5. `src/preload/display.ts` - add the send/receive method
6. `src/renderer/control/hooks/useIpc.ts` - add to `window.controlAPI` type declaration
7. `src/renderer/display/hooks/useYouTubePlayer.ts` - add to `window.displayAPI` type declaration

## File Structure
```
src/
  main/
    index.ts              # App entry, window creation, custom protocol, close handlers
    ipc-handlers.ts       # All IPC relay handlers with isDestroyed() guards
  preload/
    control.ts            # Control window preload API (contextBridge)
    display.ts            # Display window preload API (contextBridge)
  shared/
    ipc-channels.ts       # IPC channel constants
    types.ts              # Shared TypeScript types
  renderer/
    control/
      App.tsx             # Main control UI component
      hooks/useIpc.ts     # Control IPC hook + window.controlAPI type declarations
      hooks/useTransform.ts # Pan/zoom transform state
      components/
        YouTubeBrowser.tsx    # Embedded YouTube webview with navigation
        LocalFileBrowser.tsx  # Folder selection + file list + drag-and-drop
        TransportBar.tsx      # Play/pause/seek controls
        PreviewBox.tsx        # Preview of display output
        PanControls.tsx       # Manual pan controls
        ZoomSlider.tsx        # Manual zoom slider
        ScreenSelector.tsx    # Display monitor selector
        UrlInput.tsx          # Direct URL input
    display/
      App.tsx             # Display rendering with z-index layering
      hooks/useIpc.ts     # Display IPC hook (transform, logo, localFile, fitMode)
      hooks/useYouTubePlayer.ts # YouTube IFrame API + window.displayAPI type declarations
      components/
        YouTubePlayer.tsx     # YouTube player container (3840x2160)
        LocalVideoPlayer.tsx  # Local video + image player with fit modes
        Clock.tsx             # Clock overlay
      assets/
        breathe-logo.jpg      # Studio logo
```

## Key Technical Details

### Custom Protocol for Local Files
Local files use `local-media://` protocol instead of `file://` to avoid same-origin policy blocks in dev mode:
- Registered in `src/main/index.ts` via `protocol.registerSchemesAsPrivileged` (before `app.whenReady()`) with flags: `standard`, `secure`, `stream`, `bypassCSP`, `supportFetchAPI`
- Handled in `app.whenReady()` via `protocol.handle('local-media', ...)` - swaps scheme back to `file:` and uses `net.fetch`
- URLs created via `pathToFileURL(path).href.replace('file:', 'local-media:')`

### YouTube Player
- Renders at 3840x2160, CSS transforms handle positioning in the 2880x960 viewport
- NO `origin` parameter in playerVars (breaks with `file://` protocol in production builds, causes Error 153)
- Player not auto-loaded - waits for user to send a video via IPC
- Resilient ready detection: `markReady()` called from onReady, onError, API load, and 5-second timeout fallback
- `active` flag stops polling/handling commands when local video plays

### Display Overlays (z-index layering)
- YouTube player: base layer (no z-index)
- Local video/image: z-index 5
- Logo: z-index 10
- Clock: z-index 20

### CSP
Content Security Policy in `src/renderer/display/index.html` must be updated when adding new media sources. Currently includes `local-media:` in `media-src` and `img-src`.

### Supported Media Formats
- **Video**: mp4, webm, mov, mkv, avi, m4v, m4p, mpg, mpeg, wmv, flv
- **Image**: jpg, jpeg, png, gif, bmp, webp, tiff, tif, svg
- Extensions defined in both `src/main/ipc-handlers.ts` and `src/renderer/control/components/LocalFileBrowser.tsx`

### Display Window Behavior
- `setIgnoreMouseEvents(true)` - completely non-interactive
- `displayWindow.moveTop()` called when content is sent to bring it in front of other windows (but behind always-on-top control)
- Both windows close each other bidirectionally on `closed` event with `isDestroyed()` guards

### Control Window Behavior
- Always-on-top by default (both main process `setAlwaysOnTop(true)` and React state `useState(true)`)
- PIN toggle button in header to enable/disable always-on-top

## Build & Run
- **Dev**: `npm run dev` (uses electron-vite dev server at localhost:5173)
- **Build**: `npm run build` (production build via electron-vite)
- **DMG**: `npm run dist:mac` (builds + creates DMG in `dist/`)
- **arm64 only** (M4 Mac target) - configured in `electron-builder.yml`
- Versioned DMG builds stored in `dist/v{version}/` folders

## Common Issues & Fixes
- **`ELECTRON_RUN_AS_NODE` error**: Use `npm run dev` (includes `unset ELECTRON_RUN_AS_NODE`)
- **YouTube Error 153**: Don't add `origin` to YouTube playerVars
- **Close crash ("Object has been destroyed")**: All IPC handlers use `isDestroyed()` guards via `sendToDisplay`/`sendToControl` helpers
- **Local files not playing**: Must use `local-media://` protocol, not `file://`
- **Display not visible**: `displayWindow.moveTop()` brings it to front on content send
- **CSP blocking resources**: Update CSP in `src/renderer/display/index.html`

## Current Version
v1.0.4 (February 2026)
