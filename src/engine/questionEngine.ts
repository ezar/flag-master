import type { Country } from '../data/countries'

export type Stage = 'easy' | 'medium' | 'hard'

const STAGE_INCLUDES: Record<Stage, Stage[]> = {
  easy:   ['easy'],
  medium: ['easy', 'medium'],
  hard:   ['easy', 'medium', 'hard'],
}

/** Pool filtrado por stage (acumulativo: hard incluye medium+easy) */
export function getPool(stage: Stage, countries: Country[]): Country[] {
  const allowed = new Set<string>(STAGE_INCLUDES[stage])
  return countries.filter(c => allowed.has(c.s))
}

/** Shuffle Fisher-Yates — no muta el array original */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Pistas: revela primeras N letras por palabra según dificultad.
 * easy → 2 letras, medium/hard → 1 letra; resto = '·' (U+00B7)
 * Lógica extraída de maskName() en el prototipo.
 * Caracteres no-letra dentro de una palabra se devuelven tal cual.
 */
export function makeHint(name: string, stage: Stage): string {
  const revealCount = stage === 'easy' ? 2 : 1
  return name
    .split(' ')
    .map(word =>
      [...word]
        .map((ch, i) => {
          if (!/[A-Za-záéíóúüñÁÉÍÓÚÜÑ]/.test(ch)) return ch
          return i < revealCount ? ch : '·'
        })
        .join('')
    )
    .join(' ')
}

/**
 * Normalización para modo 'type': elimina acentos, minúsculas, trim.
 * Permite comparar entrada libre del usuario contra el nombre correcto.
 */
export function norm(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Selecciona N distractores del pool excluyendo el país correcto */
export function pickDistractors(correct: Country, pool: Country[], n: number): Country[] {
  const others = pool.filter(c => c.n !== correct.n)
  return shuffle(others).slice(0, n)
}

/** Weighted pool: struggling countries (seen≥3, hit rate<40%) appear twice */
export function getWeightedPool(
  pool: Country[],
  mastery: Record<string, { seen: number; hits: number }>
): Country[] {
  const result: Country[] = []
  for (const c of pool) {
    result.push(c)
    const m = mastery[c.n]
    if (m && m.seen >= 3 && m.hits / m.seen < 0.4) result.push(c)
  }
  return result
}

/** Deterministic daily country — cycles through all countries, no repeats for 147 days */
export function getDailyCountry(countries: Country[], dateStr: string): Country {
  const epoch  = Date.UTC(2026, 0, 1)
  const day    = Math.floor((new Date(dateStr).getTime() - epoch) / 86_400_000)
  // Multiplicative skip: gcd(43, 147) = 1 → full 147-day cycle with no repeats
  const index  = (((day * 43) % countries.length) + countries.length) % countries.length
  return countries[index]
}
