import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calcCurrentStreak, calcBestStreak, calcMoneySaved } from './streak'

// Helper: create date string N days ago from a fixed "today"
function daysAgo(n, base = new Date(2024, 2, 14)) {
  const d = new Date(base)
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2024, 2, 14)) })
afterEach(() => { vi.useRealTimers() })

describe('calcCurrentStreak', () => {
  it('returns 0 when no data', () => {
    expect(calcCurrentStreak([], [], [])).toBe(0)
  })

  it('returns 0 when smell logged today, even with a resist today', () => {
    const sml = [{ date: daysAgo(0) }]
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }]
    expect(calcCurrentStreak(sml, res, [])).toBe(0)
  })

  it('counts consecutive days with resists', () => {
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }, { date: daysAgo(2) }]
    expect(calcCurrentStreak([], res, [])).toBe(3)
  })

  it('counts check-ins as active days', () => {
    const chk = [{ date: daysAgo(0) }, { date: daysAgo(1) }]
    expect(calcCurrentStreak([], [], chk)).toBe(2)
  })

  it('mixed resists and check-ins extend streak', () => {
    const res = [{ date: daysAgo(0) }]
    const chk = [{ date: daysAgo(1) }]
    expect(calcCurrentStreak([], res, chk)).toBe(2)
  })

  it('multiple entries on one day count once', () => {
    const res = [{ date: daysAgo(0) }, { date: daysAgo(0) }, { date: daysAgo(1) }]
    expect(calcCurrentStreak([], res, [{ date: daysAgo(0) }])).toBe(2)
  })

  it('breaks at a smell day', () => {
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }, { date: daysAgo(3) }]
    const sml = [{ date: daysAgo(2) }]
    expect(calcCurrentStreak(sml, res, [])).toBe(2)
  })

  it('a day with both resist and smell breaks the streak', () => {
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }, { date: daysAgo(2) }]
    const sml = [{ date: daysAgo(1) }]
    expect(calcCurrentStreak(sml, res, [])).toBe(1)
  })

  it('breaks at an empty day', () => {
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }, { date: daysAgo(3) }, { date: daysAgo(4) }]
    expect(calcCurrentStreak([], res, [])).toBe(2)
  })

  it('today is pending: shows streak up to yesterday when nothing logged today', () => {
    const res = [{ date: daysAgo(1) }, { date: daysAgo(2) }]
    expect(calcCurrentStreak([], res, [])).toBe(2)
  })

  it('today pending does not rescue an empty yesterday', () => {
    const res = [{ date: daysAgo(2) }, { date: daysAgo(3) }]
    expect(calcCurrentStreak([], res, [])).toBe(0)
  })

  it('does not count gaps since an old resist', () => {
    const res = [{ date: daysAgo(30) }]
    expect(calcCurrentStreak([], res, [])).toBe(0)
  })

  it('handles streaks longer than a year', () => {
    const res = Array.from({ length: 400 }, (_, i) => ({ date: daysAgo(i) }))
    expect(calcCurrentStreak([], res, [])).toBe(400)
  })
})

describe('calcBestStreak', () => {
  it('returns 0 when no data', () => {
    expect(calcBestStreak([], [], [], 0)).toBe(0)
  })

  it('returns 0 when only smells', () => {
    expect(calcBestStreak([{ date: daysAgo(0) }], [], [], 0)).toBe(0)
  })

  it('equals current streak when it is the longest', () => {
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }]
    const curS = calcCurrentStreak([], res, [])
    expect(calcBestStreak([], res, [], curS)).toBe(2)
  })

  it('finds best streak in history', () => {
    const res = [0, 1, 3, 4, 5, 6, 7].map(n => ({ date: daysAgo(n) }))
    const sml = [{ date: daysAgo(2) }]
    const curS = calcCurrentStreak(sml, res, [])
    expect(curS).toBe(2)
    expect(calcBestStreak(sml, res, [], curS)).toBe(5)
  })

  it('empty days break historical streaks', () => {
    const res = [10, 11, 12, 20, 21].map(n => ({ date: daysAgo(n) }))
    expect(calcBestStreak([], res, [], 0)).toBe(3)
  })

  it('smell days break historical streaks even with a resist that day', () => {
    const res = [5, 6, 7, 8].map(n => ({ date: daysAgo(n) }))
    const sml = [{ date: daysAgo(6) }]
    expect(calcBestStreak(sml, res, [], 0)).toBe(2)
  })

  it('is never lower than current streak', () => {
    const res = [0, 1, 2].map(n => ({ date: daysAgo(n) }))
    const curS = calcCurrentStreak([], res, [])
    expect(calcBestStreak([], res, [], curS)).toBeGreaterThanOrEqual(curS)
  })

  it('works across month boundaries', () => {
    vi.setSystemTime(new Date(2024, 3, 2))
    const res = ['2024-03-30', '2024-03-31', '2024-04-01', '2024-04-02'].map(date => ({ date }))
    expect(calcCurrentStreak([], res, [])).toBe(4)
    expect(calcBestStreak([], res, [], 0)).toBe(4)
  })
})

describe('calcMoneySaved', () => {
  it('multiplies resist count by smell cost', () => {
    expect(calcMoneySaved(10, 50)).toBe(500)
  })

  it('returns 0 with no resists', () => {
    expect(calcMoneySaved(0, 50)).toBe(0)
  })

  it('handles custom cost', () => {
    expect(calcMoneySaved(5, 120)).toBe(600)
  })
})
