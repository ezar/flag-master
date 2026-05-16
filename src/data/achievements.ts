export interface Achievement {
  id:    string
  emoji: string
  title: { es: string; en: string }
  desc:  { es: string; en: string }
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game', emoji: '🎯',
    title: { es: 'Primera aventura', en: 'First adventure' },
    desc:  { es: 'Completa tu primera partida', en: 'Complete your first game' },
  },
  {
    id: 'perfect', emoji: '⭐',
    title: { es: 'Sin errores', en: 'Flawless' },
    desc:  { es: '10 de 10 en una partida', en: '10 out of 10 in a game' },
  },
  {
    id: 'streak_3', emoji: '🔥',
    title: { es: 'Racha de 3', en: '3-day streak' },
    desc:  { es: 'Juega 3 días seguidos', en: 'Play 3 days in a row' },
  },
  {
    id: 'streak_7', emoji: '🌊',
    title: { es: 'Una semana', en: 'One week' },
    desc:  { es: 'Racha de 7 días', en: '7-day streak' },
  },
  {
    id: 'streak_30', emoji: '💫',
    title: { es: 'Un mes', en: 'One month' },
    desc:  { es: 'Racha de 30 días', en: '30-day streak' },
  },
  {
    id: 'centurion', emoji: '🏆',
    title: { es: 'Centurión', en: 'Centurion' },
    desc:  { es: '100 partidas completadas', en: '100 games completed' },
  },
  {
    id: 'thousand', emoji: '🌟',
    title: { es: 'Leyenda', en: 'Legend' },
    desc:  { es: '1.000 aciertos en total', en: '1,000 total correct answers' },
  },
  {
    id: 'marathon', emoji: '🏃',
    title: { es: 'Maratoniano', en: 'Marathoner' },
    desc:  { es: 'Completa una partida maratón', en: 'Finish a marathon game' },
  },
  {
    id: 'daily', emoji: '🧭',
    title: { es: 'Explorador diario', en: 'Daily explorer' },
    desc:  { es: 'Completa el desafío del día', en: 'Complete the daily challenge' },
  },
  {
    id: 'lightning_10', emoji: '⚡',
    title: { es: 'Rayo', en: 'Lightning bolt' },
    desc:  { es: 'Racha de 10 en modo Relámpago', en: '10-streak in Lightning mode' },
  },
]

export function checkNewAchievements(
  unlocked: string[],
  stats: { totalGames: number; totalCorrect: number; dailyStreak: number; lastDailyDate: string | null },
  session: { correct: number; maxStreak: number; mode: string }
): string[] {
  const has = (id: string) => (unlocked ?? []).includes(id)
  const next: string[] = []

  if (!has('first_game')   && stats.totalGames >= 1)       next.push('first_game')
  if (!has('perfect')      && session.correct >= 10)        next.push('perfect')
  if (!has('streak_3')     && stats.dailyStreak >= 3)       next.push('streak_3')
  if (!has('streak_7')     && stats.dailyStreak >= 7)       next.push('streak_7')
  if (!has('streak_30')    && stats.dailyStreak >= 30)      next.push('streak_30')
  if (!has('centurion')    && stats.totalGames >= 100)      next.push('centurion')
  if (!has('thousand')     && stats.totalCorrect >= 1000)   next.push('thousand')
  if (!has('marathon')     && session.mode === 'marathon')  next.push('marathon')
  if (!has('daily')        && !!stats.lastDailyDate)        next.push('daily')
  if (!has('lightning_10') && session.maxStreak >= 5 && session.mode === 'lightning') next.push('lightning_10')

  return next
}
