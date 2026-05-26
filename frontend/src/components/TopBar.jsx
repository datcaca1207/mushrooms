import { Bot, CalendarClock, ShieldCheck } from 'lucide-react'
import { useLanguage, useTranslation } from '../i18n.jsx'

export function TopBar({ timestamp, aiStatus, onlineDevices, totalDevices }) {
  const { locale, toggleLanguage } = useLanguage()
  const t = useTranslation()
  const statusClasses =
    aiStatus === 'warning'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-['Rajdhani'] text-xl font-semibold tracking-wide text-zinc-100 sm:text-2xl">
            {t('topBar.title')}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400 sm:text-sm">
            {t('topBar.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="top-pill">
            <CalendarClock size={14} className="text-cyan-300" />
            {timestamp}
          </div>
          <div className="top-pill">
            <ShieldCheck size={14} className="text-emerald-300" />
            {t('topBar.devices')} {onlineDevices}/{totalDevices}
          </div>
          <div className={`top-pill ${statusClasses}`}>
            <Bot size={14} />
            {t('topBar.ai')} {aiStatus.toUpperCase()}
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:text-zinc-100 whitespace-nowrap"
          >
            {t('topBar.language')}: {locale === 'en' ? 'EN' : 'VI'}
          </button>
        </div>
      </div>
    </header>
  )
}