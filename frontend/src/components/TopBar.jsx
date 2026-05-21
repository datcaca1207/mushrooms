import { Bot, CalendarClock, ShieldCheck } from 'lucide-react'

export function TopBar({ timestamp, aiStatus, onlineDevices, totalDevices }) {
  const statusClasses =
    aiStatus === 'warning'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-['Rajdhani'] text-xl font-semibold tracking-wide text-zinc-100 sm:text-2xl">
            Smart Mushroom Farm Dashboard
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400 sm:text-sm">
            SCADA + IoT Monitoring Interface
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="top-pill">
            <CalendarClock size={14} className="text-cyan-300" />
            {timestamp}
          </div>
          <div className="top-pill">
            <ShieldCheck size={14} className="text-emerald-300" />
            Devices {onlineDevices}/{totalDevices}
          </div>
          <div className={`top-pill ${statusClasses}`}>
            <Bot size={14} />
            AI {aiStatus.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}