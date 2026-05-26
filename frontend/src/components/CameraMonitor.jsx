import { AlertTriangle, Camera, ScanSearch, Sprout } from 'lucide-react'
import { useTranslation } from '../i18n.jsx'

export function CameraMonitor({ camera, aiStatus }) {
  const t = useTranslation()
  const riskTone =
    camera.diseaseRisk > 68
      ? 'text-rose-300 border-rose-500/40 bg-rose-500/10'
      : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'

  return (
    <section className="panel-base">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide text-zinc-100">{t('camera.title')}</h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300">
          <Camera size={12} /> {t('panel.live')}
        </span>
      </div>

      <div className="relative mb-4 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.15),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_35%)]" />
        <div className="relative grid h-44 place-items-center rounded-lg border border-cyan-700/30 bg-zinc-950">
          <div className="h-20 w-20 animate-pulse rounded-full border border-cyan-600/30 bg-cyan-500/10" />
          <p className="absolute bottom-3 text-xs uppercase tracking-[0.16em] text-zinc-400">
            {t('camera.camLabel')}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <InfoRow icon={ScanSearch} label={t('camera.aiDetection')} value={camera.lastDetection} />
        <InfoRow icon={Sprout} label={t('camera.growthStage')} value={camera.growthStage} />
        <InfoRow icon={AlertTriangle} label={t('camera.aiEngine')} value={aiStatus.toUpperCase()} />
      </div>

      <div className={`mt-4 rounded-xl border px-3 py-2 text-sm ${riskTone}`}>
        {t('camera.diseaseRisk')}: {camera.diseaseRisk}%
      </div>
    </section>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
      <p className="inline-flex items-center gap-2 text-zinc-400">
        <Icon size={14} /> {label}
      </p>
      <p className="font-medium text-zinc-200">{value}</p>
    </div>
  )
}
