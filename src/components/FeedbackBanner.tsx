import { motion } from 'framer-motion'
import type { Country } from '../data/countries'

interface Props {
  correct:      boolean
  country:      Country
  pointsEarned: number
  streak:       number
}

export function FeedbackBanner({ correct, country, pointsEarned, streak }: Props) {
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
        <div style={{ color: 'var(--ok)', display:'flex', alignItems:'center', gap:8 }}>
          <span>¡Correcto!</span>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12 }}>
            +{pointsEarned} pts
          </span>
          {streak > 1 && <span>🔥 ×{streak}</span>}
        </div>
      ) : (
        <div style={{ color: 'var(--err)', display:'flex', alignItems:'center', gap:8 }}>
          <span>✗ Era:</span>
          <span style={{ fontSize:22 }}>{country.f}</span>
          <span style={{ fontWeight:700 }}>{country.n}</span>
        </div>
      )}
    </motion.div>
  )
}
