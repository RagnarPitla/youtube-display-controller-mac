import YouTubePlayer from './components/YouTubePlayer'
import { useDisplayIpc } from './hooks/useIpc'

export default function App() {
  const { transform } = useDisplayIpc()

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          transformOrigin: 'center center',
          width: '3840px',
          height: '2160px'
        }}
      >
        <YouTubePlayer />
      </div>
    </div>
  )
}
