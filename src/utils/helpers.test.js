import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { td, fd, fds, ago, agl, gmq } from './helpers'

describe('td – today as ISO string', () => {
  it('returns YYYY-MM-DD for today', () => {
    const r = td()
    expect(r).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const d = new Date()
    const exp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    expect(r).toBe(exp)
  })

  it('pads single-digit months and days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 5)) // Jan 5
    expect(td()).toBe('2024-01-05')
    vi.useRealTimers()
  })
})

describe('fd – format date to Norwegian', () => {
  it('formats 2024-03-14 as "14. mar"', () => {
    expect(fd('2024-03-14')).toBe('14. mar')
  })

  it('formats 2024-01-01 as "1. jan"', () => {
    expect(fd('2024-01-01')).toBe('1. jan')
  })

  it('formats 2024-12-25 as "25. des"', () => {
    expect(fd('2024-12-25')).toBe('25. des')
  })
})

describe('fds – short date format', () => {
  it('formats 2024-03-14 as "14/3"', () => {
    expect(fds('2024-03-14')).toBe('14/3')
  })

  it('formats 2024-01-01 as "1/1"', () => {
    expect(fds('2024-01-01')).toBe('1/1')
  })
})

describe('ago – date N days ago', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2024, 2, 14)) })
  afterEach(() => { vi.useRealTimers() })

  it('ago(0) returns today', () => {
    expect(ago(0)).toBe('2024-03-14')
  })

  it('ago(1) returns yesterday', () => {
    expect(ago(1)).toBe('2024-03-13')
  })

  it('ago(7) returns a week ago', () => {
    expect(ago(7)).toBe('2024-03-07')
  })

  it('handles month boundary', () => {
    vi.setSystemTime(new Date(2024, 2, 2)) // Mar 2
    expect(ago(2)).toBe('2024-02-29') // 2024 is leap year
  })
})

describe('agl – ago label in Norwegian', () => {
  it('returns "I dag" for 0', () => {
    expect(agl(0)).toBe('I dag')
  })

  it('returns "I går" for 1', () => {
    expect(agl(1)).toBe('I går')
  })

  it('returns "3 dager siden" for 3', () => {
    expect(agl(3)).toBe('3 dager siden')
  })
})

describe('gmq – motivational quote generator', () => {
  it('returns a string', () => {
    const r = gmq(['weight'], ['self'], '')
    expect(typeof r).toBe('string')
    expect(r.length).toBeGreaterThan(0)
  })

  it('replaces {goal} placeholder with goal label', () => {
    // Run multiple times to find one with {goal} replaced
    let found = false
    for (let i = 0; i < 50; i++) {
      const r = gmq(['weight'], ['self'], '')
      if (r.includes('gå ned i vekt')) { found = true; break }
    }
    expect(found).toBe(true)
  })

  it('replaces {why} placeholder with why label', () => {
    let found = false
    for (let i = 0; i < 50; i++) {
      const r = gmq(['weight'], ['self'], '')
      if (r.includes('meg selv')) { found = true; break }
    }
    expect(found).toBe(true)
  })

  it('avoids repeating the last quote', () => {
    const first = gmq(['weight'], ['self'], '')
    let different = false
    for (let i = 0; i < 20; i++) {
      if (gmq(['weight'], ['self'], first) !== first) { different = true; break }
    }
    expect(different).toBe(true)
  })

  it('uses fallback quotes when no goals/whys', () => {
    const r = gmq([], [], '')
    expect(typeof r).toBe('string')
    expect(r.length).toBeGreaterThan(0)
  })

  it('handles custom goals with "custom:" prefix', () => {
    let found = false
    for (let i = 0; i < 50; i++) {
      const r = gmq(['custom:bli sterkere'], ['self'], '')
      if (r.includes('bli sterkere')) { found = true; break }
    }
    expect(found).toBe(true)
  })
})
