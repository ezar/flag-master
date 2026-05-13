import { FM_REGIONS, FM_COUNTRIES } from '../data/countries'
import { useGameStore, regionMastery, isRegionUnlocked, isMastered } from '../store/gameStore'

// Approximate continent polygon paths in a 1000×650 coordinate space
// Matching a standard Mercator projection world map
const REGIONS = [
  {
    id:   'americas',
    name: 'Américas',
    // North + South America combined
    points: '55,30 280,32 305,90 290,140 315,175 330,205 335,265 322,335 305,405 288,470 262,530 228,565 198,558 180,505 190,438 183,378 158,308 128,258 98,228 74,193 58,158 45,118 50,68',
    lx: 165, ly: 290,
  },
  {
    id:   'europe',
    name: 'Europa',
    points: '448,62 565,62 575,102 568,152 548,202 508,218 472,208 452,188 446,148 444,102',
    lx: 508, ly: 138,
  },
  {
    id:   'africa',
    name: 'África',
    points: '448,238 610,238 620,312 616,392 598,468 568,538 534,558 498,552 468,520 450,452 438,370 438,292',
    lx: 528, ly: 398,
  },
  {
    id:   'asia',
    name: 'Asia',
    points: '548,50 1000,50 1000,412 838,422 778,392 712,362 668,318 628,292 588,288 558,262 546,212 543,152 548,96',
    lx: 778, ly: 200,
  },
  {
    id:   'oceania',
    name: 'Oceanía',
    points: '718,358 972,358 978,432 958,502 920,550 865,562 815,538 772,482 735,422 718,388',
    lx: 848, ly: 458,
  },
]

export function WorldMap() {
  const { masteryCountries } = useGameStore()

  return (
    <div style={{
      border:     '1px solid var(--rule)',
      background: 'rgba(255,253,243,0.55)',
      padding:    '14px 14px 10px',
      marginTop:  4,
      boxShadow:  'var(--shadow)',
    }}>

      {/* Header */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           8,
        fontFamily:    "'DM Mono', monospace",
        fontSize:      10,
        letterSpacing: '0.28em',
        color:         'var(--ink-soft)',
        textTransform: 'uppercase',
        marginBottom:  10,
      }}>
        <span style={{ color: 'var(--gold)' }}>✦</span>
        Atlas del explorador
      </div>

      {/* Map container — image + SVG overlay */}
      <div style={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        {/* Base map image */}
        <img
          src={`${import.meta.env.BASE_URL}world-map.png`}
          alt="Mapa del mundo"
          style={{ width: '100%', display: 'block' }}
        />

        {/* SVG overlay — same aspect ratio as image (1340×870 ≈ 1000×650) */}
        <svg
          viewBox="0 0 1000 650"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
          }}
        >
          {REGIONS.map(region => {
            const unlocked = isRegionUnlocked(region.id, masteryCountries)
            const mastery  = regionMastery(region.id, masteryCountries)
            const total    = FM_COUNTRIES.filter(c => c.r === region.id).length
            const mastered = FM_COUNTRIES.filter(c =>
              c.r === region.id && isMastered(masteryCountries[c.n] ?? { seen: 0, hits: 0 })
            ).length

            // Overlay color per state
            // locked:      dark cover hides the map
            // available:   no overlay — map shows clearly
            // in progress: slight gold tint
            // mastered:    strong gold tint + glow
            let fill    = 'rgba(26,18,9,0)'
            let stroke  = 'rgba(26,18,9,0.3)'
            let strokeW = 0.8

            if (!unlocked) {
              fill    = 'rgba(26,18,9,0.58)'
              stroke  = 'rgba(26,18,9,0.4)'
              strokeW = 0.6
            } else if (mastery >= 0.99) {
              fill    = 'rgba(184,135,42,0.45)'
              stroke  = 'rgba(148,106,29,0.9)'
              strokeW = 1.6
            } else if (mastery > 0) {
              fill    = 'rgba(217,179,102,0.22)'
              stroke  = 'rgba(184,135,42,0.7)'
              strokeW = 1.2
            } else {
              // available, no progress — subtle border only
              fill    = 'rgba(184,135,42,0.04)'
              stroke  = 'rgba(184,135,42,0.5)'
              strokeW = 1
            }

            const subLabel = !unlocked
              ? (() => {
                  const reg = FM_REGIONS.find(r => r.id === region.id)
                  return reg?.lock ? `▸ ${Math.round(reg.lock.mastery * 100)}%` : 'BLOQ.'
                })()
              : mastered === 0
                ? `${total} países`
                : `${mastered}/${total}`

            const labelColor = !unlocked ? 'rgba(245,237,214,0.7)' :
                               mastery >= 0.99 ? '#1a1209' : '#1a1209'
            const subColor   = !unlocked ? 'rgba(245,237,214,0.5)' :
                               mastery >= 0.99 ? 'rgba(148,106,29,0.9)' : 'rgba(92,69,40,0.85)'

            // Hatching pattern for locked regions
            const patternId = `hatch-${region.id}`

            return (
              <g key={region.id}>
                {!unlocked && (
                  <defs>
                    <pattern id={patternId} width="8" height="8"
                      patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="8"
                        stroke="rgba(26,18,9,0.25)" strokeWidth="1.2"/>
                    </pattern>
                  </defs>
                )}

                {/* Main fill overlay */}
                <polygon
                  points={region.points}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  strokeLinejoin="round"
                />

                {/* Hatch texture on locked */}
                {!unlocked && (
                  <polygon
                    points={region.points}
                    fill={`url(#${patternId})`}
                    stroke="none"
                  />
                )}

                {/* Region name */}
                <text
                  x={region.lx} y={region.ly}
                  textAnchor="middle"
                  fontFamily="'Playfair Display', serif"
                  fontStyle="italic"
                  fontWeight="700"
                  fontSize="22"
                  fill={labelColor}
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                >
                  {region.name}
                </text>

                {/* Sub-label: country count or unlock requirement */}
                <text
                  x={region.lx} y={region.ly + 18}
                  textAnchor="middle"
                  fontFamily="'DM Mono', monospace"
                  fontSize="13"
                  letterSpacing="0.1em"
                  fill={subColor}
                >
                  {subLabel}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display:       'flex',
        gap:           14,
        flexWrap:      'wrap',
        marginTop:     8,
        paddingTop:    8,
        borderTop:     '1px dashed var(--rule)',
        fontFamily:    "'DM Mono', monospace",
        fontSize:      9,
        letterSpacing: '0.16em',
        color:         'var(--ink-soft)',
        textTransform: 'uppercase',
      }}>
        {[
          { bg: 'transparent',      border: '1px solid rgba(184,135,42,0.5)',  label: 'Disponible'  },
          { bg: 'rgba(217,179,102,0.3)', border: '1px solid var(--gold)',       label: 'En progreso' },
          { bg: 'rgba(184,135,42,0.5)', border: '1px solid var(--gold-2)',      label: 'Dominado'    },
          { bg: 'rgba(26,18,9,0.55)',   border: '1px solid rgba(26,18,9,0.3)', label: 'Bloqueado'   },
        ].map(({ bg, border, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 11, height: 11, background: bg, border, flexShrink: 0 }}/>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
