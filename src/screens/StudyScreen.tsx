import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { FM_COUNTRIES } from '../data/countries'
import { getPool, shuffle } from '../engine/questionEngine'
import { FlagEmoji } from '../components/FlagEmoji'
import { useT } from '../i18n/useT'
import { useDesktop } from '../hooks/useDesktop'

interface CardState {
  country:  typeof FM_COUNTRIES[number]
  attempts: number   // times shown
  known:    boolean  // marked known on current pass
}

export function StudyScreen() {
  const { stage, regionFilter, language, goHome } = useGameStore()
  const t         = useT()
  const isDesktop = useDesktop()

  // Build initial deck
  const initialDeck = useMemo<CardState[]>(() => {
    const pool = getPool(stage, FM_COUNTRIES)
    const src  = regionFilter ? pool.filter(c => c.r === regionFilter) : pool
    return shuffle(src).map(country => ({ country, attempts: 0, known: false }))
  }, [stage, regionFilter])

  const [deck,      setDeck]      = useState<CardState[]>(initialDeck)
  const [deckIndex, setDeckIndex] = useState(0)
  const [revealed,  setRevealed]  = useState(false)
  const [done,      setDone]      = useState(false)
  const [knownCount, setKnownCount] = useState(0)
  const [totalShown, setTotalShown] = useState(0)

  const current = deck[deckIndex]
  if (!current && !done) return null

  function markKnown() {
    const updated = deck.map((c, i) =>
      i === deckIndex ? { ...c, known: true, attempts: c.attempts + 1 } : c
    )
    advance(updated, true)
  }

  function markUnknown() {
    // Put card at end of remaining deck
    const card    = { ...deck[deckIndex], attempts: deck[deckIndex].attempts + 1, known: false }
    const without = deck.filter((_, i) => i !== deckIndex)
    const updated = [...without, card]
    advance(updated, false)
  }

  function advance(updated: CardState[], wasKnown: boolean) {
    const newTotal = totalShown + 1
    const newKnown = knownCount + (wasKnown ? 1 : 0)
    setTotalShown(newTotal)
    setKnownCount(newKnown)
    setRevealed(false)

    // Check if all remaining are known
    const remaining = updated.filter(c => !c.known)
    if (remaining.length === 0) {
      setDone(true)
      return
    }

    // Find next unknown
    const nextIdx = updated.findIndex(c => !c.known)
    setDeck(updated)
    setDeckIndex(nextIdx)
  }

  const unknownCount = deck.filter(c => !c.known).length
  const progress     = ((initialDeck.length - unknownCount) / initialDeck.length) * 100
  const name         = language === 'en' ? current?.country.ne : current?.country.n

  // ── Results ──────────────────────────────────────────────────────────────
  if (done) {
    const accuracy = Math.round((initialDeck.length / totalShown) * 100)
    return (
      <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
        <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:64, marginBottom:12 }}>
            {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🌟' : accuracy >= 50 ? '⚓' : '🧭'}
          </div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontWeight:900, fontSize:34, color:'var(--ink)', marginBottom:8 }}>
            {t('study.done')}
          </h1>
          <p style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', color:'var(--ink-soft)', marginBottom:28 }}>
            {t('study.doneDesc', { n: initialDeck.length, pct: accuracy })}
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28 }}>
            <div style={{ border:'1px solid var(--rule)', background:'rgba(255,253,243,0.55)', padding:'14px 8px' }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:26, color:'var(--ok)' }}>{initialDeck.length}</div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color:'var(--ink-soft)', textTransform:'uppercase', marginTop:4 }}>{t('study.learned')}</div>
            </div>
            <div style={{ border:'1px solid var(--rule)', background:'rgba(255,253,243,0.55)', padding:'14px 8px' }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:26, color:'var(--gold)' }}>{totalShown}</div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color:'var(--ink-soft)', textTransform:'uppercase', marginTop:4 }}>{t('study.total')}</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <button onClick={goHome} style={{ padding:'13px', border:'1px solid var(--ink)', background:'transparent', color:'var(--ink)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase', cursor:'pointer' }}>
              {t('result.menu')}
            </button>
            <button onClick={() => { setDeck(initialDeck); setDeckIndex(0); setRevealed(false); setDone(false); setKnownCount(0); setTotalShown(0) }}
              style={{ padding:'13px', border:'none', background:'var(--ink)', color:'var(--gold)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase', cursor:'pointer' }}>
              {t('study.again')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Flash card ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <header style={{ background:'var(--ink)', color:'var(--paper)', padding:'14px 16px', boxShadow:'0 2px 0 var(--gold)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={goHome} style={{ background:'none', border:'none', color:'var(--paper)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.2em', cursor:'pointer', textTransform:'uppercase', padding:'6px 0' }}>
            {t('game.back')}
          </button>
          <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:14, color:'var(--gold-light)' }}>
            {t('study.title')}
          </div>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:'rgba(245,237,214,0.7)', letterSpacing:'0.14em' }}>
            {unknownCount}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height:3, background:'rgba(255,255,255,0.12)', marginTop:10, borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'var(--gold)', transition:'width 0.4s ease', borderRadius:2 }} />
        </div>
      </header>

      {/* Card */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding: isDesktop ? '40px 60px' : '28px 22px' }}>
        <div style={{ width:'100%', maxWidth: isDesktop ? 560 : 400 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.country.n + deckIndex}
              initial={{ opacity:0, scale:0.95 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.95 }}
              transition={{ duration:0.18 }}
            >
              {/* Flag card */}
              <div style={{ border:'1px solid var(--rule)', background:'rgba(255,253,243,0.7)', padding:'32px 24px', textAlign:'center', boxShadow:'var(--shadow)', marginBottom:20 }}>
                <FlagEmoji
                  emoji={current.country.f}
                  style={{ width:'100%', maxWidth: isDesktop ? 380 : 260, height:'auto', minHeight: isDesktop ? 140 : 100, objectFit:'contain', display:'block', margin:'0 auto', filter:'drop-shadow(0 4px 14px rgba(26,18,9,0.2))', borderRadius:3 }}
                />

                {/* Reveal: show name after clicking */}
                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity:0, y:8 }}
                      animate={{ opacity:1, y:0 }}
                      style={{ marginTop:20 }}
                    >
                      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize: isDesktop ? 28 : 22, color:'var(--ink)' }}>
                        {name}
                      </div>
                      <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', fontSize:13, color:'var(--ink-soft)', marginTop:6 }}>
                        {current.country.c}
                      </div>
                      {current.country.fun && (
                        <div style={{ marginTop:10, fontSize:12, color:'var(--gold)', fontStyle:'italic', fontFamily:"'Libre Baskerville', serif", opacity:0.85 }}>
                          💡 {language === 'en' ? current.country.fun.en : current.country.fun.es}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!revealed && (
                  <button
                    onClick={() => setRevealed(true)}
                    style={{ marginTop:20, background:'transparent', border:'1px solid var(--rule)', padding:'10px 24px', cursor:'pointer', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase' }}
                  >
                    {t('study.reveal')}
                  </button>
                )}
              </div>

              {/* Answer buttons — only shown after reveal */}
              {revealed && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <motion.button
                    whileTap={{ scale:0.97 }}
                    onClick={markUnknown}
                    style={{ padding: isDesktop ? '18px 8px' : '16px 8px', background:'var(--err-bg)', border:'1px solid var(--err)', color:'var(--err)', fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize: isDesktop ? 17 : 15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
                  >
                    ✗ {t('study.unknown')}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale:0.97 }}
                    onClick={markKnown}
                    style={{ padding: isDesktop ? '18px 8px' : '16px 8px', background:'var(--ok-bg)', border:'1px solid var(--ok)', color:'var(--ok)', fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize: isDesktop ? 17 : 15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
                  >
                    ✓ {t('study.known')}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
