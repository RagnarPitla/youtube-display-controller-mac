import { useState } from 'react'

function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default function UrlInput() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleLoad = () => {
    const videoId = extractVideoId(url)
    if (videoId) {
      setError('')
      window.controlAPI.sendLoadVideo(videoId)
    } else {
      setError('Invalid YouTube URL or video ID')
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <label className="text-sm font-medium text-gray-300">YouTube URL</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
          placeholder="Paste YouTube URL or video ID..."
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
        />
        <button
          onClick={handleLoad}
          className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors"
        >
          Load
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
