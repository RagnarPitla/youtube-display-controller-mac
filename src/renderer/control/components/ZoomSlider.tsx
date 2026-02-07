interface Props {
  scale: number
  onScaleChange: (scale: number) => void
}

export default function ZoomSlider({ scale, onScaleChange }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 flex-1">
      <label className="text-xs text-gray-400 whitespace-nowrap">Zoom</label>
      <input
        type="range"
        min={0.5}
        max={3}
        step={0.05}
        value={scale}
        onChange={(e) => onScaleChange(parseFloat(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="text-sm text-gray-300 w-14 text-right font-mono">
        {Math.round(scale * 100)}%
      </span>
    </div>
  )
}
