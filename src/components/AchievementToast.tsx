import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { ACHIEVEMENTS } from '../data/achievements'

export function AchievementToast() {
  const pendingAchievements = useGameStore(s => s.pendingAchievements)
  const dismissAchievements = useGameStore(s => s.dismissAchievements)
  const language            = useGameStore(s => s.language)
  const [index, setIndex]   = useState(0)

  // Reset index when new achievements arrive
  useEffect(() => { if (pendingAchievements.length > 0) setIndex(0) }, [pendingAchievements.length])

  // Auto-advance through pending achievements
  useEffect(() => {
    if (pendingAchievements.length === 0) return
    const timer = setTimeout(() => {
      if (index < pendingAchievements.length - 1) setIndex(i => i + 1)
      else dismissAchievements()
    }, 3500)
    return () => clearTimeout(timer)
  }, [pendingAchievements.length, index, dismissAchievements])

  const id  = pendingAchievements[index]
  const ach = ACHIEVEMENTS.find(a => a.id === id)

  return (
    <AnimatePresence>
      {ach && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{    opacity: 0, y: -60, scale: 0.9  }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={dismissAchievements}
          style={{
            position:     'fixed',
            top:          20,
            left:         '50%',
            transform:    'translateX(-50%)',
            zIndex:       200,
            background:   'var(--chrome-bg)',
            border:       '1px solid var(--gold)',
            boxShadow:    '0 8px 32px -8px rgba(0,0,0,0.5)',
            padding:      '14px 20px',
            display:      'flex',
            alignItems:   'center',
            gap:          14,
            cursor:       'pointer',
            minWidth:     260,
            maxWidth:     340,
          }}
        >
          <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{ach.emoji}</div>
          <div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize: 8, letterSpacing: '0.28em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 3 }}>
              {language === 'en' ? '✦ Achievement unlocked' : '✦ Logro desbloqueado'}
            </div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: 'var(--chrome-text)' }}>
              {language === 'en' ? ach.title.en : ach.title.es}
            </div>
            <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle: 'italic', fontSize: 11, color: 'var(--gold-light)', marginTop: 2 }}>
              {language === 'en' ? ach.desc.en : ach.desc.es}
            </div>
          </div>
          {pendingAchievements.length > 1 && (
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize: 9, color: 'var(--gold)', marginLeft: 'auto', flexShrink: 0 }}>
              {index + 1}/{pendingAchievements.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
