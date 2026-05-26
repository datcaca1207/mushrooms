import { AlertOctagon, AlertTriangle, BellRing, CheckCheck } from 'lucide-react'
import { useTranslation } from '../i18n.jsx'

export function AlertsPanel({ alerts, onAcknowledge }) {
  const t = useTranslation()
  return (
    <section className="panel-base">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide text-zinc-100">{t('alerts.title')}</h2>
        <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
          <BellRing size={13} /> {alerts.length} {t('alerts.active')}
        </span>
      </div>

      <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
        {alerts.map((alert) => (
          <article key={alert.id} className={`rounded-xl border p-3 ${toneByLevel(alert.level)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-medium">
                  {alert.level === 'danger' ? <AlertOctagon size={14} /> : <AlertTriangle size={14} />}
                  {alert.message}
                </p>
                <p className="mt-1 text-xs opacity-80">{alert.source} • {alert.time}</p>
              </div>
              <button
                type="button"
                onClick={() => onAcknowledge(alert.id)}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/70 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-zinc-300 transition hover:text-zinc-100"
              >
                <CheckCheck size={12} /> {t('alerts.acknowledge')}
              </button>
            </div>
          </article>
        ))}

        {alerts.length === 0 && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {t('alerts.noAlerts')}
          </div>
        )}
      </div>
    </section>
  )
}

function toneByLevel(level) {
  if (level === 'danger') {
    return 'border-rose-500/40 bg-rose-500/12 text-rose-200'
  }
  return 'border-amber-500/40 bg-amber-500/12 text-amber-200'
}
