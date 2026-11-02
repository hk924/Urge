import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Training from '../Training'
import WorkoutSession from '../WorkoutSession'
import { buildPlan } from '../../constants/program'

function mkTraining(over = {}) {
  return {
    sessions: [], sets: [], loaded: true,
    startSession: vi.fn(), logSet: vi.fn(), deleteSet: vi.fn(), setEffort: vi.fn().mockResolvedValue(true),
    finishSession: vi.fn().mockResolvedValue(true), deleteSession: vi.fn().mockResolvedValue(true),
    ...over,
  }
}

describe('Training tab', () => {
  it('suggests Økt A first and starts it', () => {
    const onStart = vi.fn()
    render(<Training training={mkTraining()} onStart={onStart} onResume={vi.fn()} sc="training" setScreen={vi.fn()} />)
    expect(screen.getByText('Bein og skyv')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Start Økt A'))
    expect(onStart).toHaveBeenCalledWith('A', 0, expect.objectContaining({ main: expect.any(Array) }))
  })

  it('suggests Økt B after a finished A', () => {
    const t = mkTraining({ sessions: [{ id: 's1', routine: 'A', date: '2026-11-01', started_at: '2026-11-01T10:00', finished_at: '2026-11-01T10:30' }] })
    render(<Training training={t} onStart={vi.fn()} onResume={vi.fn()} sc="training" setScreen={vi.fn()} />)
    expect(screen.getByText('Start Økt B')).toBeInTheDocument()
  })

  it('offers to resume an unfinished session', () => {
    const onResume = vi.fn()
    const active = { id: 's1', routine: 'A', date: '2026-11-01', started_at: '2026-11-01T10:00', finished_at: null }
    render(<Training training={mkTraining({ sessions: [active] })} onStart={vi.fn()} onResume={onResume} sc="training" setScreen={vi.fn()} />)
    fireEvent.click(screen.getByText('Fortsett økta'))
    expect(onResume).toHaveBeenCalledWith(active)
  })

  it('shows exercise progress view', () => {
    render(<Training training={mkTraining()} onStart={vi.fn()} onResume={vi.fn()} sc="training" setScreen={vi.fn()} />)
    fireEvent.click(screen.getAllByText('Goblet squat').at(-1))
    expect(screen.getByText('← Tilbake')).toBeInTheDocument()
    expect(screen.getByText('Fremgang')).toBeInTheDocument()
  })
})

describe('WorkoutSession', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const session = { id: 'w1', routine: 'A', block: 0, plan: buildPlan('A', 0, 0), date: '2026-11-02', started_at: new Date().toISOString(), finished_at: null }

  it('starts with warm-up and can skip to main part', () => {
    render(<WorkoutSession session={session} training={mkTraining({ sessions: [session] })} onExit={vi.fn()} />)
    expect(screen.getByText('Marsj på stedet')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Hopp over oppvarmingen'))
    expect(screen.getByText('Goblet squat')).toBeInTheDocument()
    expect(screen.getByText('Første gang')).toBeInTheDocument()
  })

  it('logs a set with the suggested weight and reps', async () => {
    const logSet = vi.fn().mockResolvedValue({ id: 'x1', session_id: 'w1', exercise_id: 'goblet-squat', set_no: 1, reps: 8, weight_kg: 6 })
    render(<WorkoutSession session={session} training={mkTraining({ sessions: [session], logSet })} onExit={vi.fn()} />)
    fireEvent.click(screen.getByText('Hopp over oppvarmingen'))
    await act(async () => { fireEvent.click(screen.getByText('Logg sett 1')) })
    expect(logSet).toHaveBeenCalledWith('w1', 'goblet-squat', 1, { reps: 8, weight_kg: 6 })
    expect(screen.getByText('Pause')).toBeInTheDocument()
  })

  it('shows last time and a progression suggestion', () => {
    const prev = { id: 'p1', routine: 'A', date: '2026-10-30', started_at: '2026-10-30T10:00', finished_at: '2026-10-30T10:30' }
    const sets = [1, 2, 3].map(n => ({ id: 'ps' + n, session_id: 'p1', exercise_id: 'goblet-squat', set_no: n, reps: 12, weight_kg: 6, effort: 'passe' }))
    render(<WorkoutSession session={session} training={mkTraining({ sessions: [session, prev], sets })} onExit={vi.fn()} />)
    fireEvent.click(screen.getByText('Hopp over oppvarmingen'))
    expect(screen.getByText('3 × 12/12/12 · 6 kg')).toBeInTheDocument()
    expect(screen.getByText(/\+2 kg! Du klarte 12/)).toBeInTheDocument()
  })

  it('resume skips exercises that are already done', () => {
    const sets = [1, 2, 3].map(n => ({ id: 's' + n, session_id: 'w1', exercise_id: 'goblet-squat', set_no: n, reps: 8, weight_kg: 6 }))
    render(<WorkoutSession session={session} training={mkTraining({ sessions: [session], sets })} onExit={vi.fn()} />)
    expect(screen.getByText('Gulvpress')).toBeInTheDocument()
  })

  it('asks for effort after the last set, saves it and moves on', async () => {
    const sets = [1, 2].map(n => ({ id: 's' + n, session_id: 'w1', exercise_id: 'goblet-squat', set_no: n, reps: 8, weight_kg: 6 }))
    const setEffort = vi.fn().mockResolvedValue(true)
    const t = mkTraining({ sessions: [session], sets, setEffort })
    t.logSet = vi.fn(async () => { const x = { id: 's3', session_id: 'w1', exercise_id: 'goblet-squat', set_no: 3, reps: 8, weight_kg: 6 }; t.sets = [...t.sets, x]; return x })
    const { rerender } = render(<WorkoutSession session={session} training={t} onExit={vi.fn()} />)
    await act(async () => { fireEvent.click(screen.getByText('Logg sett 3')) })
    rerender(<WorkoutSession session={session} training={{ ...t }} onExit={vi.fn()} />)
    expect(screen.getByText('Hvordan kjentes det?')).toBeInTheDocument()
    await act(async () => { fireEvent.click(screen.getByText('Passe')) })
    expect(setEffort).toHaveBeenCalledWith('w1', 'goblet-squat', 'passe')
    expect(screen.getByText('Gulvpress')).toBeInTheDocument()
  })
})
