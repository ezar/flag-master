import { FM_REGIONS } from '../data/countries'
import { FM_COUNTRIES } from '../data/countries'
import { useGameStore, regionMastery, isRegionUnlocked, isMastered } from '../store/gameStore'

interface RegionShape {
  id:    string
  label: string
  sub:   string
  // SVG path or shape data in 600×320 viewBox
  path:  string
  cx:    number  // label center x
  cy:    number  // label center y
}

const SHAPES: RegionShape[] = [
  {
    id:    'europe',
    label: 'Europa',
    sub:   'EU',
    path:  'M 270,40 Q 260,30 285,25 Q 315,20 330,35 Q 345,50 335,70 Q 320,85 300,80 Q 275,75 265,60 Z',
    cx: 300, cy: 52,
  },
  {
    id:    'americas',
    label: 'Américas',
    sub:   'AM',
    path:  'M 95,65 Q 80,55 90,40 Q 105,25 125,30 Q 145,35 150,55 Q 155,75 145,100 Q 135,130 120,145 Q 100,155 85,140 Q 70,120 80,95 Z',
    cx: 115, cy: 95,
  },
  {
    id:    'asia',
    label: 'Asia',
    sub:   'AS',
    path:  'M 370,35 Q 355,20 390,18 Q 440,15 470,30 Q 500,48 495,75 Q 488,105 460,115 Q 425,122 395,105 Q 365,88 362,62 Z',
    cx: 430, cy: 68,
  },
  {
    id:    'africa',
    label: 'África',
    sub:   'AF',
    path:  'M 290,110 Q 275,100 280,120 Q 285,145 300,170 Q 315,195 330,185 Q 345,165 340,140 Q 335,115 315,105 Z',
    cx: 308, cy: 148,
  },
  {
    id:    'oceania',
    label: 'Oceanía',
    sub:   'OC',
    path:  'M 460,185 Q 445,178 448,195 Q 452,215 470,220 Q 490,222 498,208 Q 504,192 492,183 Z',
    cx: 472, cy: 200,
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

      {/* SVG Map */}
      <svg
        viewBox="0 0 600 260"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-hidden="true"
      >
        {/* Decorative ocean grid lines */}
        <g stroke="var(--ink)" strokeWidth="0.4" opacity="0.06" fill="none">
          <line x1="0" y1="80"  x2="600" y2="80" />
          <line x1="0" y1="140" x2="600" y2="140" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="150" y1="0" x2="150" y2="260" />
          <line x1="300" y1="0" x2="300" y2="260" />
          <line x1="450" y1="0" x2="450" y2="260" />
        </g>

        {SHAPES.map(shape => {
          const unlocked = isRegionUnlocked(shape.id, masteryCountries)
          const mastery  = regionMastery(shape.id, masteryCountries)
          const region   = FM_REGIONS.find(r => r.id === shape.id)
          const total    = FM_COUNTRIES.filter(c => c.r === shape.id).length
          const mastered = FM_COUNTRIES.filter(c =>
            c.r === shape.id && isMastered(masteryCountries[c.n] ?? { seen: 0, hits: 0 })
          ).length

          // Color scheme
          let fill        = 'var(--paper-3)'
          let stroke      = 'var(--ink)'
          let strokeWidth = 1
          let opacity     = 1
          let dashArray   = 'none'

          if (!unlocked) {
            opacity   = 0.5
            dashArray = '3,3'
            fill      = 'var(--paper-3)'
          } else if (mastery >= 1) {
            fill        = 'var(--gold)'
            strokeWidth = 1.6
          } else if (mastery > 0) {
            fill = 'var(--gold-light)'
          } else {
            fill = 'var(--paper-2)'
          }

          const labelColor = mastery >= 1 ? 'var(--paper)' : 'var(--ink)'

          return (
            <g key={shape.id} opacity={opacity}>
              <path
                d={shape.path}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray !== 'none' ? dashArray : undefined}
                style={{ transition: 'fill 0.4s ease' }}
              />
              {/* Region label */}
              <text
                x={shape.cx}
                y={shape.cy - 6}
                textAnchor="middle"
                fontFamily="'Playfair Display', serif"
                fontStyle="italic"
                fontWeight="700"
                fontSize="10"
                fill={labelColor}
              >
                {shape.label}
              </text>
              {/* Mastery / status sub-label */}
              <text
                x={shape.cx}
                y={shape.cy + 7}
                textAnchor="middle"
                fontFamily="'DM Mono', monospace"
                fontSize="7"
                letterSpacing="0.1em"
                fill={mastery >= 1 ? 'var(--paper)' : 'var(--ink-soft)'}
              >
                {!unlocked
                  ? (region?.lock ? `▸ ${FM_REGIONS.find(r => r.id === region.lock!.region)?.name ?? ''} ${Math.round(region.lock.mastery * 100)}%` : 'BLOQ')
                  : mastered === 0
                    ? `${total} países`
                    : `${mastered}/${total}`
                }
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{
        display:       'flex',
        gap:           16,
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
          { bg: 'var(--paper-2)', label: 'Disponible', dashed: false },
          { bg: 'var(--gold-light)', label: 'En progreso', dashed: false },
          { bg: 'var(--gold)', label: 'Dominado', dashed: false },
          { bg: 'var(--paper-3)', label: 'Bloqueado', dashed: true },
        ].map(({ bg, label, dashed }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width:  12,
              height: 12,
              background:  bg,
              border:      dashed ? '1px dashed var(--ink)' : '1px solid var(--ink)',
              opacity:     dashed ? 0.5 : 1,
              flexShrink:  0,
            }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
