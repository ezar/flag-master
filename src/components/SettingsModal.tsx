import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useT } from '../i18n/useT'
import type { Lang } from '../i18n/translations'

interface Props {
  open:    boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: Props) {
  const { audioEnabled, stage, language, setAudio, setStage, setLanguage, resetProgress } = useGameStore()
  const t = useT()
  const [confirmReset, setConfirmReset] = useState(false)

  function handleReset() {
    if (confirmReset) {
      resetProgress()
      setConfirmReset(false)
      onClose()
    } else {
      setConfirmReset(true)
    }
  }

  const diffLabels: Record<string, string> = {
    easy:   t('diff.easy.name'),
    medium: t('diff.medium.name'),
    hard:   t('diff.hard.name'),
  }
  const diffIcons  = { easy: '🌿', medium: '⚓', hard: '🗺️' }

  const langOptions: { id: Lang; iso: string; label: string }[] = [
    { id: 'es', iso: 'es', label: 'Español' },
    { id: 'en', iso: 'gb', label: 'English' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position:   'fixed',
              inset:      0,
              background: 'rgba(26,18,9,0.55)',
              zIndex:     100,
            }}
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position:   'fixed',
              bottom:     0,
              left:       0,
              right:      0,
              margin:     '0 auto',
              width:      '100%',
              maxWidth:   820,
              maxHeight:  '85vh',
              overflowY:  'auto',
              zIndex:     101,
              background: 'var(--paper)',
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10 0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"), radial-gradient(140% 90% at 20% 0%, #faf2da 0%, #f5edd6 38%, #ecdfbd 100%)`,
              backgroundBlendMode: 'multiply, normal',
              borderTop:  '2px solid var(--gold)',
              boxShadow:  '0 -12px 40px -8px rgba(26,18,9,0.35)',
              borderRadius: '8px 8px 0 0',
              padding:    '0 0 32px',
            }}
          >
            {/* Handle */}
            <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
              <div style={{ width:40, height:4, borderRadius:2, background:'var(--rule)' }}/>
            </div>

            {/* Header */}
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '14px 22px 0',
              borderBottom:   '1px solid var(--rule)',
              paddingBottom:  14,
              marginBottom:   4,
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize:   20,
                color:      'var(--ink)',
              }}>
                {t('settings.title')}
              </h2>
              <button
                onClick={onClose}
                style={{
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  fontFamily:    "'DM Mono', monospace",
                  fontSize:      10,
                  letterSpacing: '0.2em',
                  color:         'var(--ink-soft)',
                  textTransform: 'uppercase',
                  padding:       '4px 0',
                }}
              >
                {t('settings.close')}
              </button>
            </div>

            {/* Settings rows */}
            <div style={{ padding: '8px 22px' }}>

              {/* Audio */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '16px 0',
                borderBottom:   '1px solid var(--rule)',
              }}>
                <div>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:16, color:'var(--ink)' }}>
                    {t('settings.audio')}
                  </div>
                  <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>
                    {t('settings.audio.desc')}
                  </div>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => setAudio(!audioEnabled)}
                  style={{
                    width:        52,
                    height:       28,
                    borderRadius: 14,
                    border:       'none',
                    background:   audioEnabled ? 'var(--gold)' : 'var(--rule)',
                    cursor:       'pointer',
                    position:     'relative',
                    transition:   'background 0.2s ease',
                    flexShrink:   0,
                  }}
                >
                  <div style={{
                    position:     'absolute',
                    top:          3,
                    left:         audioEnabled ? 27 : 3,
                    width:        22,
                    height:       22,
                    borderRadius: '50%',
                    background:   'var(--paper)',
                    boxShadow:    '0 1px 4px rgba(26,18,9,0.3)',
                    transition:   'left 0.2s ease',
                  }}/>
                </button>
              </div>

              {/* Language */}
              <div style={{
                padding:      '16px 0',
                borderBottom: '1px solid var(--rule)',
              }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:16, color:'var(--ink)', marginBottom:10 }}>
                  {t('settings.language')}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {langOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setLanguage(opt.id)}
                      style={{
                        background:  language === opt.id ? 'var(--ink)' : 'transparent',
                        color:       language === opt.id ? 'var(--paper)' : 'var(--ink)',
                        border:      '1px solid var(--rule)',
                        padding:     '10px 8px',
                        cursor:      'pointer',
                        fontFamily:  "'Playfair Display', serif",
                        fontWeight:  700,
                        fontSize:    14,
                        textAlign:   'center',
                        transition:  'all .15s ease',
                        display:     'flex',
                        alignItems:  'center',
                        justifyContent: 'center',
                        gap:         8,
                      }}
                    >
                      <img
                        src={`https://flagcdn.com/${opt.iso}.svg`}
                        width={22}
                        height={15}
                        style={{ objectFit:'cover', borderRadius:2, flexShrink:0 }}
                        alt=""
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty default */}
              <div style={{
                padding:      '16px 0',
                borderBottom: '1px solid var(--rule)',
              }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:16, color:'var(--ink)', marginBottom:10 }}>
                  {t('settings.difficulty')}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {(['easy','medium','hard'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStage(s)}
                      style={{
                        background:  stage === s ? 'var(--ink)' : 'transparent',
                        color:       stage === s ? 'var(--paper)' : 'var(--ink)',
                        border:      '1px solid var(--rule)',
                        padding:     '10px 6px',
                        cursor:      'pointer',
                        fontFamily:  "'Playfair Display', serif",
                        fontWeight:  700,
                        fontSize:    13,
                        textAlign:   'center',
                        transition:  'all .15s ease',
                      }}
                    >
                      {diffIcons[s]} {diffLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset progress */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:16, color:'var(--ink)', marginBottom:4 }}>
                  {t('settings.reset')}
                </div>
                <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', fontSize:12, color:'var(--ink-soft)', marginBottom:12 }}>
                  {t('settings.reset.desc')}
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    background:    confirmReset ? 'var(--err-bg)' : 'transparent',
                    color:         confirmReset ? 'var(--err)' : 'var(--ink-soft)',
                    border:        `1px solid ${confirmReset ? 'var(--err)' : 'var(--rule)'}`,
                    padding:       '10px 18px',
                    cursor:        'pointer',
                    fontFamily:    "'DM Mono', monospace",
                    fontSize:      10,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    transition:    'all .2s ease',
                  }}
                >
                  {confirmReset ? t('settings.reset.confirm') : t('settings.reset.btn')}
                </button>
                {confirmReset && (
                  <button
                    onClick={() => setConfirmReset(false)}
                    style={{
                      marginLeft:    10,
                      background:    'transparent',
                      border:        '1px solid var(--rule)',
                      color:         'var(--ink-soft)',
                      padding:       '10px 14px',
                      cursor:        'pointer',
                      fontFamily:    "'DM Mono', monospace",
                      fontSize:      10,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('settings.reset.cancel')}
                  </button>
                )}
              </div>

              {/* Version */}
              <div style={{
                paddingTop:    16,
                textAlign:     'center',
                fontFamily:    "'DM Mono', monospace",
                fontSize:      9,
                letterSpacing: '0.24em',
                color:         'var(--ink-soft)',
                textTransform: 'uppercase',
              }}>
                {t('settings.footer')} · {__BUILD_VERSION__}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
