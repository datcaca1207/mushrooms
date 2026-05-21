import { Power } from 'lucide-react'

export function DeviceSwitch({ label, enabled, modeAuto, onToggle, online }) {
  const friendlyName = label.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
  const switchDisabled = modeAuto || !online

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-zinc-700">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-zinc-200">{friendlyName}</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
            online ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          {online ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>
      <button
        type="button"
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs uppercase tracking-[0.14em] transition ${
          enabled
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
            : 'border-zinc-700 bg-zinc-800/60 text-zinc-400'
        } ${switchDisabled ? 'cursor-not-allowed opacity-70' : 'hover:brightness-110'}`}
        onClick={onToggle}
        disabled={switchDisabled}
      >
        <span>{enabled ? 'On' : 'Off'}</span>
        <Power size={14} />
      </button>
    </div>
  )
}
