import { useGameStore, regionMastery, isMastered } from '../store/gameStore'
import { FM_REGIONS, FM_COUNTRIES } from '../data/countries'
import { FlagEmoji } from '../components/FlagEmoji'
import { useT } from '../i18n/useT'

export function StatsScreen() {
  const { masteryCountries, dailyStreak, bestStreak, totalGames, totalCorrect, totalQuestions, goHome, language } = useGameStore()
  const t   = useT()
  const acc = totalQuestions > 0 ? Math.round((100 * totalCorrect) / totalQuestions) : null

  // Countries sorted by difficulty (lowest hit/seen ratio, at least 1 play)
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
      {/* Header */}
      <header style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 16px', boxShadow: '0 2px 0 var(--gold)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={goHome}
          style={{ background: 'none', border: 'none', color: 'var(--paper)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer', textTransform: 'uppercase', padding: 0 }}
        >
          {t('stats.back')}
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: 'var(--gold-light)', flex: 1, textAlign: 'center' }}>
          {t('stats.title')}
        </div>
        <div style={{ width: 54 }} />
      </header>

      <div style={{ padding: '22px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Daily streak hero */}
        <div style={{ border: '1px solid var(--gold)', background: 'rgba(184,135,42,0.08)', padding: '18px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 56, lineHeight: 1, color: 'var(--gold)' }}>
            {dailyStreak}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, letterSpacing: '0.28em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginTop: 6 }}>
            🔥 {t('stats.daily')}
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { value: totalGames,                             label: 'home.games'   },
            { value: acc !== null ? `${acc}%` : '—',        label: 'home.accuracy' },
            { value: bestStreak,                             label: 'home.bestStreak' },
          ].map(({ value, label }) => (
            <div key={label} style={{ border: '1px solid var(--rule)', background: 'rgba(255,253,243,0.55)', padding: '10px 6px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: 'var(--ink)' }}>{value}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: '0.18em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginTop: 4, whiteSpace: 'pre-line' }}>
                {t(label)}
              </div>
            </div>
          ))}
        </div>

        {/* Region mastery */}
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, letterSpacing: '0.28em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: 10 }}>
            ✦ {t('stats.byRegion')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FM_REGIONS.map(region => {
              const mastery  = regionMastery(region.id, masteryCountries)
              const total    = FM_COUNTRIES.filter(c => c.r === region.id).length
              const mastered = FM_COUNTRIES.filter(c => c.r === region.id && isMastered(masteryCountries[c.n] ?? { seen: 0, hits: 0 })).length
              const pct      = Math.round(mastery * 100)
              const name     = language === 'en' ? region.nameEn : region.name
              return (
                <div key={region.id} style={{ border: '1px solid var(--rule)', background: 'rgba(255,253,243,0.55)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: 'italic', fontSize: 14, color: 'var(--ink)' }}>{name}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: mastery >= 0.99 ? 'var(--gold)' : 'var(--ink-soft)', textTransform: 'uppercase' }}>
                      {mastered}/{total} · {pct}%
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--rule)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: mastery >= 0.99 ? 'var(--gold)' : 'linear-gradient(to right, var(--gold-light), var(--gold))', transition: 'width 0.5s ease', borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hardest countries */}
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, letterSpacing: '0.28em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: 10 }}>
            ✦ {t('stats.hardest')}
          </div>
          {hardest.length === 0 ? (
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', textAlign: 'center', padding: '16px 0' }}>
              {t('stats.noData')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hardest.map(({ c, ratio, seen }) => {
                const name = language === 'en' ? c.ne : c.n
                const pct  = Math.round(ratio * 100)
                return (
                  <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--rule)', padding: '8px 12px', background: 'rgba(255,253,243,0.55)' }}>
                    <FlagEmoji emoji={c.f} width={38} height={25} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 13 }}>{name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: pct < 50 ? 'var(--err)' : 'var(--ok)', fontWeight: 700 }}>{pct}%</div>
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
