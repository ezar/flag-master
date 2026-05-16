import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FM_COUNTRIES, FM_REGIONS, type Country } from '../data/countries'
import { getPool, shuffle, pickDistractors, getWeightedPool, type Stage } from '../engine/questionEngine'
import { checkNewAchievements } from '../data/achievements'
import { setAudioEnabled } from '../audio/audioEngine'
import { type Lang } from '../i18n/translations'

export type { Stage }
export type GameMode = 'flag2country' | 'country2flag' | 'hint' | 'capital' | 'type' | 'lightning' | 'currency' | 'language' | 'marathon'
export type Screen   = 'home' | 'game' | 'results' | 'stats' | 'review' | 'profiles' | 'study' | 'daily'

export type MasteryEntry = { seen: number; hits: number }
export type MasteryMap   = Record<string, MasteryEntry>

// ── Profile ───────────────────────────────────────────────────────────────
export interface Profile {
  id:               string
  name:             string
  avatar:           string    // emoji
  // Per-profile preferences
  stage:            Stage
  mode:             GameMode
  regionFilter:     string | null
  // Per-profile stats
  bestStreak:       number
  totalGames:       number
  totalCorrect:     number
  totalQuestions:   number
  masteryCountries: MasteryMap
  dailyStreak:      number
  lastPlayedDate:   string | null
  lastDailyDate:    string | null
  achievements:     string[]
}

export const PROFILE_AVATARS = [
  '🧭','⚓','🗺️','🌊','✈️','🏆',
  '🌍','🌟','🦁','🐬','🦅','🎯',
  '🧩','📚','🎮','🌺','⛵','🔭',
]

const DEFAULT_PROFILE_STATS: Omit<Profile, 'id' | 'name' | 'avatar'> = {
  stage:            'medium',
  mode:             'flag2country',
  regionFilter:     null,
  bestStreak:       0,
  totalGames:       0,
  totalCorrect:     0,
  totalQuestions:   0,
  masteryCountries: {},
  dailyStreak:      0,
  lastPlayedDate:   null,
  lastDailyDate:    null,
  achievements:     [],
}

const POINTS_BASE: Record<Stage, number> = { easy: 10, medium: 15, hard: 20 }
const QUESTIONS_PER_ROUND = 10

/** A country is "mastered" if seen ≥ 3 and hit rate ≥ 66% */
export function isMastered(e: MasteryEntry): boolean {
  return e.seen >= 3 && e.hits / e.seen >= 0.66
}

/** Mastery ratio for a region */
export function regionMastery(regionId: string, mastery: MasteryMap): number {
  const rc = FM_COUNTRIES.filter(c => c.r === regionId)
  if (rc.length === 0) return 0
  return rc.filter(c => isMastered(mastery[c.n] ?? { seen: 0, hits: 0 })).length / rc.length
}

/** Whether a region is unlocked */
export function isRegionUnlocked(regionId: string, mastery: MasteryMap): boolean {
  const region = FM_REGIONS.find(r => r.id === regionId)
  if (!region) return false
  if (!region.lock) return true
  return regionMastery(region.lock.region, mastery) >= region.lock.mastery
}

// ── State ─────────────────────────────────────────────────────────────────
interface GameState {
  screen: Screen

  // Device preferences (shared across profiles)
  audioEnabled:    boolean
  musicEnabled:    boolean
  language:        Lang
  darkMode:        boolean
  notifEnabled:    boolean

  // Multi-profile
  profiles:        Profile[]
  activeProfileId: string | null

  // Active profile's preferences (loaded from profile on switch)
  stage:        Stage
  mode:         GameMode
  regionFilter: string | null

  // Active profile's stats (loaded from profile on switch)
  dailyStreak:      number
  lastPlayedDate:   string | null
  bestStreak:       number
  totalGames:       number
  totalCorrect:     number
  totalQuestions:   number
  masteryCountries: MasteryMap

  lastDailyDate:    string | null
  achievements:     string[]

