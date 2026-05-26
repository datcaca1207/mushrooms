import { useTranslation } from '../i18n.jsx'

export function ModeToggle({ modeAuto, onToggle }) {
  const t = useTranslation()

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-10 min-w-[180px] items-center rounded-xl border px-3 transition ${
        modeAuto
          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-8 w-[88px] rounded-lg transition ${
          modeAuto ? 'translate-x-0 bg-cyan-500/25' : 'translate-x-[86px] bg-amber-500/25'
        }`}
      />
      <span className="relative z-10 w-1/2 text-xs font-medium uppercase tracking-[0.18em]">{t('mode.auto')}</span>
      <span className="relative z-10 w-1/2 text-xs font-medium uppercase tracking-[0.18em]">{t('mode.manual')}</span>
    </button>
  )
}
