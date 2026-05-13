import { describe, it, expect, beforeEach } from 'vitest'

// Mock localStorage for Zustand's persist middleware
const mockStorage: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem:    (key: string) => mockStorage[key] ?? null,
    setItem:    (key: string, val: string) => { mockStorage[key] = val },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear:      () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
  },
  configurable: true,
})

// Import AFTER mocking localStorage
import { useGameStore } from './gameStore'

function resetSession() {
  useGameStore.setState({
    screen:         'home',
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
  })
}

describe('startGame', () => {
  beforeEach(resetSession)

  it('switches screen to game', () => {
    useGameStore.getState().startGame()
    expect(useGameStore.getState().screen).toBe('game')
  })

  it('resets score, streak, correct, wrongList', () => {
    useGameStore.setState({ score: 100, streak: 5, correct: 8, wrongList: [{ f: '🇪🇸', n: 'España', ne: 'Spain', c: 'Madrid', s: 'easy', r: 'europe' }] })
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    expect(s.score).toBe(0)
    expect(s.streak).toBe(0)
    expect(s.correct).toBe(0)
    expect(s.wrongList).toHaveLength(0)
  })

  it('builds pool with at least 10 countries for medium stage', () => {
    useGameStore.setState({ stage: 'medium' })
    useGameStore.getState().startGame()
    expect(useGameStore.getState().pool.length).toBeGreaterThanOrEqual(10)
  })

  it('selects exactly 10 questions', () => {
    useGameStore.getState().startGame()
    expect(useGameStore.getState().questions).toHaveLength(10)
  })

  it('sets currentCountry to questions[0]', () => {
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    expect(s.currentCountry).toEqual(s.questions[0])
  })

  it('sets 4 currentOptions', () => {
    useGameStore.getState().startGame()
    expect(useGameStore.getState().currentOptions).toHaveLength(4)
  })

  it('currentOptions includes currentCountry', () => {
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    const correctInOptions = s.currentOptions.some(o => o.n === s.currentCountry!.n)
    expect(correctInOptions).toBe(true)
  })
})

describe('answer — correct', () => {
  beforeEach(() => {
    resetSession()
    useGameStore.getState().startGame()
  })

  it('marks answered = true', () => {
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().answered).toBe(true)
  })

  it('increments correct count', () => {
    const before = useGameStore.getState().correct
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().correct).toBe(before + 1)
  })

  it('increments streak', () => {
    useGameStore.setState({ streak: 2 })
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().streak).toBe(3)
  })

  it('adds base points for easy stage (streak 0 → bonus 0)', () => {
    useGameStore.setState({ stage: 'easy', streak: 0, score: 0 })
    useGameStore.getState().answer(true)
    // easy base = 10, streak was 0 before answer → bonus = 0*2 = 0 → total = 10
    expect(useGameStore.getState().score).toBe(10)
  })

  it('adds base + streak bonus (streak 2 → bonus 4)', () => {
    useGameStore.setState({ stage: 'easy', streak: 2, score: 0 })
    useGameStore.getState().answer(true)
    // bonus = 2*2 = 4 → 10 + 4 = 14
    expect(useGameStore.getState().score).toBe(14)
  })

  it('updates maxStreak when streak exceeds it', () => {
    useGameStore.setState({ streak: 4, maxStreak: 4 })
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().maxStreak).toBe(5)
  })

  it('does not add to wrongList', () => {
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().wrongList).toHaveLength(0)
  })
})

describe('answer — wrong', () => {
  beforeEach(() => {
    resetSession()
    useGameStore.getState().startGame()
  })

  it('marks answered = true', () => {
    useGameStore.getState().answer(false)
    expect(useGameStore.getState().answered).toBe(true)
  })

  it('resets streak to 0', () => {
    useGameStore.setState({ streak: 3 })
    useGameStore.getState().answer(false)
    expect(useGameStore.getState().streak).toBe(0)
  })

  it('adds currentCountry to wrongList', () => {
    const country = useGameStore.getState().currentCountry!
    useGameStore.getState().answer(false)
    expect(useGameStore.getState().wrongList).toContainEqual(country)
  })

  it('does not change score', () => {
    useGameStore.setState({ score: 50 })
    useGameStore.getState().answer(false)
    expect(useGameStore.getState().score).toBe(50)
  })
})

describe('finishGame', () => {
  beforeEach(() => {
    resetSession()
    useGameStore.getState().startGame()
  })

  it('switches screen to results', () => {
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().screen).toBe('results')
  })

  it('increments totalGames', () => {
    const before = useGameStore.getState().totalGames
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().totalGames).toBe(before + 1)
  })

  it('persists correct count to totalCorrect', () => {
    useGameStore.setState({ correct: 7 })
    const before = useGameStore.getState().totalCorrect
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().totalCorrect).toBe(before + 7)
  })

  it('updates bestStreak when maxStreak exceeds it', () => {
    useGameStore.setState({ maxStreak: 8, bestStreak: 5 })
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().bestStreak).toBe(8)
  })
})

describe('nextQuestion', () => {
  beforeEach(() => {
    resetSession()
    useGameStore.getState().startGame()
  })

  it('advances qIndex', () => {
    const before = useGameStore.getState().qIndex
    useGameStore.getState().nextQuestion()
    expect(useGameStore.getState().qIndex).toBe(before + 1)
  })

  it('resets answered to false', () => {
    useGameStore.setState({ answered: true })
    useGameStore.getState().nextQuestion()
    expect(useGameStore.getState().answered).toBe(false)
  })

  it('updates currentCountry to next question', () => {
    useGameStore.getState().nextQuestion()
    const s = useGameStore.getState()
    // After nextQuestion, qIndex is 1, currentCountry should be questions[1]
    expect(s.currentCountry).toEqual(s.questions[1])
  })
})

describe('goHome', () => {
  it('switches screen to home', () => {
    useGameStore.setState({ screen: 'game' })
    useGameStore.getState().goHome()
    expect(useGameStore.getState().screen).toBe('home')
  })
})

describe('setStage / setMode', () => {
  it('setStage updates stage', () => {
    useGameStore.getState().setStage('hard')
    expect(useGameStore.getState().stage).toBe('hard')
  })

  it('setMode updates mode', () => {
    useGameStore.getState().setMode('capital')
    expect(useGameStore.getState().mode).toBe('capital')
  })
})
