import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { FM_COUNTRIES } from '../data/countries'
import { getDailyCountry, shuffle, pickDistractors } from '../engine/questionEngine'
import { FlagEmoji } from '../components/FlagEmoji'
import { useT } from '../i18n/useT'
import { useDesktop } from '../hooks/useDesktop'

const MAX_ATTEMPTS = 6

function getDayNumber(): number {
  return Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 86_400_000) + 1
}

export function DailyScreen() {
  const { goHome, language, lastDailyDate, lastDailyGuesses, setDailyResult } = useGameStore()
  const t         = useT()
  const isDesktop = useDesktop()

  const today    = new Date().toISOString().slice(0, 10)
  const dayN     = getDayNumber()
  const country  = useMemo(() => getDailyCountry(FM_COUNTRIES, today), [today])
  const name     = language === 'en' ? country.ne : country.n

  const alreadyPlayed = lastDailyDate === today

  // Local game state — initialise from saved if already played today
  const savedGuesses = alreadyPlayed ? (lastDailyGuesses ?? []) : []
  const [guesses,  setGuesses]  = useState<boolean[]>(savedGuesses)
  const [done,     setDone]     = useState(alreadyPlayed)
  const [options,  setOptions]  = useState<typeof FM_COUNTRIES>(() =>
    shuffle([country, ...pickDistractors(country, FM_COUNTRIES, 3)])
  )
  const [copied, setCopied] = useState(false)

  const attempt   = guesses.length          // 0-based current attempt index
  const won       = guesses.includes(true)
  const blurPx    = done ? 0 : Math.max(0, (MAX_ATTEMPTS - attempt) * 2)

  function handleGuess(opt: typeof FM_COUNTRIES[number]) {
    if (done) return
    const correct = opt.n === country.n
    const next    = [...guesses, correct]
    setGuesses(next)

    if (correct || next.length >= MAX_ATTEMPTS) {
      setDone(true)
      setDailyResult(today, next)
    } else {
      // Fresh distractors for next attempt
      setOptions(shuffle([country, ...pickDistractors(country, FM_COUNTRIES, 3)]))
    }
  }

  async function handleShare() {
    const grid  = guesses.map(g => g ? '🟩' : '🟥').join('')
    const score = won ? `${guesses.length}/6` : 'X/6'
    const text  = `🌍 FlagMaster · ${t('daily.dayN', { n: dayN })}\n${grid} (${score})\nhttps://ezar.github.io/flag-master/`
    try {
      if (navigator.share) { await navigator.share({ title: 'FlagMaster Daily', text }) }
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    } catch { /* cancelled */ }
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <header style={{ background:'var(--chrome-bg)', color:'var(--chrome-text)', padding:'14px 16px', boxShadow:'0 2px 0 var(--gold)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={goHome} style={{ background:'none', border:'none', color:'var(--chrome-text)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.2em', cursor:'pointer', textTransform:'uppercase', padding:'6px 0' }}>
            {t('daily.back')}
          </button>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:14, color:'var(--gold-light)' }}>{t('daily.title')}</div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, color:'rgba(245,237,214,0.55)', letterSpacing:'0.18em' }}>
              {t('daily.dayN', { n: dayN })}
            </div>
          </div>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:'rgba(245,237,214,0.6)', letterSpacing:'0.14em', minWidth:40, textAlign:'right' }}>
            {attempt}/{MAX_ATTEMPTS}
          </div>
        </div>
        {/* Attempt pips */}
        <div style={{ display:'flex', gap:4, marginTop:10, justifyContent:'center' }}>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <div key={i} style={{
              width:  22, height: 6, borderRadius: 3,
              background: i < guesses.length
                ? (guesses[i] ? 'var(--ok)' : 'var(--err)')
                : i === attempt && !done
                  ? 'var(--gold)'
                  : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding: isDesktop ? '40px 60px' : '24px 20px', gap:20 }}>

        {/* Flag card with progressive blur */}
        <div style={{ width:'100%', maxWidth: isDesktop ? 480 : 340 }}>
          <div style={{ border:'1px solid var(--rule)', background:'var(--surface-hi)', padding:'28px 20px', textAlign:'center', boxShadow:'var(--shadow)', borderRadius:2 }}>
            <div style={{ transition:'filter 0.6s ease', filter:`blur(${blurPx}px)` }}>
              <FlagEmoji
                emoji={country.f}
                style={{ width:'100%', maxWidth: isDesktop ? 360 : 240, height:'auto', minHeight: isDesktop ? 130 : 90, objectFit:'contain', display:'block', margin:'0 auto', borderRadius:3 }}
              />
            </div>
            {!done && (
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:8.5, letterSpacing:'0.18em', color:'var(--ink-soft)', textTransform:'uppercase', marginTop:14, opacity:0.7 }}>
                {t('daily.hint')}
              </div>
            )}
          </div>
        </div>

        {/* Result or options */}
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="result"
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              style={{ width:'100%', maxWidth: isDesktop ? 480 : 340, textAlign:'center' }}
            >
              {/* Emoji grid */}
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:22, letterSpacing:4, marginBottom:12 }}>
                {guesses.map(g => g ? '🟩' : '🟥').join('')}
              </div>

              {won ? (
                <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontWeight:700, fontSize:22, color:'var(--ok)', marginBottom:6 }}>
                  {t('daily.correct')} {name}
                </div>
              ) : (
                <>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:18, color:'var(--err)', marginBottom:4 }}>
                    {t('daily.failed')}
                  </div>
                  <div style={{ fontFamily:"'Libre Baskerville', serif", fontSize:13, color:'var(--ink-soft)', marginBottom:6 }}>
                    {t('daily.answer', { name })}
                  </div>
                </>
              )}

              {alreadyPlayed && !won && (
                <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.2em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:12 }}>
                  {t('daily.alreadyPlayed')}
                </div>
              )}

              <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <button onClick={goHome} style={{ padding:'13px 8px', border:'1px solid var(--rule)', background:'transparent', color:'var(--ink)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase', cursor:'pointer' }}>
                  {t('game.back')}
                </button>
                <button onClick={handleShare} style={{ padding:'13px 8px', border:'1px solid var(--gold)', background:'rgba(184,135,42,0.1)', color:'var(--gold)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase', cursor:'pointer' }}>
                  {copied ? t('daily.copied') : `↑ ${t('daily.share')}`}
                </button>
              </div>

              <div style={{ marginTop:14, fontFamily:"'DM Mono', monospace", fontSize:8.5, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase', opacity:0.6 }}>
                {t('daily.comeback')}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`attempt-${attempt}`}
              initial={{ opacity:0, scale:0.97 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.97 }}
              transition={{ duration:0.15 }}
              style={{ width:'100%', maxWidth: isDesktop ? 480 : 340 }}
            >
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase', textAlign:'center', marginBottom:10 }}>
                {t('daily.attempt', { n: attempt + 1 })}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {options.map(opt => {
                  const optName = language === 'en' ? opt.ne : opt.n
                  return (
                    <motion.button
                      key={opt.n}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleGuess(opt)}
                      style={{
                        padding:    '14px 10px',
                        border:     '1px solid var(--rule)',
                        background: 'var(--surface)',
                        color:      'var(--ink)',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontSize:   14,
                        cursor:     'pointer',
                        textAlign:  'center',
                        transition: 'all .15s',
                        lineHeight: 1.25,
                      }}
                    >
                      {optName}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
