interface Props {
  emoji: string
  size?: number
  style?: React.CSSProperties
}

/**
 * Renders flag emojis as images via Twemoji CDN.
 * Fixes Windows/Chromium which renders flag emojis as 2-letter text codes.
 */
export function FlagEmoji({ emoji, size = 24, style }: Props) {
  const codePoints = [...emoji]
    .map(c => c.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-')

  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`}
      alt={emoji}
      width={size}
      height={size}
      draggable={false}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  )
}
