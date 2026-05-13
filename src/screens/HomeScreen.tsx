import { useState } from 'react'
import { CompassRose }    from '../components/CompassRose'
import { StatCard }       from '../components/StatCard'
import { WorldMap }       from '../components/WorldMap'
import { SettingsModal }  from '../components/SettingsModal'
import { useGameStore, type GameMode } from '../store/gameStore'
import { getPool }        from '../engine/questionEngine'
import { FM_COUNTRIES }   from '../data/countries'
import type { Stage }     from '../engine/questionEngine'

// ── Difficulty options ──────────────────────────────────────────────
const DIFFICULTIES: { id: Stage; icon: string; name: string; sub: string }[] = [
  { id: 'easy',   icon: '🌿', name: 'Fácil',   sub: 'Iniciado'    },
  { id: 'medium', icon: '⚓', name: 'Medio',   sub: 'Navegante'   },
  { id: 'hard',   icon: '🗺️', name: 'Experto',  sub: 'Cartógrafo' },
]

// ── Game modes ──────────────────────────────────────────────────────
const MODES: { id: GameMode; roman: string; title: string; desc: string }[] = [
  { id: 'flag2country', roman: 'I',   title: '🏳️ ¿Qué país?',    desc: 'Ves la bandera, eliges el nombre'  },
  { id: 'country2flag', roman: 'II',  title: '🔍 ¿Qué bandera?', desc: 'Ves el nombre, eliges la bandera'  },
  { id: 'hint',         roman: 'III', title: '🔤 Pistas',         desc: 'Letras ocultas — descifra el nombre' },
  { id: 'capital',      roman: 'IV',  title: '🏛️ Capitales',      desc: 'Identifica la capital correcta'   },
  { id: 'type',         roman: 'V',   title: '✍️ Escríbelo',       desc: 'Sin opciones — solo tu memoria'   },
  { id: 'lightning',    roman: 'VI',  title: '⚡ Relámpago',       desc: '10 segundos por bandera'          },
]

