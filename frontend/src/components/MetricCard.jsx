export function MetricCard({ label, value, delta, status, icon: Icon }) {
  const tone =
    status === 'danger'
      ? 'border-rose-500/40 from-rose-500/20 to-transparent text-rose-200'
      : status === 'warning'
        ? 'border-amber-500/40 from-amber-500/20 to-transparent text-amber-200'
        : 'border-cyan-500/30 from-cyan-500/15 to-transparent text-cyan-200'

  return (
    <article className={`card-base bg-gradient-to-br ${tone}`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-300">{label}</p>
        <Icon size={15} />
      </div>
      <p className="font-['Rajdhani'] text-2xl font-semibold tracking-wide text-zinc-100">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-400">{delta}</p>
    </article>
  )
}