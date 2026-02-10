import { useState, useEffect } from 'react'

function formatTime(date: Date): string {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export default function Clock() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTime(new Date()))
    }, 10_000) // Update every 10s (only showing HH:MM)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        top: '24px',
        right: '32px',
        zIndex: 20,
        color: '#fff',
        fontSize: '28px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 300,
        letterSpacing: '1px',
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        pointerEvents: 'none'
      }}
    >
      {time}
    </div>
  )
}
