import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Country } from '../data/countries'
import { useGameStore, type GameMode } from '../store/gameStore'
import { FlagEmoji } from './FlagEmoji'

interface Props {
  options:       Country[]
  mode:          GameMode
  correctName:   string
  onAnswer:      (correct: boolean) => void
  triggerOption?: Country | null   // keyboard shortcut trigger from parent
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

export function OptionsGrid({ options, mode, correctName, onAnswer, triggerOption }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const language = useGameStore(s => s.language)

  function handleClick(opt: Country) {
    if (revealed) return
    setRevealed(true)
    setSelected(opt.n)
    onAnswer(opt.n === correctName)
  }

  // Keyboard trigger from parent (1-4 key presses)
  useEffect(() => {
    if (triggerOption && !revealed) handleClick(triggerOption)
  }, [triggerOption]) // eslint-disable-line react-hooks/exhaustive-deps

  const ariaLabel = language === 'en' ? 'Answer options' : 'Opciones de respuesta'

  if (mode === 'country2flag') {
    return (
      <div role="group" aria-label={ariaLabel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
        {options.map((opt, i) => {
          const isCorrect  = opt.n === correctName
          const isSelected = selected === opt.n

          let bg     = 'var(--surface)'
          let border = '1px solid var(--rule)'
          if (revealed && isCorrect)                { bg = 'var(--ok-bg)';  border = '1px solid var(--ok)'  }
          if (revealed && isSelected && !isCorrect) { bg = 'var(--err-bg)'; border = '1px solid var(--err)' }

          const letterColor = revealed && (isCorrect || (isSelected && !isCorrect)) ? '#fff' : 'var(--ink-soft)'
          const letterBg    = revealed && isCorrect ? 'var(--ok)'
            : revealed && isSelected && !isCorrect ? 'var(--err)' : 'transparent'
          const letterBorder = revealed && isCorrect ? 'var(--ok)'
            : revealed && isSelected && !isCorrect ? 'var(--err)' : 'var(--rule)'

          // Colorblind: show ✓/✗ icon in badge instead of just letter when answered
          const badge = revealed && isCorrect ? '✓'
            : revealed && isSelected && !isCorrect ? '✗'
            : LETTERS[i]

          return (
            <motion.button
              key={opt.n}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(opt)}
              disabled={revealed}
              aria-label={`${LETTERS[i]}: ${opt.ne ?? opt.n}`}
              aria-pressed={revealed && isSelected}
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
              <span aria-hidden="true" style={{
                position: 'absolute', right: 8, top: 8,
                fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.18em',
                color: letterColor, background: letterBg,
                border: `1px solid ${letterBorder}`,
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {badge}
              </span>
              <FlagEmoji emoji={opt.f} width={70} height={46} style={{ objectFit: 'contain' }} />
            </motion.button>
          )
        })}
      </div>
    )
  }

  // List layout: flag2country, hint, lightning, capital, currency, language, marathon
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: 'grid', gap: 10, marginTop: 20 }}>
      {options.map((opt, i) => {
        const isCorrect  = opt.n === correctName
        const isSelected = selected === opt.n

        let bg     = 'var(--surface)'
        let border = '1px solid var(--rule)'
        let color  = 'var(--ink)'
        if (revealed && isCorrect)                { bg = 'var(--ok-bg)';  border = '1px solid var(--ok)';  color = '#eef7ed' }
        if (revealed && isSelected && !isCorrect) { bg = 'var(--err-bg)'; border = '1px solid var(--err)'; color = '#fbe9e9' }

        const label = mode === 'capital'   ? opt.c
          : mode === 'currency' ? (language === 'en' ? (opt.curr?.en ?? opt.c) : (opt.curr?.es ?? opt.c))
          : mode === 'language' ? (language === 'en' ? (opt.lang?.en ?? opt.c) : (opt.lang?.es ?? opt.c))
          : (language === 'en' ? opt.ne : opt.n)

        const letterColor  = revealed && (isCorrect || (isSelected && !isCorrect)) ? '#fff' : 'var(--ink-soft)'
        const letterBg     = revealed && isCorrect ? 'var(--ok)'
          : revealed && isSelected && !isCorrect ? 'var(--err)' : 'transparent'
        const letterBorder = revealed && isCorrect ? 'var(--ok)'
          : revealed && isSelected && !isCorrect ? 'var(--err)' : 'var(--rule)'

        // Colorblind: ✓/✗ replaces letter in badge after answer
        const badge = revealed && isCorrect ? '✓'
          : revealed && isSelected && !isCorrect ? '✗'
          : LETTERS[i]

        return (
          <motion.button
            key={opt.n}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClick(opt)}
            disabled={revealed}
            aria-label={`${LETTERS[i]}: ${label}`}
            aria-pressed={revealed && isSelected}
            style={{
              position: 'relative', background: bg, border, color,
              padding: '14px 44px 14px 16px',
              cursor: revealed ? 'default' : 'pointer',
              textAlign: 'left',
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background .18s, border-color .18s',
            }}
          >
            <span style={{ flex: 1 }}>{label}</span>

            {/* ABCD / ✓✗ badge */}
            <span aria-hidden="true" style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: "'DM Mono', monospace",
              fontSize: revealed && (isCorrect || isSelected) ? 13 : 10,
              letterSpacing: '0.18em',
              color: letterColor, background: letterBg,
              border: `1px solid ${letterBorder}`,
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: revealed ? 700 : 400,
            }}>
              {badge}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
