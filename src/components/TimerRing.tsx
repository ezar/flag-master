import { useEffect, useRef, useState } from 'react'

const CIRC = 2 * Math.PI * 22  // ≈ 138.23

interface Props {
  seconds:   number
  onTimeout: () => void
}

export function TimerRing({ seconds, onTimeout }: Props) {
  const [timeLeft, setTimeLeft]  = useState(seconds)
  const startRef                  = useRef(Date.now())
  const calledRef                 = useRef(false)

  useEffect(() => {
    startRef.current  = Date.now()
    calledRef.current = false
    setTimeLeft(seconds)

    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000
      const left    = Math.max(0, seconds - elapsed)
      setTimeLeft(left)
      if (left <= 0 && !calledRef.current) {
        calledRef.current = true
        clearInterval(id)
        onTimeout()
      }
    }, 80)

    return () => clearInterval(id)
  }, [seconds, onTimeout])

  const danger = timeLeft <= 3
  const offset = CIRC * (1 - timeLeft / seconds)

  return (
    <div style={{ position: 'relative', width: 54, height: 54 }}>
      <svg
        viewBox="0 0 50 50"
        style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="25" cy="25" r="22"
          fill="none"
          stroke="var(--rule)"
          strokeWidth="4"
        />
        <circle
          cx="25" cy="25" r="22"
          fill="none"
          stroke={danger ? 'var(--err)' : 'var(--gold)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      <div
        style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     "'Playfair Display', serif",
          fontWeight:     700,
          fontSize:       18,
          color:          danger ? 'var(--err)' : 'var(--ink)',
          animation:      danger ? 'timerPulse 0.5s ease-in-out infinite' : 'none',
        }}
      >
        {Math.ceil(timeLeft)}
      </div>
      <style>{`
        @keyframes timerPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
