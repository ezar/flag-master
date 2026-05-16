import { useEffect, useState } from 'react'

const COLORS = ['var(--gold)', 'var(--gold-light)', 'var(--ok)', '#e74c3c', '#3498db', '#9b59b6']

interface Particle {
  id:       number
  color:    string
  left:     string
  delay:    string
  duration: string
  size:     string
  rotate:   string
}

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) return
    setParticles(
      Array.from({ length: 48 }, (_, i) => ({
        id:       i,
        color:    COLORS[i % COLORS.length],
        left:     `${2 + Math.random() * 96}%`,
        delay:    `${Math.random() * 0.8}s`,
        duration: `${2.2 + Math.random() * 1.8}s`,
        size:     `${7 + Math.random() * 8}px`,
        rotate:   `${Math.floor(Math.random() * 720)}deg`,
      }))
    )
    const t = setTimeout(() => setParticles([]), 4500)
    return () => clearTimeout(t)
  }, [active])

  if (!particles.length) return null

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:50, overflow:'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position:         'absolute',
            top:              '-14px',
            left:             p.left,
            width:            p.size,
            height:           p.size,
            background:       p.color,
            borderRadius:     Math.random() > 0.5 ? '50%' : '2px',
            animationName:    'confetti-fall',
            animationDuration:p.duration,
            animationDelay:   p.delay,
            animationTimingFunction: 'ease-in',
            animationFillMode:'forwards',
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0)    rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(var(--r, 540deg)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
