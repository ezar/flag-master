import { motion } from 'framer-motion'

export function CompassRose() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '6px auto 0',
        width: 170,
        height: 170,
      }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 6px 14px rgba(26,18,9,0.18))',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {/* Rings */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="var(--ink)" strokeWidth="1" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.35" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="var(--ink)" strokeWidth="1" />

        {/* 32 graduation ticks */}
        {Array.from({ length: 32 }, (_, i) => {
          const a  = (i * 360 / 32) * (Math.PI / 180)
          const r1 = 92
          const r2 = i % 8 === 0 ? 78 : 84
          return (
            <line
              key={i}
              x1={100 + Math.sin(a) * r1}
              y1={100 - Math.cos(a) * r1}
              x2={100 + Math.sin(a) * r2}
              y2={100 - Math.cos(a) * r2}
              stroke="var(--ink)"
              strokeWidth="0.8"
              opacity={i % 8 === 0 ? 1 : 0.55}
            />
          )
        })}

        {/* N/S/E/W ink points */}
        <polygon points="100,12 105,95 100,100 95,95"   fill="var(--ink)" />
        <polygon points="100,188 105,105 100,100 95,105" fill="var(--ink)" />
        <polygon points="12,100 95,95 100,100 95,105"   fill="var(--ink)" />
        <polygon points="188,100 105,95 100,100 105,105" fill="var(--ink)" />

        {/* Diagonal gold points (NE/SE/SW/NW) */}
        <polygon points="100,30 130,100 100,100"  fill="var(--gold)" />
        <polygon points="100,30 70,100 100,100"   fill="var(--gold)" />
        <polygon points="100,170 130,100 100,100" fill="var(--gold)" />
        <polygon points="100,170 70,100 100,100"  fill="var(--gold)" />
        <polygon points="30,100 100,70 100,100"   fill="var(--gold)" />
        <polygon points="30,100 100,130 100,100"  fill="var(--gold)" />
        <polygon points="170,100 100,70 100,100"  fill="var(--gold)" />
        <polygon points="170,100 100,130 100,100" fill="var(--gold)" />

        {/* Cardinal letters */}
        <text x="100" y="9"   textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">N</text>
        <text x="194" y="103" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">E</text>
        <text x="100" y="198" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">S</text>
        <text x="6"   y="103" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">O</text>
      </motion.svg>

      {/* Gold center dot */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'var(--gold)',
          boxShadow: '0 0 0 3px var(--paper), 0 0 0 4px var(--ink)',
        }}
      />
    </div>
  )
}
