import { useYouTubePlayer } from '../hooks/useYouTubePlayer'

export default function YouTubePlayer({ active = true }: { active?: boolean }) {
  useYouTubePlayer('yt-player', active)
  return <div id="yt-player" />
}
