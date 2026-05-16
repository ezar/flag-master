import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { FlagEmoji } from '../components/FlagEmoji'
import { Confetti }  from '../components/Confetti'
import { useT } from '../i18n/useT'

const staggerContainer = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } },
}

const QUESTIONS_PER_ROUND = 10

const TIER_KEYS = [
  { min: 1.0,  emoji: '🏆', key: 'perfect' },
  { min: 0.8,  emoji: '🌟', key: 'great'   },
  { min: 0.6,  emoji: '⚓', key: 'good'    },
  { min: 0.4,  emoji: '🧭', key: 'ok'      },
  { min: 0.2,  emoji: '🪨', key: 'poor'    },
  { min: 0,    emoji: '🌧️', key: 'bad'     },
]

export function ResultScreen() {
  const {
    score, correct, maxStreak,
    wrongList, startGame, goHome,
    language, mode, qIndex,
  } = useGameStore()

  const t          = useT()
  const [copied, setCopied] = useState(false)
  const isMarathon = mode === 'marathon'
  const total      = isMarathon ? qIndex + 1 : QUESTIONS_PER_ROUND
  const pct        = correct / total
  const tierDef    = TIER_KEYS.find(tk => pct >= tk.min) ?? TIER_KEYS[TIER_KEYS.length - 1]

  async function handleShare() {
    const stars = isMarathon ? '🏃' : '⭐'.repeat(Math.round(pct * 5))
    const text = isMarathon
      ? (language === 'en'
        ? `🏃 FlagMaster Marathon\n${correct}/${total} correct · ${score} pts · ×${maxStreak} streak\nhttps://ezar.github.io/flag-master/`
        : `🏃 FlagMaster Maratón\n${correct}/${total} aciertos · ${score} pts · ×${maxStreak} racha\nhttps://ezar.github.io/flag-master/`)
      : (language === 'en'
        ? `🌍 FlagMaster — ${t(`tier.${tierDef.key}.title`)}\n${stars}\n${correct}/${QUESTIONS_PER_ROUND} correct · ${score} pts · ×${maxStreak} streak\nhttps://ezar.github.io/flag-master/`
        : `🌍 FlagMaster — ${t(`tier.${tierDef.key}.title`)}\n${stars}\n${correct}/${QUESTIONS_PER_ROUND} aciertos · ${score} pts · ×${maxStreak} racha\nhttps://ezar.github.io/flag-master/`)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'FlagMaster', text })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch { /* user cancelled */ }
  }

  // Marathon: deduplicate wrongList by country, cap at 10
  const displayWrong = isMarathon
    ? wrongList.filter((c, i, arr) => arr.findIndex(x => x.n === c.n) === i).slice(0, 10)
    : wrongList

  return (
    <div style={{ padding:'26px 22px 40px', textAlign:'center', minHeight:'100dvh' }}>
      <Confetti active={pct >= 1 && !isMarathon} />

      <motion.div variants={staggerContainer} initial="hidden" animate="show">

      {/* Hero */}
      <motion.div variants={staggerItem} style={{ fontSize:64, lineHeight:1 }}>
        {tierDef.emoji}
      </motion.div>
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        fontWeight: 900,
        fontSize: 34,
        marginTop: 8,
        color: 'var(--ink)',
      }}>
        {t(`tier.${tierDef.key}.title`)}
      </h1>
      <p style={{
        fontFamily: "'Libre Baskerville', serif",
        fontStyle: 'italic',
        color: 'var(--ink-soft)',
        marginTop: 4,
      }}>
        {t(`tier.${tierDef.key}.sub`)}
      </p>

      <div style={{ height:1, background:'var(--rule)', margin:'18px 0 16px' }} />

      {isMarathon && (
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.2em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:8 }}>
          {language === 'en' ? `${total} questions attempted` : `${total} preguntas respondidas`}
        </div>
      )}

      {/* Stats strip */}
      <motion.div variants={staggerItem} style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, margin:'4px 0' }}>
        {[
          { value: score,                   label: t('result.points'),  gold: true  },
          { value: `${correct}/${total}`,   label: t('result.correct'), gold: false },
          { value: maxStreak,               label: t('result.streak'),  gold: false },
        ].map(({ value, label, gold }) => (
          <div key={label} style={{
            padding: '10px 6px',
            border: '1px solid var(--rule)',
            background: 'var(--surface)',
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 24,
              color: gold ? 'var(--gold)' : 'var(--ink)',
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.2em',
              color: 'var(--ink-soft)',
              marginTop: 4,
              textTransform: 'uppercase',
            }}>
              {label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Wrong list */}
      {wrongList.length > 0 && (
        <motion.div variants={staggerItem} style={{ textAlign:'left', marginTop:22 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.24em',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            {t('result.review')}
          </div>
          <div style={{ display:'grid', gap:6 }}>
            {displayWrong.map(c => {
              const name = language === 'en' ? c.ne : c.n
              return (
                <div key={c.n} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: '1px solid var(--rule)',
                  padding: '8px 12px',
                  background: 'var(--surface)',
                }}>
                  <FlagEmoji emoji={c.f} width={40} height={26} />
                  <div>
                    <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14, lineHeight:1.1 }}>
                      {name}
                    </div>
                    <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', fontSize:11.5, color:'var(--ink-soft)' }}>
                      {t('result.capital')} {c.c}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Share button */}
      <motion.button variants={staggerItem}
        onClick={handleShare}
        whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
        style={{ display:'block', width:'100%', marginTop:20, padding:'12px 8px', border:'1px solid var(--gold)', background:'rgba(184,135,42,0.08)', color:'var(--gold)', fontFamily:"'DM Mono', monospace", fontSize:10.5, letterSpacing:'0.28em', textTransform:'uppercase', cursor:'pointer' }}
      >
        {copied ? t('result.copied') : `↑ ${t('result.share')}`}
      </motion.button>

      {/* Action buttons */}
      <motion.div variants={staggerItem} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
        <button
          onClick={goHome}
          style={{
            padding: '14px 8px',
            border: '1px solid var(--ink)',
            background: 'transparent',
            color: 'var(--ink)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10.5,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {t('result.menu')}
        </button>
        <button
          onClick={startGame}
          style={{
            padding: '14px 8px',
            border: '1px solid var(--ink)',
            background: 'var(--chrome-bg)',
            color: 'var(--chrome-text)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10.5,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {t('result.again')}
        </button>
      </motion.div>

      </motion.div>
    </div>
  )
}
