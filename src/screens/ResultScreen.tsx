import { useGameStore } from '../store/gameStore'
import { FlagEmoji } from '../components/FlagEmoji'
import { useT } from '../i18n/useT'

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
    language,
  } = useGameStore()

  const t = useT()

  const pct     = correct / QUESTIONS_PER_ROUND
  const tierDef = TIER_KEYS.find(t => pct >= t.min) ?? TIER_KEYS[TIER_KEYS.length - 1]

  return (
    <div style={{ padding:'26px 22px 28px', textAlign:'center' }}>

      {/* Hero */}
      <div style={{ fontSize:64, lineHeight:1, animation:'pop-in .6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {tierDef.emoji}
      </div>
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

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, margin:'4px 0' }}>
        {[
          { value: score,                                label: t('result.points'), gold: true  },
          { value: `${correct}/${QUESTIONS_PER_ROUND}`,  label: t('result.correct'), gold: false },
          { value: maxStreak,                            label: t('result.streak'),  gold: false },
        ].map(({ value, label, gold }) => (
          <div key={label} style={{
            padding: '10px 6px',
            border: '1px solid var(--rule)',
            background: 'rgba(255,253,243,0.55)',
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
      </div>

      {/* Wrong list */}
      {wrongList.length > 0 && (
        <div style={{ textAlign:'left', marginTop:22 }}>
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
            {wrongList.map(c => {
              const name = language === 'en' ? c.ne : c.n
              return (
                <div key={c.n} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: '1px solid var(--rule)',
                  padding: '8px 12px',
                  background: 'rgba(255,253,243,0.55)',
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
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:22 }}>
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
            background: 'var(--ink)',
            color: 'var(--paper)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10.5,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {t('result.again')}
        </button>
      </div>

      <style>{`
        @keyframes pop-in {
          from { transform: translateY(6px) scale(0.8); opacity: 0; }
          to   { transform: translateY(0) scale(1);     opacity: 1; }
        }
      `}</style>
    </div>
  )
}
