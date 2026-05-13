import { describe, it, expect } from 'vitest'
import { getPool, shuffle, makeHint, norm, pickDistractors } from './questionEngine'
import { FM_COUNTRIES } from '../data/countries'

describe('getPool', () => {
  it('easy returns only easy countries', () => {
    const pool = getPool('easy', FM_COUNTRIES)
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every(c => c.s === 'easy')).toBe(true)
  })

  it('medium includes easy and medium, not hard', () => {
    const pool = getPool('medium', FM_COUNTRIES)
    const stages = new Set(pool.map(c => c.s))
    expect(stages.has('easy')).toBe(true)
    expect(stages.has('medium')).toBe(true)
    expect(stages.has('hard')).toBe(false)
  })

  it('hard includes all stages', () => {
    const pool = getPool('hard', FM_COUNTRIES)
    const stages = new Set(pool.map(c => c.s))
    expect(stages.has('easy')).toBe(true)
    expect(stages.has('medium')).toBe(true)
    expect(stages.has('hard')).toBe(true)
  })

  it('pools grow: easy < medium < hard', () => {
    const e = getPool('easy',   FM_COUNTRIES).length
    const m = getPool('medium', FM_COUNTRIES).length
    const h = getPool('hard',   FM_COUNTRIES).length
    expect(e).toBeLessThan(m)
    expect(m).toBeLessThan(h)
  })
})

describe('shuffle', () => {
  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result).toHaveLength(5)
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate original array', () => {
    const arr = [1, 2, 3]
    const copy = [...arr]
    shuffle(arr)
    expect(arr).toEqual(copy)
  })
})

describe('makeHint', () => {
  it('easy reveals first 2 letters per word', () => {
    // España: E,s revealed; p,a,ñ,a hidden → 'Es····'
    expect(makeHint('España', 'easy')).toBe('Es····')
  })

  it('medium reveals first letter per word', () => {
    expect(makeHint('España', 'medium')).toBe('E·····')
  })

  it('hard reveals first letter per word', () => {
    expect(makeHint('España', 'hard')).toBe('E·····')
  })

  it('handles multi-word names — each word independently', () => {
    // 'Estados Unidos' easy: Es····· Un····
    // Estados=7 chars, easy reveals Es, hides t,a,d,o,s → Es·····
    // Unidos=6 chars, easy reveals Un, hides i,d,o,s → Un····
    expect(makeHint('Estados Unidos', 'easy')).toBe('Es····· Un····')
  })

  it('preserves spaces between words', () => {
    const hint = makeHint('Nueva Zelanda', 'hard')
    expect(hint.includes(' ')).toBe(true)
  })

  it('preserves non-letter chars within words', () => {
    // Single-letter words like 'y' in 'Bosnia y Herzegovina'
    // hard: 'y' has 1 letter at index 0 → revealed → 'y'
    const hint = makeHint('Bosnia y Herzegovina', 'hard')
    // y word: 1 char, fully revealed
    expect(hint.split(' ')[1]).toBe('y')
  })
})

describe('norm', () => {
  it('lowercases', () => {
    expect(norm('ESPAÑA')).toBe('espana')
  })

  it('removes diacritics', () => {
    expect(norm('Japón')).toBe('japon')
    expect(norm('España')).toBe('espana')
  })

  it('normalized forms match', () => {
    expect(norm('Japón')).toBe(norm('japon'))
  })

  it('removes non-alphanumeric (keeps spaces)', () => {
    expect(norm('Bosnia y Herzegovina')).toBe('bosnia y herzegovina')
  })

  it('trims and collapses spaces', () => {
    expect(norm('  estados   unidos  ')).toBe('estados unidos')
  })

  it('handles empty string', () => {
    expect(norm('')).toBe('')
  })
})

describe('pickDistractors', () => {
  const correct = FM_COUNTRIES[0]

  it('returns exactly N distractors', () => {
    expect(pickDistractors(correct, FM_COUNTRIES, 3)).toHaveLength(3)
  })

  it('never includes the correct country (30 random runs)', () => {
    for (let i = 0; i < 30; i++) {
      const result = pickDistractors(correct, FM_COUNTRIES, 3)
      expect(result.every(c => c.n !== correct.n)).toBe(true)
    }
  })

  it('returns unique entries', () => {
    const result = pickDistractors(correct, FM_COUNTRIES, 3)
    const names = result.map(c => c.n)
    expect(new Set(names).size).toBe(3)
  })
})
