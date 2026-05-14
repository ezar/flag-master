import { motion } from 'framer-motion'
import type { GameMode } from '../store/gameStore'
import type { Country } from '../data/countries'
import { TimerRing } from './TimerRing'
import { FlagEmoji } from './FlagEmoji'
import { useT } from '../i18n/useT'
import { useGameStore } from '../store/gameStore'
import { useDesktop } from '../hooks/useDesktop'

interface Props {
  country:    Country
  mode:       GameMode
  hint?:      string       // pre-computed makeHint() output, only for 'hint' mode
  onTimeout?: () => void   // only for 'lightning' mode
}

export function FlagStage({ country, mode, hint, onTimeout }: Props) {
  const t         = useT()
  const language  = useGameStore(s => s.language)
  const isDesktop = useDesktop()
  const name      = language === 'en' ? country.ne : country.n

  return (
    <div
      style={{
        border:   '1px solid var(--rule)',
        background: 'rgba(255,253,243,0.7)',
        padding:  '22px 16px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Corner brackets — top-left */}
      <div style={{
        position:     'absolute',
        left:         -1,
        top:          -1,
        width:        8,
        height:       8,
        border:       '1px solid var(--gold)',
        borderRight:  'none',
        borderBottom: 'none',
      }} />
      {/* Corner brackets — bottom-right */}
      <div style={{
        position:    'absolute',
        right:       -1,
        bottom:      -1,
        width:       8,
        height:      8,
        border:      '1px solid var(--gold)',
        borderLeft:  'none',
        borderTop:   'none',
      }} />

      {/* Lightning timer — top-right overlay */}
      {mode === 'lightning' && onTimeout && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <TimerRing seconds={10} onTimeout={onTimeout} />
        </div>
      )}

      {/* Flag emoji — shown in all modes except country2flag */}
      {mode !== 'country2flag' && (
        <motion.div
          key={country.n}
          initial={{ scale: 0.6, rotate: -5, opacity: 0 }}
          animate={{ scale: 1,   rotate:  0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          style={{
            lineHeight: 1,
            userSelect: 'none',
            width: '100%',
          }}
        >
          <FlagEmoji
            emoji={country.f}
            style={{
              width:     '100%',
              maxWidth:  isDesktop ? 520 : 320,
              height:    'auto',
              minHeight: isDesktop ? 160 : 100,
              objectFit: 'contain',
              display:   'block',
              margin:    '0 auto',
              filter:    'drop-shadow(0 6px 20px rgba(26,18,9,0.22))',
              borderRadius: 3,
            }}
          />
        </motion.div>
      )}

      {/* country2flag: show country name, hide flag */}
      {mode === 'country2flag' && (
        <div style={{
          fontFamily:    "'Playfair Display', serif",
          fontWeight:    700,
          fontSize:      24,
          letterSpacing: '0.01em',
          padding:       '10px 0',
        }}>
          {name}
        </div>
      )}

      {/* hint mode: masked name below the flag */}
      {mode === 'hint' && hint && (
        <div style={{
          fontFamily:    "'DM Mono', monospace",
          letterSpacing: '0.18em',
          fontSize:      20,
          color:         'var(--ink-2)',
          marginTop:     14,
        }}>
          {hint}
        </div>
      )}

      {/* capital mode: country name + prompt */}
      {mode === 'capital' && (
        <>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize:   22,
            marginTop:  14,
          }}>
            {name}
          </div>
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontStyle:  'italic',
            color:      'var(--ink-soft)',
            fontSize:   13,
            marginTop:  10,
          }}>
            {t('game.capital.prompt')}
          </div>
        </>
      )}
    </div>
  )
}
