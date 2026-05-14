import { useGameStore, regionMastery, isMastered } from '../store/gameStore'
import { FM_REGIONS, FM_COUNTRIES } from '../data/countries'
import { FlagEmoji } from '../components/FlagEmoji'
import { useT } from '../i18n/useT'
import { useDesktop } from '../hooks/useDesktop'

// Reusable section label — matches home screen's ✦ style
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: "'DM Mono', monospace", fontSize: 9.5,
      letterSpacing: '0.28em', color: 'var(--ink-soft)',
      textTransform: 'uppercase', marginBottom: 10,
    }}>
      <span style={{ color: 'var(--gold)' }}>✦</span>
      {label}
    </div>
  )
}

export function StatsScreen() {
  const { masteryCountries, dailyStreak, bestStreak, totalGames, totalCorrect, totalQuestions, goHome, language } = useGameStore()
  const t         = useT()
  const isDesktop = useDesktop()
  const acc       = totalQuestions > 0 ? Math.round((100 * totalCorrect) / totalQuestions) : null

  const hardest = FM_COUNTRIES
    .map(c => {
      const m = masteryCountries[c.n]
      if (!m || m.seen === 0) return null
      return { c, ratio: m.hits / m.seen, seen: m.seen }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 5)

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Header — same structure as GameScreen */}
      <header style={{
        background: 'var(--chrome-bg)',
        color:      'var(--chrome-text)',
        padding:    '14px 16px 14px',
        boxShadow:  '0 2px 0 var(--gold)',
        position:   'sticky',
        top:        0,
        zIndex:     10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={goHome}
            style={{ background: 'none', border: 'none', color: 'var(--chrome-text)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer', textTransform: 'uppercase', padding: '6px 0' }}
          >
            {t('stats.back')}
          </button>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: 'var(--gold-light)' }}>
            {t('stats.title')}
          </div>
          <div style={{ width: 54 }} />
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: isDesktop ? 1200 : undefined, margin: '0 auto', width: '100%' }}>

        {/* Daily streak hero */}
        <div style={{ border: '1px solid var(--gold)', background: 'rgba(184,135,42,0.08)', padding: '22px 20px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontStyle: 'italic', fontSize: 64, lineHeight: 1, color: 'var(--gold)' }}>
            {dailyStreak}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, letterSpacing: '0.32em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginTop: 8 }}>
            🔥 {t('stats.daily')}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { value: totalGames,                      label: t('home.games')      },
            { value: acc !== null ? `${acc}%` : '—',  label: t('home.accuracy')   },
            { value: bestStreak,                      label: t('home.bestStreak') },
          ].map(({ value, label }) => (
            <div key={label} style={{ border: '1px solid var(--rule)', background: 'var(--surface)', padding: '10px 6px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)' }}>{value}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: '0.18em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginTop: 4, whiteSpace: 'pre-line' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Region mastery */}
        <div>
          <SectionLabel label={t('stats.byRegion')} />
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 8 }}>
            {FM_REGIONS.map(region => {
              const mastery  = regionMastery(region.id, masteryCountries)
              const total    = FM_COUNTRIES.filter(c => c.r === region.id).length
              const mastered = FM_COUNTRIES.filter(c => c.r === region.id && isMastered(masteryCountries[c.n] ?? { seen: 0, hits: 0 })).length
              const pct      = Math.round(mastery * 100)
              const name     = language === 'en' ? region.nameEn : region.name
              return (
                <div key={region.id} style={{ border: '1px solid var(--rule)', background: 'var(--surface)', padding: '12px 14px', boxShadow: 'var(--shadow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: 'italic', fontSize: 15, color: 'var(--ink)' }}>{name}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: mastery >= 0.99 ? 'var(--gold)' : 'var(--ink-soft)', textTransform: 'uppercase' }}>
                      {mastered}/{total} · {pct}%
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'var(--rule)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: mastery >= 0.99 ? 'var(--gold)' : 'linear-gradient(to right, var(--gold-light), var(--gold))', transition: 'width 0.6s ease', borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hardest countries */}
        <div>
          <SectionLabel label={t('stats.hardest')} />
          {hardest.length === 0 ? (
            <div style={{ border: '1px solid var(--rule)', background: 'var(--surface-subtle)', padding: '24px 16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)' }}>
                {t('stats.noData')}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 7 }}>
              {hardest.map(({ c, ratio, seen }) => {
                const name = language === 'en' ? c.ne : c.n
                const pct  = Math.round(ratio * 100)
                return (
                  <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--rule)', padding: '10px 14px', background: 'var(--surface)', boxShadow: 'var(--shadow)' }}>
                    <FlagEmoji emoji={c.f} width={40} height={26} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14 }}>{name}</div>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{c.c}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: pct < 50 ? 'var(--err)' : 'var(--ok)' }}>{pct}%</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>{seen}×</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
