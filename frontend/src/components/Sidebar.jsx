import { CircleDot, Leaf, RadioTower, X } from 'lucide-react'

export function Sidebar({ navItems, connectivity, open, onClose }) {
  const linkClasses = (active) =>
    `group flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
      active
        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
    }`

  return (
    <>
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950/80 p-5 lg:flex">
        <SidebarContent navItems={navItems} connectivity={connectivity} linkClasses={linkClasses} />
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-zinc-800/80 bg-zinc-950 p-5 transition duration-300 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          className="mb-2 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={16} />
        </button>
        <SidebarContent navItems={navItems} connectivity={connectivity} linkClasses={linkClasses} />
      </aside>
    </>
  )
}

function SidebarContent({ navItems, connectivity, linkClasses }) {
  const connected = Object.values(connectivity).filter(Boolean).length
  const total = Object.keys(connectivity).length

  return (
    <>
      <div className="mb-8 rounded-2xl border border-cyan-700/30 bg-gradient-to-b from-cyan-500/10 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-500/20">
            <Leaf className="text-cyan-300" size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/90">Smart Farm</p>
            <h1 className="font-['Rajdhani'] text-xl font-semibold tracking-wide text-zinc-100">Mushroom Nexus</h1>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <button key={item.label} type="button" className={linkClasses(item.active)}>
            <item.icon size={16} className="text-current" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
          <span className="inline-flex items-center gap-2">
            <RadioTower size={14} /> Network
          </span>
          <span className="font-medium text-cyan-300">{connected}/{total}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
            style={{ width: `${(connected / total) * 100}%` }}
          />
        </div>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-400">
          <CircleDot size={12} className="text-emerald-400" />
          Industrial control bus synchronized
        </p>
      </div>
    </>
  )
}