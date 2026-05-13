import { useState } from 'react'
import { FM_COUNTRIES, FM_REGIONS } from '../data/countries'
import { useGameStore } from '../store/gameStore'
import { FlagEmoji } from '../components/FlagEmoji'
import { useT } from '../i18n/useT'

export function ReviewScreen() {
  const { goHome, language } = useGameStore()
  const t = useT()
  const [regionFilter, setRegionFilter] = useState<string | null>(null)

  const filtered = regionFilter
    ? FM_COUNTRIES.filter(c => c.r === regionFilter)
    : FM_COUNTRIES

  const tabs = [
    { id: null,         label: t('review.all') },
    ...FM_REGIONS.map(r => ({ id: r.id, label: language === 'en' ? r.nameEn : r.name })),
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 16px', boxShadow: '0 2px 0 var(--gold)', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 10 }}>
        <button
          onClick={goHome}
          style={{ background: 'none', border: 'none', color: 'var(--paper)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer', textTransform: 'uppercase', padding: 0, flexShrink: 0 }}
        >
          {t('review.back')}
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: 'var(--gold-light)', flex: 1, textAlign: 'center' }}>
          {t('review.title')}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(245,237,214,0.55)', letterSpacing: '0.14em', flexShrink: 0 }}>
          {filtered.length}
        </div>
      </header>

      {/* Region filter tabs */}
      <div style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--rule)', padding: '10px 14px', display: 'flex', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' } as React.CSSProperties}>
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
              fontSize:      9.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              whiteSpace:    'nowrap',
              borderRadius:  2,
              transition:    'all .15s ease',
              flexShrink:    0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flag grid */}
      <div style={{ flex: 1, padding: '14px 12px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filtered.map(c => {
          const name = language === 'en' ? c.ne : c.n
          return (
            <div
              key={c.n}
              style={{ border: '1px solid var(--rule)', background: 'rgba(255,253,243,0.65)', padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow)' }}
            >
              <FlagEmoji
                emoji={c.f}
                style={{ width: '100%', maxWidth: 120, height: 'auto', minHeight: 52, objectFit: 'contain', borderRadius: 2, filter: 'drop-shadow(0 2px 6px rgba(26,18,9,0.15))' }}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 13, color: 'var(--ink)', lineHeight: 1.2 }}>
                  {name}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 3 }}>
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
