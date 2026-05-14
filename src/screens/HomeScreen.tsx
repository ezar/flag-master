import { useState } from 'react'
import { CompassRose }    from '../components/CompassRose'
import { StatCard }       from '../components/StatCard'
import { WorldMap }       from '../components/WorldMap'
import { SettingsModal }  from '../components/SettingsModal'
import { useGameStore, type GameMode } from '../store/gameStore'
import { getPool }        from '../engine/questionEngine'
import { FM_COUNTRIES, FM_REGIONS } from '../data/countries'
import { useT }           from '../i18n/useT'
import { useDesktop }     from '../hooks/useDesktop'
import type { Stage }     from '../engine/questionEngine'

// ── Shared decorative divider ──────────────────────────────────────────────
function GoldDivider() {
  return (
    <div style={{ height: 7, position: 'relative', margin: '2px 0' }}>
      <div style={{ position:'absolute', left:0, right:0, top:0,    height:1, background:'var(--ink)', opacity:.55 }} />
      <div style={{ position:'absolute', left:0, right:0, bottom:0, height:1, background:'var(--ink)', opacity:.25 }} />
      <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%) rotate(45deg)', width:7, height:7, background:'var(--gold)' }} />
    </div>
  )
}

export function HomeScreen() {
  const {
    stage, mode, regionFilter,
    setStage, setMode, setRegionFilter, startGame,
    bestStreak, totalGames, totalCorrect, totalQuestions,
    dailyStreak, goStats, goReview, goProfiles, language,
    profiles, activeProfileId,
  } = useGameStore()

  const activeProfile = profiles.find(p => p.id === activeProfileId)

  const t         = useT()
  const isDesktop = useDesktop()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const basePool  = getPool(stage, FM_COUNTRIES)
  const poolCount = regionFilter
    ? basePool.filter(c => c.r === regionFilter).length
    : basePool.length

  const DIFFICULTIES: { id: Stage; icon: string; name: string; sub: string }[] = [
    { id: 'easy',   icon: '🌿', name: t('diff.easy.name'),   sub: t('diff.easy.sub')   },
    { id: 'medium', icon: '⚓', name: t('diff.medium.name'), sub: t('diff.medium.sub') },
    { id: 'hard',   icon: '🗺️', name: t('diff.hard.name'),   sub: t('diff.hard.sub')   },
  ]

  const MODES: { id: GameMode; roman: string; title: string; desc: string }[] = [
    { id: 'flag2country', roman: 'I',   title: t('mode.flag2country.title'), desc: t('mode.flag2country.desc') },
    { id: 'country2flag', roman: 'II',  title: t('mode.country2flag.title'), desc: t('mode.country2flag.desc') },
    { id: 'hint',         roman: 'III', title: t('mode.hint.title'),         desc: t('mode.hint.desc')         },
    { id: 'capital',      roman: 'IV',  title: t('mode.capital.title'),      desc: t('mode.capital.desc')      },
    { id: 'type',         roman: 'V',   title: t('mode.type.title'),         desc: t('mode.type.desc')         },
    { id: 'lightning',    roman: 'VI',  title: t('mode.lightning.title'),    desc: t('mode.lightning.desc')    },
  ]

  const regionPills = [
    { id: null,    label: t('home.allRegions') },
    ...FM_REGIONS.map(r => ({ id: r.id, label: language === 'en' ? r.nameEn : r.name })),
  ]

  // ── Reusable sections ──────────────────────────────────────────────────
  const difficultySection = (
    <>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'0 0 10px' }}>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18 }}>
          {t('home.difficulty')}
        </h2>
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
          {t('home.countries', { n: poolCount })}
        </span>
      </div>

      {/* Region filter pills */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        {regionPills.map(pill => (
          <button
            key={String(pill.id)}
            onClick={() => setRegionFilter(pill.id)}
            style={{ background: regionFilter===pill.id ? 'var(--ink)' : 'transparent', color: regionFilter===pill.id ? 'var(--paper)' : 'var(--ink-soft)', border:`1px solid ${regionFilter===pill.id ? 'var(--ink)' : 'var(--rule)'}`, padding:'4px 10px', cursor:'pointer', fontFamily:"'DM Mono', monospace", fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', borderRadius:2, transition:'all .15s' }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {DIFFICULTIES.map(d => (
          <button key={d.id} onClick={() => setStage(d.id)} style={{ background: stage===d.id ? 'var(--ink)' : 'transparent', border:'1px solid var(--rule)', padding:'12px 8px 10px', cursor:'pointer', textAlign:'center', color: stage===d.id ? 'var(--paper)' : 'var(--ink)', transition:'all .18s ease', boxShadow: stage===d.id ? '0 6px 18px -10px rgba(26,18,9,0.6)' : 'none' }}>
            <div style={{ fontSize:20, lineHeight:1 }}>{d.icon}</div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14, marginTop:6 }}>{d.name}</div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color: stage===d.id ? 'rgba(245,237,214,0.7)' : 'var(--ink-soft)', marginTop:3 }}>{d.sub}</div>
          </button>
        ))}
      </div>
    </>
  )

  const modesSection = (
    <>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'22px 0 10px' }}>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18 }}>
          {t('home.modes')}
        </h2>
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
          {t('home.chooseOne')}
        </span>
      </div>
      <div style={{ display:'grid', gap:isDesktop ? 7 : 9, gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', border: mode===m.id ? '1px solid var(--gold)' : '1px solid var(--rule)', background: mode===m.id ? 'rgba(255,253,243,0.85)' : 'rgba(255,253,243,0.55)', cursor:'pointer', textAlign:'left', color:'var(--ink)', transition:'all .18s ease' }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:22, color:'var(--gold)', width:26, textAlign:'center', lineHeight:1 }}>{m.roman}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:15 }}>{m.title}</div>
              <div style={{ fontSize:11.5, color:'var(--ink-soft)', marginTop:2, fontStyle:'italic' }}>{m.desc}</div>
            </div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:20, color: mode===m.id ? 'var(--gold)' : 'var(--ink-soft)' }}>→</div>
          </button>
        ))}
      </div>
    </>
  )

  const zarparBtn = (
    <button
      onClick={startGame}
      style={{ display:'block', width:'100%', marginTop:22, background:'var(--ink)', color:'var(--gold)', border:'none', padding:'16px 8px', fontFamily:"'DM Mono', monospace", fontSize:11, letterSpacing:'0.32em', textTransform:'uppercase', cursor:'pointer', boxShadow:'0 6px 18px -10px rgba(26,18,9,0.6)' }}
    >
      {t('home.sail')}
    </button>
  )

  // ── DESKTOP: two-column layout ─────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display:'flex', minHeight:'100dvh', alignItems:'flex-start' }}>
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        {/* ── LEFT SIDEBAR ──────────────────────────────── */}
        <aside style={{
          width:        380,
          flexShrink:   0,
          borderRight:  '1px solid var(--rule)',
          background:   'var(--paper-2)',
          padding:      '36px 28px 28px',
          display:      'flex',
          flexDirection:'column',
          gap:          20,
          overflowY:    'auto',
          position:     'sticky',
          top:          0,
          height:       '100dvh',
          alignSelf:    'flex-start',
        }}>

          {/* Decorative nautical lines */}
          <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
            <svg viewBox="0 0 380 900" preserveAspectRatio="xMidYMid slice" style={{ width:'100%', height:'100%', display:'block' }}>
              <g fill="none" stroke="var(--ink)" strokeWidth="0.6" opacity="0.06">
                <circle cx="190" cy="200" r="200"/>
                <circle cx="190" cy="200" r="130"/>
                <circle cx="190" cy="200" r="60"/>
                <line x1="190" y1="0"   x2="190" y2="900"/>
                <line x1="0"   y1="200" x2="380" y2="200"/>
                <line x1="0"   y1="0"   x2="380" y2="400"/>
                <line x1="380" y1="0"   x2="0"   y2="400"/>
              </g>
            </svg>
          </div>

          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:20, flex:1 }}>

            {/* Active profile chip */}
            {activeProfile && (
              <button
                onClick={goProfiles}
                style={{ display:'flex', alignItems:'center', gap:10, border:'1px solid var(--rule)', background:'rgba(255,253,243,0.6)', padding:'10px 14px', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
              >
                <span style={{ fontSize:24, lineHeight:1 }}>{activeProfile.avatar}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:15, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeProfile.name}</div>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:8.5, letterSpacing:'0.16em', color:'var(--ink-soft)', textTransform:'uppercase', marginTop:2 }}>{t('profile.switch')}</div>
                </div>
                <span style={{ color:'var(--gold)', fontSize:16 }}>⇄</span>
              </button>
            )}

            {/* Compass */}
            <CompassRose size={150} />

            {/* Brand */}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.38em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:6 }}>
                {t('app.eyebrow')}
              </div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontStyle:'italic', fontSize:44, lineHeight:1, letterSpacing:'-0.01em', margin:'0 0 6px', color:'var(--ink)' }}>
                Flag<span style={{ color:'var(--gold)', fontStyle:'italic', fontWeight:400 }}>·</span>Master
              </h1>
              <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', color:'var(--ink-soft)', fontSize:13 }}>
                {t('app.subtitle')}
              </div>
            </div>

            <GoldDivider />

            {/* Logbook */}
            <StatCard
              bestStreak={bestStreak}
              dailyStreak={dailyStreak}
              totalGames={totalGames}
              totalCorrect={totalCorrect}
              totalQuestions={totalQuestions}
              columns={2}
            />

            <GoldDivider />

            {/* Nav buttons — big, prominent */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { icon:'📊', label: t('home.stats'),  desc: language==='en' ? 'Mastery by region, hardest flags' : 'Maestría por región, más difíciles', action: goStats  },
                { icon:'📖', label: t('home.review'), desc: language==='en' ? 'Browse all 147 flags'             : 'Navega las 147 banderas',            action: goReview },
              ].map(({ icon, label, desc, action }) => (
                <button key={label} onClick={action} style={{ display:'flex', alignItems:'center', gap:14, border:'1px solid var(--rule)', background:'rgba(255,253,243,0.6)', padding:'14px 16px', cursor:'pointer', textAlign:'left', transition:'all .15s', color:'var(--ink)' }}>
                  <span style={{ fontSize:26, lineHeight:1, flexShrink:0 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:15 }}>{label}</div>
                    <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', fontSize:11, color:'var(--ink-soft)', marginTop:2 }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Settings — at bottom */}
            <div style={{ marginTop:'auto', borderTop:'1px solid var(--rule)', paddingTop:18 }}>
              <button
                onClick={() => setSettingsOpen(true)}
                style={{ display:'flex', alignItems:'center', gap:12, width:'100%', border:'1px solid var(--rule)', background:'transparent', padding:'12px 16px', cursor:'pointer', color:'var(--ink-soft)', transition:'all .15s' }}
              >
                <span style={{ fontSize:18 }}>⚙</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14, color:'var(--ink)' }}>{t('settings.title')}</div>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:8.5, letterSpacing:'0.2em', color:'var(--ink-soft)', textTransform:'uppercase', marginTop:2 }}>
                    {language==='en' ? 'Audio · Language · Reset' : 'Audio · Idioma · Reiniciar'}
                  </div>
                </div>
              </button>
              <div style={{ textAlign:'center', marginTop:14, fontFamily:"'DM Mono', monospace", fontSize:8, letterSpacing:'0.24em', color:'var(--ink-soft)', textTransform:'uppercase', opacity:0.6 }}>
                ✦ Septentrionem · Meridiem ✦
              </div>
            </div>

          </div>
        </aside>

        {/* ── RIGHT CONTENT — window scrolls, not inner div ── */}
        <main style={{ flex:1, padding:'28px 40px 60px', minHeight:'100dvh' }}>
          <WorldMap />
          <div style={{ marginTop:22 }}>
            {difficultySection}
          </div>
          <div style={{ marginTop:4 }}>
            {modesSection}
          </div>
          {zarparBtn}
          <div style={{ marginTop:24, textAlign:'center', fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.3em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
            {t('home.footer')}
          </div>
        </main>
      </div>
    )
  }

  // ── MOBILE: single column ─────────────────────────────────────────────
  return (
    <div style={{ position:'relative', padding:'22px 22px 28px', minHeight:'100dvh' }}>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Settings button */}
      <button onClick={() => setSettingsOpen(true)} style={{ position:'absolute', top:16, right:16, zIndex:10, background:'none', border:'1px solid var(--rule)', width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-soft)', fontSize:16, borderRadius:2, transition:'all .15s' }} title={t('settings.title')}>⚙</button>

      {/* Nautical chart lines */}
      <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, opacity:0.9 }}>
        <svg viewBox="0 0 430 900" preserveAspectRatio="xMidYMid slice" style={{ width:'100%', height:'100%', display:'block' }}>
          <g fill="none" stroke="var(--ink)" strokeWidth="0.6" opacity="0.07">
            <circle cx="215" cy="180" r="240"/><circle cx="215" cy="180" r="180" opacity="0.5"/>
            <circle cx="215" cy="180" r="120"/><circle cx="215" cy="180" r="60" opacity="0.5"/>
            <path d="M -50 180 Q 215 80 480 180"/><path d="M -50 220 Q 215 320 480 220"/>
            <line x1="215" y1="-20" x2="215" y2="900"/>
            <line x1="-20" y1="180" x2="450" y2="180"/>
            <line x1="40"  y1="-20" x2="380" y2="900"/>
            <line x1="380" y1="-20" x2="40"  y2="900"/>
          </g>
        </svg>
      </div>

      <div style={{ position:'relative', zIndex:1 }}>
        <CompassRose />

        <div style={{ textAlign:'center', marginTop:4 }}>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10.5, letterSpacing:'0.36em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
            {t('app.eyebrow')}
          </div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontStyle:'italic', fontSize:46, lineHeight:1, letterSpacing:'-0.01em', margin:'6px 0 4px', color:'var(--ink)' }}>
            Flag<span style={{ color:'var(--gold)', fontStyle:'italic', fontWeight:400 }}>·</span>Master
          </h1>
          <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', color:'var(--ink-soft)', fontSize:13.5, marginTop:2 }}>
            {t('app.subtitle')}
          </div>
        </div>

        <div style={{ height:7, position:'relative', margin:'16px 6px' }}>
          <div style={{ position:'absolute', left:0, right:0, top:0,    height:1, background:'var(--ink)', opacity:.55 }} />
          <div style={{ position:'absolute', left:0, right:0, bottom:0, height:1, background:'var(--ink)', opacity:.25 }} />
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%) rotate(45deg)', width:7, height:7, background:'var(--gold)' }} />
        </div>

        <StatCard bestStreak={bestStreak} dailyStreak={dailyStreak} totalGames={totalGames} totalCorrect={totalCorrect} totalQuestions={totalQuestions} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
          {[{ label:`📊 ${t('home.stats')}`, action:goStats }, { label:`📖 ${t('home.review')}`, action:goReview }].map(({ label, action }) => (
            <button key={label} onClick={action} style={{ border:'1px solid var(--rule)', background:'rgba(255,253,243,0.55)', padding:'10px 8px', cursor:'pointer', fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.18em', color:'var(--ink-soft)', textTransform:'uppercase', transition:'all .15s' }}>
              {label}
            </button>
          ))}
        </div>

        <WorldMap />

        <div style={{ margin:'22px 0 0' }}>
          {difficultySection}
        </div>

        {modesSection}
        {zarparBtn}

        <div style={{ marginTop:26, textAlign:'center', fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.32em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
          {t('home.footer')}
        </div>
      </div>
    </div>
  )
}
