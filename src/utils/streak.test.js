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

  it('returns 0 when smell logged today', () => {
    const sml = [{ date: daysAgo(0) }]
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }]
    expect(calcCurrentStreak(sml, res, [])).toBe(0)
  })

  it('counts consecutive days with resists', () => {
    const res = [
      { date: daysAgo(0) },
      { date: daysAgo(1) },
      { date: daysAgo(2) },
    ]
    expect(calcCurrentStreak([], res, [])).toBe(3)
  })

  it('counts consecutive days with checkins', () => {
    const res = [{ date: daysAgo(0) }] // need at least 1 resist/smell for non-zero
    const chk = [
      { date: daysAgo(0) },
      { date: daysAgo(1) },
    ]
    // Today + yesterday have activity, day 2 has none and no earlier history → breaks
    expect(calcCurrentStreak([], res, chk)).toBe(2)
  })

  it('breaks streak at smell date', () => {
    const res = [
      { date: daysAgo(0) },
      { date: daysAgo(1) },
      { date: daysAgo(3) },
    ]
    const sml = [{ date: daysAgo(2) }]
    expect(calcCurrentStreak(sml, res, [])).toBe(2)
  })

  it('mixed resists and checkins extend streak', () => {
    const res = [{ date: daysAgo(0) }]
    const chk = [{ date: daysAgo(1) }]
    expect(calcCurrentStreak([], res, chk)).toBe(2)
  })

  it('today always counts even without activity (if data exists)', () => {
    // Only a resist from yesterday — today still counts as day 0 of loop
    const res = [{ date: daysAgo(1) }]
    expect(calcCurrentStreak([], res, [])).toBe(2)
  })
})

describe('calcBestStreak', () => {
  it('equals curS when no smells', () => {
    const res = [{ date: daysAgo(0) }, { date: daysAgo(1) }]
    const curS = calcCurrentStreak([], res, [])
    expect(calcBestStreak([], res, [], curS)).toBe(curS)
  })

  it('finds best streak in history', () => {
    // 5-day streak, then smell, then 2-day streak
    const res = [
      { date: daysAgo(0) },
      { date: daysAgo(1) },
      { date: daysAgo(3) },
      { date: daysAgo(4) },
      { date: daysAgo(5) },
      { date: daysAgo(6) },
      { date: daysAgo(7) },
    ]
    const sml = [{ date: daysAgo(2) }]
    const curS = calcCurrentStreak(sml, res, [])
    const best = calcBestStreak(sml, res, [], curS)
    expect(best).toBeGreaterThanOrEqual(curS)
    // Before smell: days 3-7 = 5 days of resists, but the streak is counted differently
    // The best streak counts consecutive non-smell days from first activity to today
    // Days 7,6,5,4,3 = no smell, day 2 = smell → streak of 5
    // Days 1,0 = no smell → streak of 2
    // Plus days between activities count too in bestStreak (it counts all non-smell days)
    expect(best).toBe(5)
  })

  it('returns 0 when no data', () => {
    expect(calcBestStreak([{ date: daysAgo(0) }], [], [], 0)).toBe(0)
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
