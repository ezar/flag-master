import { FM_REGIONS, FM_COUNTRIES } from '../data/countries'
import { useGameStore, regionMastery, isRegionUnlocked, isMastered } from '../store/gameStore'


export function WorldMap() {
  const { masteryCountries } = useGameStore()

  return (
    <div style={{
      border:     '1px solid var(--rule)',
      background: 'rgba(255,253,243,0.55)',
      marginTop:  4,
      boxShadow:  'var(--shadow)',
      overflow:   'hidden',
    }}>

      {/* World map image — decorative band */}
      <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
        <img
          src={`${import.meta.env.BASE_URL}world-map.png`}
          alt=""
          aria-hidden="true"
          style={{
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            objectPosition: 'center 30%',
            display:    'block',
            opacity:    0.88,
          }}
        />
        {/* Top fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, var(--paper-2) 0%, transparent 28%, transparent 72%, var(--paper-2) 100%)',
          pointerEvents: 'none',
        }}/>
        {/* Title overlay */}
        <div style={{
          position:      'absolute',
          inset:         0,
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          flexDirection: 'column',
          gap:           2,
        }}>
          <div style={{
            fontFamily:    "'DM Mono', monospace",
            fontSize:      9,
            letterSpacing: '0.32em',
            color:         'var(--ink-soft)',
            textTransform: 'uppercase',
          }}>
            ✦ Atlas del explorador ✦
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle:  'italic',
            fontWeight: 700,
            fontSize:   18,
            color:      'var(--ink)',
            textShadow: '0 1px 3px rgba(245,237,214,0.8)',
          }}>
            Conquista el mundo
          </div>
        </div>
      </div>

      {/* Continent grid */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {FM_REGIONS.map(region => {
            const unlocked = isRegionUnlocked(region.id, masteryCountries)
            const mastery  = regionMastery(region.id, masteryCountries)
            const total    = FM_COUNTRIES.filter(c => c.r === region.id).length
            const mastered = FM_COUNTRIES.filter(c =>
              c.r === region.id && isMastered(masteryCountries[c.n] ?? { seen: 0, hits: 0 })
            ).length

            const pct       = Math.round(mastery * 100)
            const prereqReg = region.lock ? FM_REGIONS.find(r => r.id === region.lock!.region) : null

            // Visual state
            let bg          = 'rgba(255,253,243,0.75)'
            let borderColor = 'var(--rule)'
            let statusLabel = `${total} países`
            let statusColor = 'var(--ink-soft)'
            let dim         = false

            if (!unlocked) {
              bg          = 'rgba(26,18,9,0.04)'
              borderColor = 'rgba(26,18,9,0.12)'
              statusLabel = prereqReg
                ? `🔒 ${prereqReg.name} ${Math.round(region.lock!.mastery * 100)}%`
                : '🔒 Bloqueado'
              statusColor = 'var(--ink-soft)'
              dim         = true
            } else if (mastery >= 0.99) {
              bg          = 'rgba(184,135,42,0.14)'
              borderColor = 'var(--gold)'
              statusLabel = `✦ Dominado`
              statusColor = 'var(--gold-2)'
            } else if (mastery > 0) {
              bg          = 'rgba(217,179,102,0.12)'
              borderColor = 'var(--gold-light)'
              statusLabel = `${mastered}/${total} dominados`
              statusColor = 'var(--gold-2)'
            }

            return (
              <div
                key={region.id}
                style={{
                  background:    bg,
                  border:        `1px solid ${borderColor}`,
                  padding:       '10px 12px',
                  opacity:       dim ? 0.65 : 1,
                  transition:    'opacity 0.3s',
                }}
              >
                {/* Region name */}
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontStyle:  'italic',
                  fontSize:   15,
                  color:      'var(--ink)',
                  marginBottom: 4,
                }}>
                  {region.name}
                </div>

                {/* Status */}
                <div style={{
                  fontFamily:    "'DM Mono', monospace",
                  fontSize:      9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color:         statusColor,
                  marginBottom:  unlocked && mastery > 0 ? 6 : 0,
                }}>
                  {statusLabel}
                </div>

                {/* Progress bar — only when unlocked and has progress */}
                {unlocked && mastery > 0 && mastery < 0.99 && (
                  <div style={{
                    height:     3,
                    background: 'var(--rule)',
                    borderRadius: 2,
                    overflow:   'hidden',
                  }}>
                    <div style={{
                      height:     '100%',
                      width:      `${pct}%`,
                      background: 'linear-gradient(to right, var(--gold-2), var(--gold))',
                      transition: 'width 0.5s ease',
                    }}/>
                  </div>
                )}

                {/* Mastered badge */}
                {mastery >= 0.99 && (
                  <div style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           4,
                    marginTop:     2,
                    fontFamily:    "'DM Mono', monospace",
                    fontSize:      8,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'var(--gold-2)',
                  }}>
                    <div style={{
                      width: 6, height: 6,
                      background: 'var(--gold)',
                      transform: 'rotate(45deg)',
                    }}/>
                    Expedición completa
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
