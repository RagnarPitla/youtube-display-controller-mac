import { useState, useEffect } from 'react'

interface DisplayInfo {
  id: number
  label: string
  bounds: { x: number; y: number; width: number; height: number }
}

export default function ScreenSelector() {
  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  const [selected, setSelected] = useState<number | ''>('')

  const fetchDisplays = async () => {
    const list = await window.controlAPI.getDisplays()
    setDisplays(list)
    if (list.length > 0 && selected === '') {
      // Default to first non-primary, or primary if only one
      const nonPrimary = list.find((d) => !d.label.includes('Primary'))
      setSelected(nonPrimary?.id ?? list[0].id)
    }
  }

  useEffect(() => {
    fetchDisplays()
  }, [])

  const handleChange = (displayId: number) => {
    setSelected(displayId)
    window.controlAPI.moveToDisplay(displayId)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 whitespace-nowrap">Display:</label>
      <select
        value={selected}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="flex-1 px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white text-xs focus:outline-none focus:border-blue-500"
      >
        {displays.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      <button
        onClick={fetchDisplays}
        className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition-colors"
        title="Refresh display list"
      >
        ↻
      </button>
    </div>
  )
}
