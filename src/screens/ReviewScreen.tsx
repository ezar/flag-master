import { useState } from 'react'
import { FM_COUNTRIES, FM_REGIONS } from '../data/countries'
import { useGameStore } from '../store/gameStore'
import { FlagEmoji } from '../components/FlagEmoji'
import { useT } from '../i18n/useT'
import { useDesktop } from '../hooks/useDesktop'

export function ReviewScreen() {
  const { goHome, language } = useGameStore()
  const t         = useT()
  const isDesktop = useDesktop()
  const [regionFilter, setRegionFilter] = useState<string | null>(null)

  const filtered = regionFilter
    ? FM_COUNTRIES.filter(c => c.r === regionFilter)
    : FM_COUNTRIES

  const tabs = [
    { id: null, label: t('review.all') },
    ...FM_REGIONS.map(r => ({ id: r.id, label: language === 'en' ? r.nameEn : r.name })),
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Header — same structure as GameScreen */}
      <header style={{
        background: 'var(--ink)',
        color:      'var(--paper)',
        padding:    '14px 16px 14px',
        boxShadow:  '0 2px 0 var(--gold)',
        position:   'sticky',
        top:        0,
        zIndex:     10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={goHome}
            style={{ background: 'none', border: 'none', color: 'var(--paper)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer', textTransform: 'uppercase', padding: '6px 0' }}
          >
            {t('review.back')}
          </button>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: 'var(--gold-light)' }}>
            {t('review.title')}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(245,237,214,0.55)', letterSpacing: '0.14em' }}>
            {filtered.length}
          </div>
        </div>
      </header>

      {/* Region filter tabs — matches HomeScreen pill style */}
      <div style={{
        background:    'var(--paper-2)',
        borderBottom:  '1px solid var(--rule)',
        padding:       '10px 14px',
        display:       'flex',
        gap:           6,
        overflowX:     'auto',
        scrollbarWidth: 'none',
      } as React.CSSProperties}>
        {tabs.map(tab => (
          <button
            key={String(tab.id)}
            onClick={() => setRegionFilter(tab.id)}
            style={{
              background:    regionFilter === tab.id ? 'var(--ink)' : 'transparent',
              color:         regionFilter === tab.id ? 'var(--paper)' : 'var(--ink-soft)',
              border:        `1px solid ${regionFilter === tab.id ? 'var(--ink)' : 'var(--rule)'}`,
              padding:       '5px 12px',
              cursor:        'pointer',
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              whiteSpace:    'nowrap',
              flexShrink:    0,
              transition:    'all .15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flag grid — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div style={{ flex: 1, padding: '14px 12px 28px', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr', gap: isDesktop ? 12 : 10, alignContent: 'start' }}>
        {filtered.map(c => {
          const name = language === 'en' ? c.ne : c.n
          return (
            <div
              key={c.n}
              style={{
                border:         '1px solid var(--rule)',
                background:     'rgba(255,253,243,0.65)',
                padding:        '14px 10px 12px',
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                gap:            8,
                boxShadow:      'var(--shadow)',
                transition:     'box-shadow .15s',
              }}
            >
              <FlagEmoji
                emoji={c.f}
                style={{ width: '100%', maxWidth: 110, height: 'auto', minHeight: 46, objectFit: 'contain', borderRadius: 2, filter: 'drop-shadow(0 2px 6px rgba(26,18,9,0.15))' }}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 13, color: 'var(--ink)', lineHeight: 1.25 }}>
                  {name}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: 10, color: 'var(--ink-soft)', marginTop: 3 }}>
                  {c.c}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
