import { useT } from '../i18n/useT'

interface Props {
  bestStreak:     number
  dailyStreak:    number
  totalGames:     number
  totalCorrect:   number
  totalQuestions: number
}

export function StatCard({ bestStreak, dailyStreak, totalGames, totalCorrect, totalQuestions }: Props) {
  const t = useT()

  const acc = totalQuestions > 0
    ? Math.round((100 * totalCorrect) / totalQuestions)
    : null

  const stats: Array<{ value: number | string; label: string; gold: boolean }> = [
    { value: dailyStreak > 0 ? `🔥${dailyStreak}` : bestStreak, label: dailyStreak > 0 ? t('home.dailyStreak') : t('home.bestStreak'), gold: true  },
    { value: totalGames,                       label: t('home.games'),      gold: false },
    { value: totalCorrect,                     label: t('home.correct'),    gold: false },
    { value: acc !== null ? `${acc}%` : '—',   label: t('home.accuracy'),   gold: false },
  ]

  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        background: 'rgba(255,253,243,0.45)',
        padding: '14px 14px 12px',
        marginTop: 4,
        position: 'relative',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Top-left bracket */}
      <div style={{ position:'absolute', left:-1, top:-1, width:10, height:10, border:'1px solid var(--ink)', borderRight:'none', borderBottom:'none', opacity:.55 }} />
      {/* Bottom-right bracket */}
      <div style={{ position:'absolute', right:-1, bottom:-1, width:10, height:10, border:'1px solid var(--ink)', borderLeft:'none', borderTop:'none', opacity:.55 }} />

      <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.28em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:10 }}>
        <span style={{ color:'var(--gold)' }}>✦</span>
        {t('home.logbook')}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
        {stats.map(({ value, label, gold }, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              padding: '6px 4px',
              borderRight: i < stats.length - 1 ? '1px dashed var(--rule)' : 'none',
            }}
          >
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 22,
              lineHeight: 1,
              color: gold ? 'var(--gold)' : 'var(--ink)',
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.18em',
              color: 'var(--ink-soft)',
              textTransform: 'uppercase',
              marginTop: 6,
              whiteSpace: 'pre-line',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
