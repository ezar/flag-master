import { motion } from 'framer-motion'
import type { Country } from '../data/countries'
import { FlagEmoji } from './FlagEmoji'
import { useT } from '../i18n/useT'
import { useGameStore } from '../store/gameStore'

interface Props {
  correct:      boolean
  country:      Country
  pointsEarned: number
  streak:       number
}

export function FeedbackBanner({ correct, country, pointsEarned, streak }: Props) {
  const t        = useT()
  const language = useGameStore(s => s.language)
  const name     = language === 'en' ? country.ne : country.n

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        marginTop: 14,
        padding: '10px 14px',
        background: correct ? 'var(--ok-bg)' : 'var(--err-bg)',
        border: `1px solid ${correct ? 'var(--ok)' : 'var(--err)'}`,
        fontFamily: "'Playfair Display', serif",
        fontSize: 15,
      }}
    >
      {correct ? (
        <>
          <div style={{ color: 'var(--ok)', display:'flex', alignItems:'center', gap:8 }}>
            <span>{t('feedback.correct')}</span>
            <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12 }}>
              +{pointsEarned} pts
            </span>
            {streak > 1 && <span>🔥 ×{streak}</span>}
          </div>
          {country.fun && (
            <div style={{ marginTop:8, color:'var(--ok)', fontSize:12, fontStyle:'italic', fontFamily:"'Libre Baskerville', serif", opacity:0.85 }}>
              {t('fun.label')} {language === 'en' ? country.fun.en : country.fun.es}
            </div>
          )}
        </>
      ) : (
        <div style={{ color: 'var(--err)', display:'flex', alignItems:'center', gap:8 }}>
          <span>{t('feedback.wrong')}</span>
          <FlagEmoji emoji={country.f} width={32} height={22} />
          <span style={{ fontWeight:700 }}>{name}</span>
        </div>
      )}
    </motion.div>
  )
}
