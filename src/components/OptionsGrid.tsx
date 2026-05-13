import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Country } from '../data/countries'
import { useGameStore, type GameMode } from '../store/gameStore'
import { FlagEmoji } from './FlagEmoji'

interface Props {
  options:     Country[]
  mode:        GameMode
  correctName: string
  onAnswer:    (correct: boolean) => void
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

export function OptionsGrid({ options, mode, correctName, onAnswer }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const language = useGameStore(s => s.language)

  function handleClick(opt: Country) {
    if (revealed) return
    setRevealed(true)
    setSelected(opt.n)
    onAnswer(opt.n === correctName)
  }

  if (mode === 'country2flag') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
        {options.map((opt, i) => {
          const isCorrect  = opt.n === correctName
          const isSelected = selected === opt.n

          let bg     = 'rgba(255,253,243,0.65)'
          let border = '1px solid var(--rule)'
          if (revealed && isCorrect)                { bg = 'var(--ok-bg)';  border = '1px solid var(--ok)'  }
          if (revealed && isSelected && !isCorrect) { bg = 'var(--err-bg)'; border = '1px solid var(--err)' }

          const letterColor = revealed && (isCorrect || (isSelected && !isCorrect))
            ? '#fff'
            : 'var(--ink-soft)'
          const letterBg = revealed && isCorrect
            ? 'var(--ok)'
            : revealed && isSelected && !isCorrect
              ? 'var(--err)'
              : 'transparent'
          const letterBorder = revealed && isCorrect
            ? 'var(--ok)'
            : revealed && isSelected && !isCorrect
              ? 'var(--err)'
              : 'var(--rule)'

          return (
            <motion.button
              key={opt.n}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(opt)}
              disabled={revealed}
              data-letter={LETTERS[i]}
              style={{
                position:   'relative',
                background: bg,
                border,
                padding:    '22px 10px 14px',
                cursor:     revealed ? 'default' : 'pointer',
                textAlign:  'center',
                fontSize:   46,
                lineHeight: 1.1,
                transition: 'background .18s, border-color .18s',
              }}
            >
              {/* ABCD letter badge — top-right */}
              <span style={{
                position:       'absolute',
                right:          8,
                top:            8,
                fontFamily:     "'DM Mono', monospace",
                fontSize:       9,
                letterSpacing:  '0.18em',
                color:          letterColor,
                background:     letterBg,
                border:         `1px solid ${letterBorder}`,
                width:          20,
                height:         20,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}>
                {LETTERS[i]}
              </span>
              <FlagEmoji emoji={opt.f} width={70} height={46} style={{ objectFit: 'contain' }} />
            </motion.button>
          )
        })}
      </div>
    )
  }

  // List layout: flag2country, hint, lightning, capital, type
  return (
    <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
      {options.map((opt, i) => {
        const isCorrect  = opt.n === correctName
        const isSelected = selected === opt.n

        let bg     = 'rgba(255,253,243,0.65)'
        let border = '1px solid var(--rule)'
        let color  = 'var(--ink)'
        if (revealed && isCorrect)                { bg = 'var(--ok-bg)';  border = '1px solid var(--ok)';  color = '#eef7ed' }
        if (revealed && isSelected && !isCorrect) { bg = 'var(--err-bg)'; border = '1px solid var(--err)'; color = '#fbe9e9' }

        // Label shown in the button body
        const label = mode === 'capital' ? opt.c : (language === 'en' ? opt.ne : opt.n)

        const letterColor = revealed && (isCorrect || (isSelected && !isCorrect))
          ? '#fff'
          : 'var(--ink-soft)'
        const letterBg = revealed && isCorrect
          ? 'var(--ok)'
          : revealed && isSelected && !isCorrect
            ? 'var(--err)'
            : 'transparent'
        const letterBorder = revealed && isCorrect
          ? 'var(--ok)'
          : revealed && isSelected && !isCorrect
            ? 'var(--err)'
            : 'var(--rule)'

        return (
          <motion.button
            key={opt.n}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClick(opt)}
            disabled={revealed}
            style={{
              position:   'relative',
              background: bg,
              border,
              color,
              padding:    '14px 44px 14px 16px',
              cursor:     revealed ? 'default' : 'pointer',
              textAlign:  'left',
              fontFamily: "'Libre Baskerville', serif",
              fontSize:   15,
              fontWeight: 700,
              display:    'flex',
              alignItems: 'center',
              gap:        8,
              transition: 'background .18s, border-color .18s',
            }}
          >
            {/* Small flag only in hint mode — flag2country/lightning would reveal the answer */}

            <span style={{ flex: 1 }}>{label}</span>

            {/* ABCD letter badge — vertically centred, right edge */}
            <span style={{
              position:       'absolute',
              right:          14,
              top:            '50%',
              transform:      'translateY(-50%)',
              fontFamily:     "'DM Mono', monospace",
              fontSize:       10,
              letterSpacing:  '0.18em',
              color:          letterColor,
              background:     letterBg,
              border:         `1px solid ${letterBorder}`,
              width:          22,
              height:         22,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}>
              {LETTERS[i]}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
