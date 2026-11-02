import { describe, it, expect } from 'vitest'
import { buildSummary, stravaText, formatLongDate } from './workoutSummary'
import { buildPlan } from '../constants/program'

const prev = { id: 'p', routine: 'A', date: '2026-10-30', started_at: '2026-10-30T10:00:00Z', finished_at: '2026-10-30T10:30:00Z', plan: buildPlan('A', 0, 0) }
const cur = { id: 'c', routine: 'A', date: '2026-11-03', started_at: '2026-11-03T10:00:00Z', finished_at: '2026-11-03T10:32:00Z', plan: buildPlan('A', 0, 1) }
const sets = [
  { id: 'a1', session_id: 'p', exercise_id: 'goblet-squat', set_no: 1, reps: 10, weight_kg: 6 },
  { id: 'a2', session_id: 'p', exercise_id: 'goblet-squat', set_no: 2, reps: 10, weight_kg: 6 },
  { id: 'b1', session_id: 'c', exercise_id: 'goblet-squat', set_no: 1, reps: 10, weight_kg: 8 },
  { id: 'b2', session_id: 'c', exercise_id: 'goblet-squat', set_no: 2, reps: 9, weight_kg: 8 },
  { id: 'b3', session_id: 'c', exercise_id: 'gulvpress', set_no: 1, reps: 10, weight_kg: 4 },
]

describe('buildSummary', () => {
  const sum = buildSummary(cur, sets, [prev, cur])
  it('computes duration, sets and reps', () => {
    expect(sum.minutes).toBe(32)
    expect(sum.setCount).toBe(3)
    expect(sum.repCount).toBe(29)
    expect(sum.dateLabel).toBe('3. november 2026')
  })
  it('lists only exercises with sets, with deltas and records', () => {
    expect(sum.exercises.map(e => e.id)).toEqual(['goblet-squat', 'gulvpress'])
    expect(sum.exercises[0]).toMatchObject({ delta: '+2 kg', record: true, line: '2 × 10/9 · 8 kg' })
    expect(sum.exercises[1]).toMatchObject({ delta: null, record: false })
    expect(sum.improved).toBe(1)
  })
  it('does not compare against later sessions when viewing history', () => {
    const old = buildSummary(prev, sets, [prev, cur])
    expect(old.exercises[0].delta).toBeNull()
  })
  it('builds Strava text', () => {
    const t = stravaText(sum)
    expect(t).toContain('Økt A · Bein og skyv · 32 min · 3 sett')
    expect(t).toContain('Goblet squat: 2 × 10/9 · 8 kg (+2 kg) · ny rekord')
    expect(t).toContain('Logget med Urge')
  })
  it('formats dates', () => {
    expect(formatLongDate('2026-01-05')).toBe('5. januar 2026')
  })
})
