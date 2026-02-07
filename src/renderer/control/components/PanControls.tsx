interface Props {
  onPan: (dx: number, dy: number) => void
  onResetCenter: () => void
  onResetAll: () => void
}

const PAN_STEP = 50

export default function PanControls({ onPan, onResetCenter, onResetAll }: Props) {
  const btnClass =
    'w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors text-lg'

  return (
    <div className="flex items-center gap-6 px-4">
      <div className="flex flex-col items-center gap-1">
        <label className="text-xs text-gray-400 mb-1">Pan</label>
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button className={btnClass} onClick={() => onPan(0, PAN_STEP)}>
            &#9650;
          </button>
          <div />
          <button className={btnClass} onClick={() => onPan(PAN_STEP, 0)}>
            &#9664;
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
            onClick={onResetCenter}
          >
            CTR
          </button>
          <button className={btnClass} onClick={() => onPan(-PAN_STEP, 0)}>
            &#9654;
          </button>
          <div />
          <button className={btnClass} onClick={() => onPan(0, -PAN_STEP)}>
            &#9660;
          </button>
          <div />
        </div>
      </div>
      <button
        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
        onClick={onResetAll}
      >
        Reset All
      </button>
    </div>
  )
}
