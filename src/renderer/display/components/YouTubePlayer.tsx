import { useYouTubePlayer } from '../hooks/useYouTubePlayer'

export default function YouTubePlayer() {
  useYouTubePlayer('yt-player')
  return <div id="yt-player" />
}
