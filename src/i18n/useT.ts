import { useGameStore } from '../store/gameStore'
import { tr } from './translations'

/**
 * Returns a translation function bound to the current language.
 * Usage: const t = useT()  →  t('home.sail')  |  t('home.countries', { n: 23 })
 */
export function useT() {
  const language = useGameStore(s => s.language)
  return (key: string, params?: Record<string, string | number>) =>
    tr(language, key, params)
}
