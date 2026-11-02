import { describe, it, expect } from 'vitest'
import { suggest, lastPerformance, personalRecord, isNewRecord, exerciseHistory, formatSets } from './progression'
import { buildPlan, nextRoutine, getBlock, getBlockWeek, ROUTINES } from '../constants/program'
import { EXERCISE_BY_ID, EXERCISES } from '../constants/exercises'

const W = { id: 'w', kind: 'weight', inc: 1, start: 4, repMin: 8, repMax: 12 }
const R = { id: 'r', kind: 'reps', repMin: 6, repMax: 15 }
const T = { id: 't', kind: 'time', seconds: 20 }
const last = (sets, effort = 'passe') => ({ sets, effort })

describe('suggest (weight)', () => {
  it('starts light with no history', () => {
    expect(suggest(W, null)).toMatchObject({ weight: 4, reps: 8 })
  })
  it('adds a rep when not all sets reached repMax', () => {
    expect(suggest(W, last([{ reps: 10, weight_kg: 5 }, { reps: 9, weight_kg: 5 }]))).toMatchObject({ weight: 5, reps: 10 })
  })
  it('adds weight and resets reps when all sets hit repMax', () => {
    expect(suggest(W, last([{ reps: 12, weight_kg: 5 }, { reps: 12, weight_kg: 5 }]))).toMatchObject({ weight: 6, reps: 8 })
  })
  it('holds when it felt heavy', () => {
    expect(suggest(W, last([{ reps: 12, weight_kg: 5 }, { reps: 12, weight_kg: 5 }], 'tungt'))).toMatchObject({ weight: 5, reps: 12 })
  })
  it('drops weight when heavy and below rep range', () => {
    expect(suggest(W, last([{ reps: 6, weight_kg: 5 }], 'tungt'))).toMatchObject({ weight: 4, reps: 8 })
  })
  it('never suggests below 1 kg', () => {
    expect(suggest(W, last([{ reps: 5, weight_kg: 1 }], 'tungt')).weight).toBe(1)
  })
  it('handles numeric strings from the database', () => {
    expect(suggest(W, last([{ reps: 12, weight_kg: '5.5' }])).weight).toBe(6.5)
  })
})

describe('suggest (reps/time)', () => {
  it('bodyweight reps +1', () => {
    expect(suggest(R, last([{ reps: 8 }, { reps: 7 }])).reps).toBe(8)
  })
  it('bodyweight holds when heavy', () => {
    expect(suggest(R, last([{ reps: 8 }], 'tungt')).reps).toBe(8)
  })
  it('time +5 seconds, capped at 90', () => {
    expect(suggest(T, null).seconds).toBe(20)
    expect(suggest(T, last([{ seconds: 30 }])).seconds).toBe(35)
    expect(suggest(T, last([{ seconds: 90 }])).seconds).toBe(90)
  })
})

describe('history helpers', () => {
  const sessions = [
    { id: 's1', started_at: '2026-11-01T10:00:00Z', date: '2026-11-01' },
    { id: 's2', started_at: '2026-11-03T10:00:00Z', date: '2026-11-03' },
    { id: 's3', started_at: '2026-11-05T10:00:00Z', date: '2026-11-05' },
  ]
  const sets = [
    { id: 'a', session_id: 's1', exercise_id: 'w', set_no: 1, reps: 10, weight_kg: 4 },
    { id: 'b', session_id: 's2', exercise_id: 'w', set_no: 1, reps: 12, weight_kg: 5, effort: 'lett' },
    { id: 'c', session_id: 's2', exercise_id: 'w', set_no: 2, reps: 11, weight_kg: 5, effort: 'lett' },
    { id: 'd', session_id: 's3', exercise_id: 'other', set_no: 1, reps: 10, weight_kg: 3 },
  ]

  it('finds the last session containing the exercise', () => {
    const l = lastPerformance('w', sets, sessions)
    expect(l.session.id).toBe('s2')
    expect(l.sets.map(s => s.id)).toEqual(['b', 'c'])
    expect(l.effort).toBe('lett')
  })
  it('can exclude the current session', () => {
    expect(lastPerformance('w', sets, sessions, 's2').session.id).toBe('s1')
  })
  it('returns null with no history', () => {
    expect(lastPerformance('none', sets, sessions)).toBeNull()
  })
  it('builds history oldest first', () => {
    expect(exerciseHistory(W, sets, sessions).map(h => h.v)).toEqual([4, 5])
  })
  it('finds personal record and detects new ones', () => {
    expect(personalRecord(W, sets).id).toBe('b')
    expect(isNewRecord(W, { id: 'x', reps: 8, weight_kg: 6 }, sets)).toBe(true)
    expect(isNewRecord(W, { id: 'x', reps: 12, weight_kg: 5 }, sets)).toBe(false)
  })
  it('formats sets', () => {
    expect(formatSets(W, [{ reps: 10, weight_kg: 5.5 }, { reps: 9, weight_kg: 5.5 }])).toBe('2 × 10/9 · 5,5 kg')
  })
})

describe('program', () => {
  it('every referenced exercise exists in the catalog', () => {
    const ids = new Set(EXERCISES.map(e => e.id))
    for (const r of Object.values(ROUTINES)) for (const s of r.slots) for (const v of s.variants) expect(ids.has(v)).toBe(true)
    const p = buildPlan('A', 0, 0)
    for (const id of [...p.warmup, ...p.core.map(c => c.exerciseId)]) expect(EXERCISE_BY_ID[id]).toBeTruthy()
  })
  it('main exercises are dumbbell or bodyweight only', () => {
    for (const r of Object.values(ROUTINES)) for (const s of r.slots) for (const v of s.variants)
      expect(['weight', 'reps']).toContain(EXERCISE_BY_ID[v].kind)
  })
  it('alternates A and B', () => {
    expect(nextRoutine([])).toBe('A')
    expect(nextRoutine([{ routine: 'A', finished_at: 'x', started_at: '1' }])).toBe('B')
    expect(nextRoutine([{ routine: 'A', finished_at: 'x', started_at: '1' }, { routine: 'B', finished_at: 'x', started_at: '2' }])).toBe('A')
    expect(nextRoutine([{ routine: 'A', finished_at: null, started_at: '3' }, { routine: 'B', finished_at: 'x', started_at: '2' }])).toBe('A')
  })
  it('switches block every 4 weeks', () => {
    expect(getBlock('2026-11-01', '2026-11-28')).toBe(0)
    expect(getBlock('2026-11-01', '2026-11-29')).toBe(1)
    expect(getBlock('2026-11-01', '2026-12-27')).toBe(0)
    expect(getBlockWeek('2026-11-01', '2026-11-08')).toBe(2)
  })
  it('uses block variants and rotates warm-up and core', () => {
    expect(buildPlan('A', 0, 0).main[1].exerciseId).toBe('gulvpress')
    expect(buildPlan('A', 1, 0).main[1].exerciseId).toBe('hantelpress-benk')
    expect(buildPlan('A', 0, 0).core).not.toEqual(buildPlan('A', 0, 1).core)
    expect(buildPlan('A', 0, 0).warmup[0]).toBe('marsj')
  })
})
