import { useState } from 'react'

interface Props {
  emoji:   string
  width?:  number
  height?: number
  style?:  React.CSSProperties
}

function emojiToISO(emoji: string): string {
  return [...emoji]
    .map(c => String.fromCharCode(c.codePointAt(0)! - 0x1F1E6 + 65))
    .join('')
    .toLowerCase()
}

export function FlagEmoji({ emoji, width, height, style }: Props) {
  const [failed, setFailed] = useState(false)
  const iso = emojiToISO(emoji)

  if (failed) {
    // Offline / CDN unreachable — show emoji text as fallback
    return (
      <span
        style={{
          fontSize:      height ? `${Math.round(height * 1.4)}px` : '40px',
          lineHeight:    1,
          display:       'inline-block',
          verticalAlign: 'middle',
          ...style,
        }}
        aria-label={iso.toUpperCase()}
      >
        {emoji}
      </span>
    )
  }

  return (
    <img
      src={`https://flagcdn.com/${iso}.svg`}
      alt={iso.toUpperCase()}
      width={width}
      height={height}
      draggable={false}
      onError={() => setFailed(true)}
      style={{
        display:       'inline-block',
        verticalAlign: 'middle',
        objectFit:     'cover',
        borderRadius:  2,
        ...style,
      }}
    />
  )
}
