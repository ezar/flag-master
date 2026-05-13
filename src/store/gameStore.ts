import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FM_COUNTRIES, FM_REGIONS, type Country } from '../data/countries'
import { getPool, shuffle, pickDistractors, type Stage } from '../engine/questionEngine'

export type { Stage }
export type GameMode = 'flag2country' | 'country2flag' | 'hint' | 'capital' | 'type' | 'lightning'
export type Screen   = 'home' | 'game' | 'results'

export type MasteryEntry = { seen: number; hits: number }
export type MasteryMap   = Record<string, MasteryEntry>

const POINTS_BASE: Record<Stage, number> = { easy: 10, medium: 15, hard: 20 }
const QUESTIONS_PER_ROUND = 10

/** A country is "mastered" if seen ≥ 3 and hit rate ≥ 66% */
export function isMastered(e: MasteryEntry): boolean {
  return e.seen >= 3 && e.hits / e.seen >= 0.66
}

/** Mastery ratio for a region: mastered countries / total countries in region */
export function regionMastery(regionId: string, mastery: MasteryMap): number {
  const regionCountries = FM_COUNTRIES.filter(c => c.r === regionId)
  if (regionCountries.length === 0) return 0
  const masteredCount = regionCountries.filter(c => isMastered(mastery[c.n] ?? { seen: 0, hits: 0 })).length
  return masteredCount / regionCountries.length
}

/** Whether a region is unlocked based on prerequisite mastery */
export function isRegionUnlocked(regionId: string, mastery: MasteryMap): boolean {
  const region = FM_REGIONS.find(r => r.id === regionId)
  if (!region) return false
  if (!region.lock) return true  // europe is always unlocked
  return regionMastery(region.lock.region, mastery) >= region.lock.mastery
}

interface GameState {
  // Navigation
  screen: Screen

  // Preferences (persisted)
  stage: Stage
  mode:  GameMode

  // Lifetime history (persisted)
  bestStreak:     number
  totalGames:     number
  totalCorrect:   number
  totalQuestions: number

  // Per-country mastery (persisted)
  masteryCountries: MasteryMap

  // Current session (not persisted)
  pool:           Country[]
  questions:      Country[]
  qIndex:         number
  currentCountry: Country | null
  currentOptions: Country[]
  score:          number
  streak:         number
  maxStreak:      number
  correct:        number
  answered:       boolean
  wrongList:      Country[]
}

interface GameActions {
  startGame:    () => void
  nextQuestion: () => void
  answer:       (correct: boolean) => void
  finishGame:   () => void
  goHome:       () => void
  setStage:     (s: Stage) => void
  setMode:      (m: GameMode) => void
}

function buildOptions(country: Country, pool: Country[]): Country[] {
  const distractors = pickDistractors(country, pool, 3)
  return shuffle([country, ...distractors])
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // Navigation
      screen: 'home',

      // Preferences
      stage: 'medium',
      mode:  'flag2country',

      // Lifetime history
      bestStreak:     0,
      totalGames:     0,
      totalCorrect:   0,
      totalQuestions: 0,

      // Mastery
      masteryCountries: {},

      // Session (starts empty)
      pool:           [],
      questions:      [],
      qIndex:         0,
      currentCountry: null,
      currentOptions: [],
      score:          0,
      streak:         0,
      maxStreak:      0,
      correct:        0,
      answered:       false,
      wrongList:      [],

      startGame: () => {
        const { stage } = get()
        const pool      = getPool(stage, FM_COUNTRIES)
        const questions = shuffle(pool).slice(0, Math.min(QUESTIONS_PER_ROUND, pool.length))
        const current   = questions[0]
        set({
          screen:         'game',
          pool,
          questions,
          qIndex:         0,
          currentCountry: current,
          currentOptions: buildOptions(current, pool),
          score:          0,
          streak:         0,
          maxStreak:      0,
          correct:        0,
          answered:       false,
          wrongList:      [],
        })
      },

      nextQuestion: () => {
        const { qIndex, questions, pool } = get()
        const next = qIndex + 1
        if (next >= questions.length) {
          get().finishGame()
          return
        }
        const current = questions[next]
        set({
          qIndex:         next,
          currentCountry: current,
          currentOptions: buildOptions(current, pool),
          answered:       false,
        })
      },

      answer: (isCorrect: boolean) => {
        const { stage, score, streak, maxStreak, correct, wrongList, currentCountry, masteryCountries } = get()
        // Update per-country mastery
        const updatedMastery = currentCountry ? {
          ...masteryCountries,
          [currentCountry.n]: {
            seen: (masteryCountries[currentCountry.n]?.seen ?? 0) + 1,
            hits: (masteryCountries[currentCountry.n]?.hits ?? 0) + (isCorrect ? 1 : 0),
          },
        } : masteryCountries
        if (isCorrect) {
          const bonus     = streak * 2
          const pts       = POINTS_BASE[stage] + bonus
          const newStreak = streak + 1
          set({
            score:            score + pts,
            streak:           newStreak,
            maxStreak:        Math.max(maxStreak, newStreak),
            correct:          correct + 1,
            answered:         true,
            masteryCountries: updatedMastery,
          })
        } else {
          set({
            streak:           0,
            answered:         true,
            wrongList:        currentCountry ? [...wrongList, currentCountry] : wrongList,
            masteryCountries: updatedMastery,
          })
        }
      },

      finishGame: () => {
        const { bestStreak, totalGames, totalCorrect, totalQuestions, correct, maxStreak } = get()
        set({
          screen:         'results',
          bestStreak:     Math.max(bestStreak, maxStreak),
          totalGames:     totalGames + 1,
          totalCorrect:   totalCorrect + correct,
          totalQuestions: totalQuestions + QUESTIONS_PER_ROUND,
        })
      },

      goHome: () => set({ screen: 'home' }),

      setStage: (stage) => set({ stage }),
      setMode:  (mode)  => set({ mode }),
    }),
    {
      name: 'flagmaster_v2',
      partialize: (state) => ({
        stage:            state.stage,
        mode:             state.mode,
        bestStreak:       state.bestStreak,
        totalGames:       state.totalGames,
        totalCorrect:     state.totalCorrect,
        totalQuestions:   state.totalQuestions,
        masteryCountries: state.masteryCountries,
      }),
    },
  ),
)
