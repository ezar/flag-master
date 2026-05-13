import { describe, it, expect } from 'vitest'
import { FM_COUNTRIES, FM_REGIONS } from './countries'

const VALID_STAGES  = new Set(['easy', 'medium', 'hard'])
const VALID_REGIONS = new Set(['europe', 'americas', 'asia', 'africa', 'oceania'])

describe('FM_COUNTRIES', () => {
  it('has at least 70 countries', () => {
    expect(FM_COUNTRIES.length).toBeGreaterThanOrEqual(70)
  })

  it('every country has all required fields', () => {
    FM_COUNTRIES.forEach(c => {
      expect(c.f,  `${c.n} missing f`).toBeTruthy()
      expect(c.n,  `missing n`).toBeTruthy()
      expect(c.ne, `${c.n} missing ne`).toBeTruthy()
      expect(c.c,  `${c.n} missing c`).toBeTruthy()
      expect(VALID_STAGES.has(c.s),  `${c.n} invalid stage`).toBe(true)
      expect(VALID_REGIONS.has(c.r), `${c.n} invalid region`).toBe(true)
    })
  })

  it('country names are unique', () => {
    const names = FM_COUNTRIES.map(c => c.n)
    expect(new Set(names).size).toBe(names.length)
  })

  it('has countries from all 5 regions', () => {
    const regions = new Set(FM_COUNTRIES.map(c => c.r))
    expect(regions.has('europe')).toBe(true)
    expect(regions.has('americas')).toBe(true)
    expect(regions.has('asia')).toBe(true)
    expect(regions.has('africa')).toBe(true)
    expect(regions.has('oceania')).toBe(true)
  })
})

describe('FM_REGIONS', () => {
  it('has 5 regions', () => {
    expect(FM_REGIONS).toHaveLength(5)
  })

  it('every region has nameEn', () => {
    FM_REGIONS.forEach(r => {
      expect(r.nameEn, `${r.id} missing nameEn`).toBeTruthy()
    })
  })

  it('europe has no lock', () => {
    const eu = FM_REGIONS.find(r => r.id === 'europe')
    expect(eu?.lock).toBeNull()
  })

  it('all non-europe regions have a lock', () => {
    FM_REGIONS.filter(r => r.id !== 'europe').forEach(r => {
      expect(r.lock, `${r.id} should have lock`).not.toBeNull()
    })
  })
})
