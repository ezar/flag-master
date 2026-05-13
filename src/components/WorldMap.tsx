import { FM_REGIONS, FM_COUNTRIES } from '../data/countries'
import { useGameStore, regionMastery, isRegionUnlocked, isMastered } from '../store/gameStore'

interface Continent {
  id:   string
  name: string
  // SVG path in 560×290 viewBox
  path: string
  // Label position
  lx:   number
  ly:   number
}

// Hand-crafted continent silhouettes — simplified but geographically evocative
const CONTINENTS: Continent[] = [
  {
    id:   'americas',
    name: 'Américas',
    path: `M 88,30 Q 78,38 72,52 Q 65,68 70,80 Q 75,90 85,88
           Q 92,95 88,108 Q 82,122 78,138 Q 72,158 76,178
           Q 82,200 96,212 Q 112,222 122,210 Q 132,195 128,178
           Q 124,160 118,148 Q 112,136 116,122 Q 122,106 132,96
           Q 142,84 138,70 Q 132,52 120,42 Q 106,28 88,30 Z`,
    lx: 102, ly: 120,
  },
  {
    id:   'europe',
    name: 'Europa',
    path: `M 272,32 Q 260,28 252,38 Q 244,50 248,62
           Q 252,72 262,76 Q 268,82 265,90 Q 260,96 265,100
           Q 272,104 282,98 Q 294,90 302,80 Q 312,68 310,56
           Q 308,42 296,34 Q 284,28 272,32 Z`,
    lx: 278, ly: 66,
  },
  {
    id:   'africa',
    name: 'África',
    path: `M 272,112 Q 260,108 252,118 Q 244,130 246,148
           Q 248,168 254,188 Q 262,208 272,218 Q 282,224 292,216
           Q 304,204 308,184 Q 312,162 308,142
           Q 304,122 292,114 Q 280,108 272,112 Z`,
    lx: 278, ly: 166,
  },
  {
    id:   'asia',
    name: 'Asia',
    path: `M 332,28 Q 318,22 308,32 Q 296,44 300,58
           Q 296,66 286,72 Q 278,80 282,92 Q 288,102 302,104
           Q 316,106 330,98 Q 346,88 358,76 Q 374,62 380,48
           Q 386,34 376,26 Q 362,18 348,22 Q 340,24 332,28 Z
           M 366,72 Q 378,78 392,82 Q 408,86 422,80
           Q 438,72 444,58 Q 448,44 440,36 Q 428,28 414,32
           Q 398,36 388,48 Q 376,60 366,72 Z`,
    lx: 390, ly: 62,
  },
  {
    id:   'oceania',
    name: 'Oceanía',
    path: `M 430,188 Q 418,184 412,194 Q 406,206 412,218
           Q 418,228 432,228 Q 448,226 456,214
           Q 462,202 456,192 Q 446,182 430,188 Z
           M 464,196 Q 472,198 478,208 Q 482,218 476,224
           Q 468,228 460,222 Q 456,212 460,202 Q 462,196 464,196 Z`,
    lx: 438, ly: 208,
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

      {/* Map SVG */}
      <svg
        viewBox="0 0 560 256"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          {/* Hand-drawn / antique edge filter */}
          <filter id="roughen" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="5" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"
              xChannelSelector="R" yChannelSelector="G"/>
          </filter>

          {/* Sea texture */}
          <filter id="seatex" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" result="t"/>
            <feColorMatrix type="saturate" values="0" result="gray"/>
            <feComposite in="gray" in2="SourceGraphic" operator="in"/>
          </filter>

          {/* Cross-hatch pattern — locked regions */}
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(42)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink-soft)" strokeWidth="0.7" opacity="0.35"/>
          </pattern>

          {/* Stipple dots — available (unlocked, no progress) */}
          <pattern id="stipple" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.7" fill="var(--ink-soft)" opacity="0.28"/>
          </pattern>

          {/* Progress fill gradient */}
          <linearGradient id="prog-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold-light)" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.6"/>
          </linearGradient>

          {/* Mastered fill */}
          <linearGradient id="done-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold-light)"/>
            <stop offset="100%" stopColor="var(--gold-2)"/>
          </linearGradient>
        </defs>

        {/* Outer map frame — double border */}
        <rect x="3" y="3" width="554" height="250" fill="none"
          stroke="var(--ink)" strokeWidth="1.2" opacity="0.4"/>
        <rect x="7" y="7" width="546" height="242" fill="none"
          stroke="var(--ink)" strokeWidth="0.5" opacity="0.22"/>

        {/* Parchment sea background with subtle grain */}
        <rect x="8" y="8" width="544" height="240"
          fill="var(--paper-2)" opacity="0.5"/>

        {/* Latitude lines — faint grid */}
        {[50, 100, 150, 200].map(y => (
          <line key={y} x1="8" y1={y} x2="552" y2={y}
            stroke="var(--ink)" strokeWidth="0.4" opacity="0.1"
            strokeDasharray="2,6"/>
        ))}
        {[100, 200, 300, 400, 500].map(x => (
          <line key={x} x1={x} y1="8" x2={x} y2="248"
            stroke="var(--ink)" strokeWidth="0.4" opacity="0.1"
            strokeDasharray="2,6"/>
        ))}

        {/* Continents */}
        {CONTINENTS.map(cont => {
          const unlocked = isRegionUnlocked(cont.id, masteryCountries)
          const mastery  = regionMastery(cont.id, masteryCountries)

          // Fill logic
          let mainFill   = 'var(--paper-3)'
          let overlay    = ''
          let strokeCol  = 'var(--ink-soft)'
          let strokeW    = 1
          let opacity    = 1

          if (!unlocked) {
            mainFill  = 'var(--paper-3)'
            overlay   = 'url(#hatch)'
            opacity   = 0.6
          } else if (mastery >= 0.99) {
            mainFill  = 'url(#done-grad)'
            strokeCol = 'var(--gold-2)'
            strokeW   = 1.5
          } else if (mastery > 0) {
            mainFill  = 'url(#prog-grad)'
            overlay   = 'url(#stipple)'
            strokeCol = 'var(--gold)'
          } else {
            mainFill  = 'var(--paper-2)'
            overlay   = 'url(#stipple)'
            strokeCol = 'var(--ink)'
          }

          return (
            <g key={cont.id} opacity={opacity} filter="url(#roughen)">
              {/* Base fill */}
              <path d={cont.path} fill={mainFill}
                stroke={strokeCol} strokeWidth={strokeW} strokeLinejoin="round"/>
              {/* Texture overlay */}
              {overlay && (
                <path d={cont.path} fill={overlay} stroke="none"/>
              )}
              {/* Subtle inner shadow line */}
              <path d={cont.path} fill="none"
                stroke={mastery >= 0.99 ? 'var(--gold)' : 'var(--ink)'}
                strokeWidth="0.5" opacity="0.18"
                strokeLinejoin="round"/>
            </g>
          )
        })}

        {/* Labels rendered WITHOUT the roughen filter (stay crisp) */}
        {CONTINENTS.map(cont => {
          const unlocked = isRegionUnlocked(cont.id, masteryCountries)
          const mastery  = regionMastery(cont.id, masteryCountries)
          const region   = FM_REGIONS.find(r => r.id === cont.id)
          const total    = FM_COUNTRIES.filter(c => c.r === cont.id).length
          const mastered = FM_COUNTRIES.filter(c =>
            c.r === cont.id && isMastered(masteryCountries[c.n] ?? { seen: 0, hits: 0 })
          ).length

          const subText = !unlocked
            ? (region?.lock
                ? `▸ ${Math.round(region.lock.mastery * 100)}%`
                : 'BLOQ.')
            : mastered === 0
              ? `${total} países`
              : `${mastered}/${total}`

          const labelInk = mastery >= 0.99 ? 'var(--gold-2)' : 'var(--ink)'
          const subInk   = 'var(--ink-soft)'

          return (
            <g key={`lbl-${cont.id}`}>
              <text
                x={cont.lx} y={cont.ly - 5}
                textAnchor="middle"
                fontFamily="'Playfair Display', serif"
                fontStyle="italic"
                fontWeight="700"
                fontSize={cont.id === 'oceania' ? 7.5 : 9}
                fill={labelInk}
                style={{ pointerEvents: 'none' }}
              >
                {cont.name}
              </text>
              <text
                x={cont.lx} y={cont.ly + 6}
                textAnchor="middle"
                fontFamily="'DM Mono', monospace"
                fontSize={cont.id === 'oceania' ? 5.5 : 6.5}
                letterSpacing="0.08em"
                fill={subInk}
                opacity="0.85"
                style={{ pointerEvents: 'none' }}
              >
                {subText}
              </text>
            </g>
          )
        })}

        {/* Compass rose — bottom-left corner */}
        <g transform="translate(28,230)" opacity="0.45">
          <line x1="0" y1="-12" x2="0" y2="12" stroke="var(--ink)" strokeWidth="0.8"/>
          <line x1="-12" y1="0" x2="12" y2="0" stroke="var(--ink)" strokeWidth="0.8"/>
          <polygon points="0,-12 2,-4 0,-2 -2,-4" fill="var(--ink)"/>
          <text x="0" y="-15" textAnchor="middle"
            fontFamily="'Playfair Display', serif" fontStyle="italic"
            fontSize="6" fill="var(--ink)">N</text>
        </g>

        {/* Scale decoration — bottom-right */}
        <g transform="translate(490,240)" opacity="0.35">
          <rect x="-30" y="-3" width="15" height="4" fill="var(--ink)"/>
          <rect x="-15" y="-3" width="15" height="4" fill="var(--paper)"/>
          <rect x="0"   y="-3" width="15" height="4" fill="var(--ink)"/>
          <line x1="-30" y1="-5" x2="15" y2="-5" stroke="var(--ink)" strokeWidth="0.6"/>
        </g>

        {/* Corner ornaments */}
        {[[10,10],[550,10],[10,246],[550,246]].map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <circle r="2.5" fill="var(--gold)" opacity="0.5"/>
          </g>
        ))}
      </svg>

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
          { bg: 'var(--paper-2)',    label: 'Disponible',  dashed: false },
          { bg: 'var(--gold-light)', label: 'En progreso', dashed: false },
          { bg: 'var(--gold)',       label: 'Dominado',    dashed: false },
          { bg: 'var(--paper-3)',    label: 'Bloqueado',   dashed: true  },
        ].map(({ bg, label, dashed }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width:       11,
              height:      11,
              background:  bg,
              border:      dashed ? '1px dashed var(--ink-soft)' : '1px solid var(--ink-soft)',
              opacity:     dashed ? 0.55 : 1,
              flexShrink:  0,
            }}/>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