  // Session (never persisted)
  lives:               number
  pendingAchievements: string[]
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
  // Profile management
  createProfile:  (name: string, avatar: string) => void
  selectProfile:  (id: string) => void
  deleteProfile:  (id: string) => void
  goProfiles:     () => void

  // Game flow
  startGame:    () => void
  nextQuestion: () => void
  answer:       (correct: boolean) => void
  finishGame:   () => void
  goHome:       () => void
  goStats:      () => void
  goReview:     () => void

  // Preferences
  setStage:        (s: Stage) => void
  setMode:         (m: GameMode) => void
  setAudio:        (v: boolean) => void
  setMusic:        (v: boolean) => void
  setLanguage:     (l: Lang) => void
  setDarkMode:     (v: boolean) => void
  setNotifEnabled: (v: boolean) => void
  goStudy:             () => void
  goDaily:             () => void
  setDailyResult:      (date: string) => void
  dismissAchievements: () => void
  setRegionFilter: (r: string | null) => void

  resetProgress: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────
function buildOptions(country: Country, pool: Country[]): Country[] {
  return shuffle([country, ...pickDistractors(country, pool, 3)])
}

/** Returns updated profiles array with current stats synced to active profile */
function syncToProfile(state: GameState): Profile[] {
  const { profiles, activeProfileId } = state
  if (!activeProfileId) return profiles
  return profiles.map(p => p.id !== activeProfileId ? p : {
    ...p,
    stage:            state.stage,
    mode:             state.mode,
    regionFilter:     state.regionFilter,
    bestStreak:       state.bestStreak,
    totalGames:       state.totalGames,
    totalCorrect:     state.totalCorrect,
    totalQuestions:   state.totalQuestions,
    masteryCountries: state.masteryCountries,
    dailyStreak:      state.dailyStreak,
    lastPlayedDate:   state.lastPlayedDate,
    lastDailyDate:    state.lastDailyDate,
    achievements:     state.achievements,
  })
}

// ── Store ─────────────────────────────────────────────────────────────────
export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      screen: 'profiles',

      // Device prefs
      audioEnabled:   true,
      musicEnabled:   true,
      language:       'es' as Lang,
      darkMode:       false,
      notifEnabled:   false,

      // Profiles
      profiles:        [],
      activeProfileId: null,

      // Active profile state (defaults — overwritten on selectProfile)
      stage:            'medium',
      mode:             'flag2country',
      regionFilter:     null,
      dailyStreak:      0,
      lastPlayedDate:   null,
      lastDailyDate:    null,
      achievements:     [] as string[],
      bestStreak:       0,
      totalGames:       0,
      totalCorrect:     0,
      totalQuestions:   0,
      masteryCountries: {},

      // Session
      lives:               0,
      pendingAchievements: [] as string[],
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

      // ── Profile actions ─────────────────────────────────────────────────
      createProfile: (name, avatar) => {
        const id      = Date.now().toString(36)
        const profile: Profile = { id, name, avatar, ...DEFAULT_PROFILE_STATS }
        const profiles = [...get().profiles, profile]
        set({
          profiles,
          activeProfileId:  id,
          screen:           'home',
          ...DEFAULT_PROFILE_STATS,
        })
      },

      selectProfile: (id) => {
        // Save current profile before switching
        const state  = get()
        const saved  = syncToProfile(state)
        const target = saved.find(p => p.id === id)
        if (!target) return
        set({
          profiles:         saved,
          activeProfileId:  id,
          screen:           'home',
          stage:            target.stage,
          mode:             target.mode,
          regionFilter:     target.regionFilter,
          bestStreak:       target.bestStreak,
          totalGames:       target.totalGames,
          totalCorrect:     target.totalCorrect,
          totalQuestions:   target.totalQuestions,
          masteryCountries: target.masteryCountries,
          dailyStreak:      target.dailyStreak,
          lastPlayedDate:   target.lastPlayedDate,
          lastDailyDate:    target.lastDailyDate,
          achievements:     target.achievements ?? [],
        })
      },

