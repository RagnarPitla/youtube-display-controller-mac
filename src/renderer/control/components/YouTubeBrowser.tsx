import { useState, useRef, useEffect, useCallback } from 'react'

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

interface Props {
  onSendToDisplay?: () => void
}

export default function YouTubeBrowser({ onSendToDisplay }: Props) {
  const webviewRef = useRef<Electron.WebviewTag | null>(null)
  const [addressBar, setAddressBar] = useState('https://www.youtube.com')
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const handleUrlChange = useCallback((url: string) => {
    setAddressBar(url)
    setVideoId(extractVideoId(url))
    const wv = webviewRef.current
    if (wv) {
      setCanGoBack(wv.canGoBack())
      setCanGoForward(wv.canGoForward())
    }
  }, [])

  useEffect(() => {
    const wv = webviewRef.current
    if (!wv) return

    const onDomReady = () => setIsReady(true)
    const onNavigate = (e: Electron.DidNavigateEvent) => handleUrlChange(e.url)
    const onNavigateInPage = (e: Electron.DidNavigateInPageEvent) => handleUrlChange(e.url)

    wv.addEventListener('dom-ready', onDomReady)
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigateInPage)

    return () => {
      wv.removeEventListener('dom-ready', onDomReady)
      wv.removeEventListener('did-navigate', onNavigate)
      wv.removeEventListener('did-navigate-in-page', onNavigateInPage)
    }
  }, [handleUrlChange])

  const handleSendToDisplay = () => {
    if (videoId) {
      window.controlAPI.sendLoadVideo(videoId)
      onSendToDisplay?.()
    }
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const wv = webviewRef.current
    if (!wv) return
    let url = addressBar.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    wv.loadURL(url)
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {/* Navigation bar */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => webviewRef.current?.goBack()}
          disabled={!canGoBack}
          className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => webviewRef.current?.goForward()}
          disabled={!canGoForward}
          className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
        <button
          type="button"
          onClick={() => webviewRef.current?.reload()}
          className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
        >
          ↻
        </button>
        <form onSubmit={handleAddressSubmit} className="flex-1 flex">
          <input
            type="text"
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            className="flex-1 px-2 py-1 rounded-l bg-gray-800 border border-gray-600 text-white text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-r bg-gray-700 hover:bg-gray-600 border border-l-0 border-gray-600 text-gray-300 text-xs transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Send to display button */}
      {videoId && (
        <button
          type="button"
          onClick={handleSendToDisplay}
          className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors"
        >
          Send to Display
        </button>
      )}

      {/* Webview */}
      {!isReady && (
        <p className="text-xs text-gray-500 text-center py-2">Loading YouTube...</p>
      )}
      <webview
        ref={webviewRef as React.Ref<Electron.WebviewTag>}
        src="https://www.youtube.com"
        className="w-full rounded-lg border border-gray-700"
        style={{ height: '350px' }}
        // @ts-expect-error allowpopups is a valid webview attribute
        allowpopups="true"
      />
    </div>
  )
}