export function HomeScreen() {
  const {
    stage, mode,
    setStage, setMode, startGame,
    bestStreak, totalGames, totalCorrect, totalQuestions,
  } = useGameStore()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const poolCount = getPool(stage, FM_COUNTRIES).length

  return (
    <div style={{ position: 'relative', padding: '22px 22px 28px' }}>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Settings button — top right */}
      <button
        onClick={() => setSettingsOpen(true)}
        style={{
          position:      'absolute',
          top:           16,
          right:         16,
          zIndex:        10,
          background:    'none',
          border:        '1px solid var(--rule)',
          width:         34,
          height:        34,
          cursor:        'pointer',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          color:         'var(--ink-soft)',
          fontSize:      16,
          borderRadius:  2,
          transition:    'all .15s',
        }}
        title="Ajustes"
        aria-label="Abrir ajustes"
      >
        ⚙
      </button>

      {/* ── Nautical chart lines (decorative bg) ── */}
      <div
        aria-hidden="true"
        style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, opacity:0.9 }}
      >
        <svg
          viewBox="0 0 430 900"
          preserveAspectRatio="xMidYMid slice"
          style={{ width:'100%', height:'100%', display:'block' }}
        >
          <g fill="none" stroke="var(--ink)" strokeWidth="0.6" opacity="0.07">
            <circle cx="215" cy="180" r="240"/>
            <circle cx="215" cy="180" r="180" opacity="0.5"/>
            <circle cx="215" cy="180" r="120"/>
            <circle cx="215" cy="180" r="60"  opacity="0.5"/>
            <path d="M -50 180 Q 215 80 480 180"/>
            <path d="M -50 220 Q 215 320 480 220"/>
            <path d="M -50 140 Q 215 -20 480 140"/>
            <path d="M 0 700 Q 215 600 430 700"/>
            <path d="M 0 760 Q 215 820 430 760"/>
            <line x1="215" y1="-20" x2="215" y2="900"/>
            <line x1="-20" y1="180" x2="450" y2="180"/>
            <line x1="-20" y1="450" x2="450" y2="450"/>
            <line x1="40"  y1="-20" x2="380" y2="900"/>
            <line x1="380" y1="-20" x2="40"  y2="900"/>
          </g>
        </svg>
      </div>

      {/* ── Content (above the decorative bg) ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Compass */}
        <CompassRose />

        {/* Brand */}
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10.5,
            letterSpacing: '0.36em',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
          }}>
            Compendium · MMXXVI
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 46,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            margin: '6px 0 4px',
            color: 'var(--ink)',
          }}>
            Flag
            <span style={{ color: 'var(--gold)', fontStyle: 'italic', fontWeight: 400 }}>·</span>
            Master
          </h1>
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontStyle: 'italic',
            color: 'var(--ink-soft)',
            fontSize: 13.5,
            marginTop: 2,
          }}>
            Un atlas ilustrado para jóvenes exploradores
          </div>
        </div>

        {/* Double rule with gold diamond */}
        <div style={{ height: 7, position: 'relative', margin: '16px 6px' }}>
          <div style={{ position:'absolute', left:0, right:0, top:0,    height:1, background:'var(--ink)', opacity:.55 }} />
          <div style={{ position:'absolute', left:0, right:0, bottom:0, height:1, background:'var(--ink)', opacity:.25 }} />
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            width: 7, height: 7,
            background: 'var(--gold)',
          }} />
        </div>

        {/* Stats */}
        <StatCard
          bestStreak={bestStreak}
          totalGames={totalGames}
          totalCorrect={totalCorrect}
          totalQuestions={totalQuestions}
        />

        {/* World map — continent progression */}
        <WorldMap />

        {/* Difficulty header */}
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'22px 2px 10px' }}>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18 }}>
            Dificultad
          </h2>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
            {poolCount} países
          </span>
        </div>

        {/* Difficulty buttons */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => setStage(d.id)}
              style={{
                background:  stage === d.id ? 'var(--ink)' : 'transparent',
                border:      '1px solid var(--rule)',
                padding:     '12px 8px 10px',
                cursor:      'pointer',
                textAlign:   'center',
                color:       stage === d.id ? 'var(--paper)' : 'var(--ink)',
                transition:  'all .18s ease',
                boxShadow:   stage === d.id ? '0 6px 18px -10px rgba(26,18,9,0.6)' : 'none',
              }}
            >
              <div style={{ fontSize:20, lineHeight:1 }}>{d.icon}</div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14, marginTop:6 }}>{d.name}</div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color: stage === d.id ? 'rgba(245,237,214,0.7)' : 'var(--ink-soft)', marginTop:3 }}>{d.sub}</div>
            </button>
          ))}
        </div>

        {/* Mode header */}
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'22px 2px 10px' }}>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18 }}>
            Modos de juego
          </h2>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
            Elige uno
          </span>
        </div>

        {/* Mode buttons */}
        <div style={{ display:'grid', gap:9 }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        14,
                padding:    '14px 14px',
                border:     mode === m.id ? '1px solid var(--gold)' : '1px solid var(--rule)',
                background: mode === m.id ? 'rgba(255,253,243,0.85)' : 'rgba(255,253,243,0.55)',
                cursor:     'pointer',
                textAlign:  'left',
                color:      'var(--ink)',
                transition: 'all .18s ease',
              }}
            >
              <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:24, color:'var(--gold)', width:28, textAlign:'center', lineHeight:1 }}>
                {m.roman}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:16 }}>{m.title}</div>
                <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2, fontStyle:'italic' }}>{m.desc}</div>
              </div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:22, color: mode === m.id ? 'var(--gold)' : 'var(--ink-soft)' }}>
                →
              </div>
            </button>
          ))}
        </div>

        {/* CTA — Zarpar */}
        <button
          onClick={startGame}
          style={{
            display:     'block',
            width:       '100%',
            marginTop:   22,
            background:  'var(--ink)',
            color:       'var(--gold)',
            border:      'none',
            padding:     '16px 8px',
            fontFamily:  "'DM Mono', monospace",
            fontSize:    11,
            letterSpacing:'0.32em',
            textTransform:'uppercase',
            cursor:      'pointer',
            boxShadow:   '0 6px 18px -10px rgba(26,18,9,0.6)',
          }}
        >
          Zarpar →
        </button>

        {/* Footer */}
        <div style={{ marginTop:26, textAlign:'center', fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.32em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
          ✦{' '}
          <span style={{ color:'var(--gold)' }}>Septentrionem</span> ·{' '}
          <span style={{ color:'var(--gold)' }}>Meridiem</span> ·{' '}
          <span style={{ color:'var(--gold)' }}>Orientem</span> ·{' '}
          <span style={{ color:'var(--gold)' }}>Occidentem</span>
          {' '}✦
        </div>

      </div>
    </div>
  )
}