      deleteProfile: (id) => {
        const { profiles, activeProfileId } = get()
        const remaining = profiles.filter(p => p.id !== id)
        const newActive = activeProfileId === id
          ? (remaining[0]?.id ?? null)
          : activeProfileId

        if (newActive && newActive !== activeProfileId) {
          // Switching to another profile
          const target = remaining.find(p => p.id === newActive)!
          set({
            profiles:         remaining,
            activeProfileId:  newActive,
            screen:           remaining.length ? 'profiles' : 'profiles',
            stage:            target.stage,
            mode:             target.mode,
            regionFilter:     target.regionFilter,
            bestStreak:       target.bestStreak,
            totalGames:       target.totalGames,
            totalCorrect:     target.totalCorrect,
            totalQuestions:   target.totalQuestions,
            masteryCountries: target.masteryCountries,
            dailyStreak:      target.dailyStreak,
            lastPlayedDate:   target.lastPlayedDate,
          })
        } else {
          set({ profiles: remaining, activeProfileId: newActive, screen: 'profiles' })
        }
      },

      goProfiles: () => {
        // Save current profile stats before showing selector
        const state = get()
        set({ profiles: syncToProfile(state), screen: 'profiles' })
      },

      // ── Game actions ────────────────────────────────────────────────────
      startGame: () => {
        const { stage, mode, regionFilter, masteryCountries } = get()
        let pool = getPool(stage, FM_COUNTRIES)
        if (mode === 'currency') pool = pool.filter(c => c.curr)
        if (mode === 'language') pool = pool.filter(c => c.lang)

        let questions: Country[]
        let lives = 0

        if (mode === 'marathon') {
          // Large repeating pool — effectively infinite for a session
          const repeats = Math.max(3, Math.ceil(150 / pool.length))
          questions = Array.from({ length: repeats }, () => shuffle(pool)).flat()
          lives = 3
        } else {
          const source       = regionFilter ? pool.filter(c => c.r === regionFilter) : pool
          const questionPool = source.length >= 4 ? source : pool
          const weighted     = getWeightedPool(questionPool, masteryCountries)
          questions          = shuffle(weighted).slice(0, Math.min(QUESTIONS_PER_ROUND, weighted.length))
        }

        const current = questions[0]
        set({
          screen:              'game',
          pool,
          questions,
          lives,
          pendingAchievements: [],
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
        const { qIndex, questions, pool, mode, lives } = get()
        if (mode === 'marathon' && lives === 0) { get().finishGame(); return }
        const next = qIndex + 1
        if (next >= questions.length) { get().finishGame(); return }
        const current = questions[next]
        set({ qIndex: next, currentCountry: current, currentOptions: buildOptions(current, pool), answered: false })
      },

      answer: (isCorrect: boolean) => {
        const { stage, score, streak, maxStreak, correct, wrongList, currentCountry, masteryCountries, mode, lives } = get()
        const updatedMastery = currentCountry ? {
          ...masteryCountries,
          [currentCountry.n]: {
            seen: (masteryCountries[currentCountry.n]?.seen ?? 0) + 1,
            hits: (masteryCountries[currentCountry.n]?.hits ?? 0) + (isCorrect ? 1 : 0),
          },
        } : masteryCountries
        if (isCorrect) {
          const newStreak = streak + 1
          set({ score: score + POINTS_BASE[stage] + streak * 2, streak: newStreak, maxStreak: Math.max(maxStreak, newStreak), correct: correct + 1, answered: true, masteryCountries: updatedMastery })
        } else {
          const newLives = mode === 'marathon' ? Math.max(0, lives - 1) : lives
          set({ streak: 0, lives: newLives, answered: true, wrongList: currentCountry ? [...wrongList, currentCountry] : wrongList, masteryCountries: updatedMastery })
        }
      },

      finishGame: () => {
        const { bestStreak, totalGames, totalCorrect, totalQuestions, correct, maxStreak, dailyStreak, lastPlayedDate, mode, qIndex, lastDailyDate } = get()
        const achievements = get().achievements ?? []
        const today     = new Date().toISOString().slice(0, 10)
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
        const newDailyStreak  = lastPlayedDate === today ? dailyStreak : lastPlayedDate === yesterday ? dailyStreak + 1 : 1
        const newTotalGames   = totalGames + 1
        const newTotalCorrect = totalCorrect + correct
        const questionsPlayed = mode === 'marathon' ? qIndex + 1 : QUESTIONS_PER_ROUND
        // Achievement check after stats update
        const newAchs = checkNewAchievements(
          achievements,
          { totalGames: newTotalGames, totalCorrect: newTotalCorrect, dailyStreak: newDailyStreak, lastDailyDate },
          { correct, maxStreak, mode }
        )
        const newState = {
          screen:              'results' as Screen,
          bestStreak:          Math.max(bestStreak, maxStreak),
          totalGames:          newTotalGames,
          totalCorrect:        newTotalCorrect,
          totalQuestions:      totalQuestions + questionsPlayed,
          dailyStreak:         newDailyStreak,
          lastPlayedDate:      today,
          achievements:        [...achievements, ...newAchs],
          pendingAchievements: newAchs,
        }
        set(state => ({ ...newState, profiles: syncToProfile({ ...state, ...newState }) }))
      },

      goHome:    () => set({ screen: 'home' }),
      goStats:   () => set({ screen: 'stats' }),
      goReview:  () => set({ screen: 'review' }),
      goDaily:   () => set({ screen: 'daily' }),
      setDailyResult: (date) => {
        set(state => {
          const newAchs    = !state.achievements.includes('daily') ? ['daily'] : []
          const updated    = {
            lastDailyDate:       date,
            achievements:        [...state.achievements, ...newAchs],
            pendingAchievements: newAchs,
          }
          return { ...updated, profiles: syncToProfile({ ...state, ...updated }) }
        })
      },
      dismissAchievements: () => set({ pendingAchievements: [] }),

      setStage: (stage) => {
        set(state => ({ stage, profiles: syncToProfile({ ...state, stage }) }))
      },
      setMode: (mode) => {
        set(state => ({ mode, profiles: syncToProfile({ ...state, mode }) }))
      },
      setRegionFilter: (regionFilter) => {
        set(state => ({ regionFilter, profiles: syncToProfile({ ...state, regionFilter }) }))
      },
      setAudio: (v) => {
        setAudioEnabled(v)
        set({ audioEnabled: v })
      },
      setMusic: (v) => set({ musicEnabled: v }),
      setLanguage:     (language)    => set({ language }),
      setDarkMode:     (darkMode)    => set({ darkMode }),
      setNotifEnabled: (notifEnabled)=> set({ notifEnabled }),
      goStudy: () => set({ screen: 'study' }),

      resetProgress: () => {
        const reset = {
          bestStreak:       0,
          totalGames:       0,
          totalCorrect:     0,
          totalQuestions:   0,
          masteryCountries: {} as MasteryMap,
          dailyStreak:      0,
          lastPlayedDate:   null as string | null,
        }
        set(state => ({ ...reset, profiles: syncToProfile({ ...state, ...reset }) }))
      },
    }),
    {
      name: 'flagmaster_v3',
      partialize: (state) => ({
        audioEnabled:     state.audioEnabled,
        musicEnabled:     state.musicEnabled,
        language:         state.language,
        darkMode:         state.darkMode,
        notifEnabled:     state.notifEnabled,
        profiles:         state.profiles,
        activeProfileId:  state.activeProfileId,
        // Also persist active profile's flat state (for fast restore)
        stage:            state.stage,
        mode:             state.mode,
        regionFilter:     state.regionFilter,
        dailyStreak:      state.dailyStreak,
        lastPlayedDate:   state.lastPlayedDate,
        lastDailyDate:    state.lastDailyDate,
        achievements:     state.achievements,
        bestStreak:       state.bestStreak,
        totalGames:       state.totalGames,
        totalCorrect:     state.totalCorrect,
        totalQuestions:   state.totalQuestions,
        masteryCountries: state.masteryCountries,
      }),
    },
  ),
)
