import { useState, useCallback } from 'react'
import type { LocalFileInfo } from '../../../shared/types'

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v'])

interface Props {
  onPlay: (fileUrl: string, fileName: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function LocalFileBrowser({ onPlay }: Props) {
  const [folderPath, setFolderPath] = useState<string | null>(null)
  const [files, setFiles] = useState<LocalFileInfo[]>([])
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleBrowse = async () => {
    const path = await window.controlAPI.browseFolder()
    if (path) {
      setFolderPath(path)
      const scanned = await window.controlAPI.scanFolder(path)
      setFiles(scanned)
    }
  }

  const handlePlay = (file: LocalFileInfo) => {
    setPlayingUrl(file.fileUrl)
    onPlay(file.fileUrl, file.name)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFiles = Array.from(e.dataTransfer.files)
      const videoFile = droppedFiles.find((f) => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase()
        return VIDEO_EXTENSIONS.has(ext)
      })
      if (videoFile && (videoFile as any).path) {
        const filePath = (videoFile as any).path as string
        const mediaUrl = window.controlAPI.pathToMediaUrl(filePath)
        setPlayingUrl(mediaUrl)
        onPlay(mediaUrl, videoFile.name)
      }
    },
    [onPlay]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const folderName = folderPath?.split('/').pop() || ''

  return (
    <div
      className="flex flex-col gap-2 px-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleBrowse}
          className="px-3 py-1.5 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          Select Folder
        </button>
        {folderPath && (
          <span className="text-xs text-gray-500 truncate flex-1" title={folderPath}>
            {folderName}
          </span>
        )}
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto rounded-lg bg-gray-900/50 p-1">
          {files.map((file) => {
            const isPlaying = playingUrl === file.fileUrl
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => handlePlay(file)}
                className={`group flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
                  isPlaying
                    ? 'bg-blue-600/30 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <span
                  className={`shrink-0 text-sm w-5 text-center ${
                    isPlaying ? 'text-green-400' : 'text-gray-600 group-hover:text-gray-400'
                  }`}
                >
                  &#9654;
                </span>
                <span className="text-xs truncate flex-1">{file.name}</span>
                <span className="text-xs text-gray-500 shrink-0">{formatSize(file.size)}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Drop zone / empty state */}
      {files.length === 0 && (
        <div
          className={`flex items-center justify-center rounded-lg border-2 border-dashed py-6 transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 bg-gray-900/30'
          }`}
        >
          <p className="text-xs text-gray-500">
            {isDragOver ? 'Drop video file to play' : folderPath ? 'No video files found' : 'Select a folder or drop a video file here'}
          </p>
        </div>
      )}
    </div>
  )
}
