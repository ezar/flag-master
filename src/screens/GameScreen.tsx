import { useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { FlagStage }      from '../components/FlagStage'
import { OptionsGrid }    from '../components/OptionsGrid'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { ProgressBar }    from '../components/ProgressBar'
import { makeHint, norm } from '../engine/questionEngine'
import { useT }           from '../i18n/useT'
import {
  playCorrect,
  playWrong,
  playStreak,
  playTimeout,
} from '../audio/audioEngine'

const QUESTIONS_PER_ROUND = 10
const POINTS_BASE: Record<string, number> = { easy: 10, medium: 15, hard: 20 }

export function GameScreen() {
  const {
    mode, stage, qIndex,
    currentCountry, currentOptions,
    score, streak, answered,
    answer, nextQuestion, goHome,
    language,
  } = useGameStore()

  const t = useT()

  // Track what the last answer was (for FeedbackBanner)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
  // Capture pointsEarned BEFORE answer() increments streak
  const [lastPointsEarned, setLastPointsEarned] = useState(0)

  // Type mode local state
  const [writeValue,    setWriteValue]    = useState('')
  const [writeFeedback, setWriteFeedback] = useState<string | null>(null)

  // handleTimeout must be defined before the null guard (hooks order rule).
  const handleTimeout = useCallback(() => {
    if (!answered) {
      playTimeout()
      setLastAnswerCorrect(false)
      answer(false)
      playWrong()
    }
  }, [answered, answer])

  if (!currentCountry) return null

  const country = currentCountry
  // Language-aware country name
  const countryName = language === 'en' ? country.ne : country.n

  // Hint uses the language-appropriate name
  const hint = mode === 'hint' ? makeHint(countryName, stage) : undefined

  function handleAnswer(correct: boolean) {
    const pts = POINTS_BASE[stage] + streak * 2
    setLastPointsEarned(pts)
    setLastAnswerCorrect(correct)
    answer(correct)
    if (correct) {
      if (streak >= 2) playStreak(); else playCorrect()
    } else {
      playWrong()
    }
  }

  function handleNext() {
    setWriteValue('')
    setWriteFeedback(null)
    nextQuestion()
  }

  function submitWrite() {
    if (answered) return
    // Compare against language-appropriate name
    const correct = norm(writeValue) === norm(countryName)
    setWriteFeedback(
      correct
        ? t('game.type.correct', { name: countryName })
        : writeValue
          ? t('game.type.wrongTyped', { name: countryName, typed: writeValue })
          : t('game.type.wrong', { name: countryName })
    )
    handleAnswer(correct)
  }

  const modeLabel = t(`mode.label.${mode}`)
  const questionLine =
    t('game.questionOf', { n: qIndex + 1, total: QUESTIONS_PER_ROUND }) +
    (mode === 'lightning' ? ' ' + t('game.lightning.suffix') : '') +
    (mode === 'type'      ? ' ' + t('game.type.suffix')      : '')

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────── */}
      <header style={{
        background: 'var(--ink)',
        color:      'var(--paper)',
        padding:    '14px 16px 0',
        boxShadow:  '0 2px 0 var(--gold)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button
            onClick={goHome}
            style={{
              background:    'none',
              border:        'none',
              color:         'var(--paper)',
              fontFamily:    "'DM Mono', monospace",
              fontSize:      10,
              letterSpacing: '0.2em',
              cursor:        'pointer',
              padding:       '6px 0',
              textTransform: 'uppercase',
            }}
          >
            {t('game.back')}
          </button>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle:  'italic',
            fontSize:   14,
            color:      'var(--gold-light)',
          }}>
            {modeLabel}
          </div>
          <div style={{ width: 54 }} />
        </div>

        {/* HUD stats row */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:10 }}>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize:   20,
              lineHeight: 1,
              color:      'var(--gold-light)',
            }}>
              {score}
            </div>
            <div style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.18em',
              color:         'rgba(245,237,214,0.55)',
              textTransform: 'uppercase',
            }}>
              {t('game.points')}
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize:   20,
              lineHeight: 1,
              color:      'var(--paper)',
              display:    'flex',
              alignItems: 'center',
              gap:        4,
            }}>
              <span style={{
                color:     'var(--gold-light)',
                fontSize:  14,
                animation: 'flicker 1.4s ease-in-out infinite',
              }}>✦</span>
              {streak}
            </div>
            <div style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.18em',
              color:         'rgba(245,237,214,0.55)',
              textTransform: 'uppercase',
            }}>
              {t('game.streak')}
            </div>
          </div>
          <div style={{ marginLeft:'auto', textAlign:'right' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize:   20,
              lineHeight: 1,
              color:      'var(--paper)',
            }}>
              {qIndex + 1}/{QUESTIONS_PER_ROUND}
            </div>
            <div style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.18em',
              color:         'rgba(245,237,214,0.55)',
              textTransform: 'uppercase',
            }}>
              {t('game.question')}
            </div>
          </div>
        </div>

        <ProgressBar current={qIndex} total={QUESTIONS_PER_ROUND} />
      </header>

      {/* ── QUESTION AREA ──────────────────────────────── */}
      <div style={{ padding: '22px 22px 26px', minHeight: 'calc(100dvh - 106px)' }}>
        {/* Question label */}
        <div style={{
          fontFamily:    "'DM Mono', monospace",
          fontSize:      10,
          letterSpacing: '0.28em',
          color:         'var(--ink-soft)',
          textTransform: 'uppercase',
          textAlign:     'center',
          marginBottom:  12,
        }}>
          {questionLine}
        </div>

        {/* Flag / name card */}
        <FlagStage
          country={country}
          mode={mode}
          hint={hint}
          onTimeout={handleTimeout}
        />

        {/* ── Answer area by mode ── */}
        {mode === 'type' ? (
          <div style={{ marginTop: 22 }}>
            <div style={{
              border:     '1px solid var(--rule)',
              background: 'rgba(255,253,243,0.85)',
              padding:    '12px 12px',
              display:    'flex',
              gap:        10,
              alignItems: 'center',
            }}>
              <input
                value={writeValue}
                onChange={e => setWriteValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitWrite() }}
                disabled={answered}
                autoComplete="off"
                autoCapitalize="words"
                spellCheck={false}
                placeholder={t('game.type.placeholder')}
                style={{
                  flex:        1,
                  background:  'transparent',
                  border:      'none',
                  outline:     'none',
                  fontFamily:  "'Playfair Display', serif",
                  fontWeight:  700,
                  fontSize:    18,
                  color:       'var(--ink)',
                  padding:     '6px 4px',
                  borderBottom:'1px solid var(--rule)',
                }}
              />
              <button
                onClick={submitWrite}
                disabled={answered}
                style={{
                  background:    'var(--ink)',
                  color:         'var(--paper)',
                  border:        'none',
                  padding:       '10px 14px',
                  cursor:        answered ? 'default' : 'pointer',
                  fontFamily:    "'DM Mono', monospace",
                  fontSize:      10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                {t('game.type.submit')}
              </button>
            </div>
            {writeFeedback && (
              <div style={{
                marginTop:  14,
                textAlign:  'center',
                fontFamily: "'Playfair Display', serif",
                fontStyle:  'italic',
                fontSize:   15,
                color:      lastAnswerCorrect ? 'var(--ok)' : 'var(--err)',
              }}>
                {writeFeedback}
              </div>
            )}
          </div>
        ) : (
          <OptionsGrid
            key={qIndex}
            options={currentOptions}
            mode={mode}
            correctName={country.n}
            onAnswer={handleAnswer}
          />
        )}

        {/* Feedback banner — shown after answering in non-type modes */}
        {answered && mode !== 'type' && (
          <FeedbackBanner
            correct={lastAnswerCorrect}
            country={country}
            pointsEarned={lastPointsEarned}
            streak={streak}
          />
        )}

        {/* Next button */}
        {answered && (
          <div style={{ display:'flex', justifyContent:'center', marginTop:18 }}>
            <button
              onClick={handleNext}
              style={{
                background:    'var(--ink)',
                color:         'var(--paper)',
                border:        'none',
                padding:       '13px 26px',
                cursor:        'pointer',
                fontFamily:    "'DM Mono', monospace",
                fontSize:      10.5,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                boxShadow:     '0 6px 18px -10px rgba(26,18,9,0.6)',
                animation:     'pop-in .25s ease',
              }}
            >
              {t('game.next')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes pop-in  { from{transform:translateY(6px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  )
}
