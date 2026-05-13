interface Props {
  current: number
  total:   number
}

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0
  return (
    <div
      style={{
        height: 3,
        background: 'rgba(245,237,214,0.12)',
        position: 'relative',
        overflow: 'hidden',
        marginTop: 12,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${pct}%`,
          background: 'linear-gradient(to right, var(--gold-2), var(--gold), var(--gold-light))',
          transition: 'width 0.35s ease',
        }}
      />
    </div>
  )
}
