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
  const iso = emojiToISO(emoji)
  return (
    <img
      src={`https://flagcdn.com/${iso}.svg`}
      alt={iso.toUpperCase()}
      width={width}
      height={height}
      draggable={false}
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
