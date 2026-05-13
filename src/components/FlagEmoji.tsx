interface Props {
  emoji: string
  size?: number
  style?: React.CSSProperties
}

/**
 * Converts a flag emoji to its ISO 3166-1 alpha-2 code.
 * Flag emojis are pairs of Regional Indicator letters (U+1F1E6–U+1F1FF).
 * 🇪🇸 → 'es', 🇬🇧 → 'gb', etc.
 */
function emojiToISO(emoji: string): string {
  return [...emoji]
    .map(c => String.fromCharCode(c.codePointAt(0)! - 0x1F1E6 + 65))
    .join('')
    .toLowerCase()
}

/**
 * Renders flags as SVG images from flagcdn.com.
 * Works on all platforms/browsers — no emoji font required.
 */
export function FlagEmoji({ emoji, size = 24, style }: Props) {
  const iso = emojiToISO(emoji)
  // flagcdn.com provides official flag SVGs — vector, any size
  const src = `https://flagcdn.com/${iso}.svg`

  return (
    <img
      src={src}
      alt={iso.toUpperCase()}
      width={size}
      draggable={false}
      style={{
        display:    'inline-block',
        verticalAlign: 'middle',
        objectFit: 'cover',
        borderRadius: 2,
        ...style,
      }}
    />
  )
}
