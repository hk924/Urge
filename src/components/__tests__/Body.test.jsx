import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Body from '../Body'

beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); vi.setSystemTime(new Date(2024, 2, 14)) })
afterEach(() => { vi.useRealTimers() })

const base = {
  wgt: [], wko: [],
  bt: 'vekt', setBt: vi.fn(),
  wf: false, setWf: vi.fn(),
  wef: false, setWef: vi.fn(),
  wi: { kg: '', fat: '', muscle: '' }, setWi: vi.fn(),
  woi: { type: '', duration: '' }, setWoi: vi.fn(),
  addWeight: vi.fn(), addWorkout: vi.fn(),
  delWeight: vi.fn().mockResolvedValue(true),
  delWorkout: vi.fn().mockResolvedValue(true),
  sc: 'body', setScreen: vi.fn(),
}

function setup(overrides = {}) {
  return render(<Body {...base} {...overrides} />)
}

describe('Body – weight tab', () => {
  it('shows "Ingen vekt logget" when empty', () => {
    setup()
    expect(screen.getByText('Ingen vekt logget')).toBeInTheDocument()
  })

  it('shows current weight when data exists', () => {
    setup({ wgt: [{ id: 'w1', kg: 85.2, date: '2024-03-14' }] })
    expect(screen.getByText('85.2')).toBeInTheDocument()
    expect(screen.getByText('kg')).toBeInTheDocument()
  })

  it('shows weight change indicator', () => {
    setup({
      wgt: [
        { id: 'w1', kg: 85, date: '2024-03-14' },
        { id: 'w2', kg: 90, date: '2024-02-14' },
      ],
    })
    // Shows ↓ 5.0 kg (first entry is latest, last is oldest, diff = oldest - latest)
    expect(screen.getByText(/5\.0 kg/)).toBeInTheDocument()
  })

  it('opens weight form when "+ Logg" clicked', () => {
    setup({ wef: true })
    expect(screen.getByPlaceholderText('Vekt (kg)')).toBeInTheDocument()
  })

  it('weight form has date picker', () => {
    setup({ wef: true })
    expect(screen.getByText('Dato')).toBeInTheDocument()
  })

  it('shows weight history list', () => {
    setup({
      wgt: [
        { id: 'w1', kg: 85, date: '2024-03-14' },
        { id: 'w2', kg: 86, date: '2024-03-13' },
      ],
    })
    expect(screen.getByText('Historikk')).toBeInTheDocument()
    expect(screen.getByText('85 kg')).toBeInTheDocument()
    expect(screen.getByText('86 kg')).toBeInTheDocument()
  })

  it('weight history delete: first click shows "Bekreft?"', () => {
    setup({
      wgt: [{ id: 'w1', kg: 85, date: '2024-03-14' }],
    })
    fireEvent.click(screen.getByText('✕'))
    expect(screen.getByText('Bekreft?')).toBeInTheDocument()
  })

  it('weight history delete: second click calls delWeight', async () => {
    const del = vi.fn().mockResolvedValue(true)
    setup({
      wgt: [{ id: 'w1', kg: 85, date: '2024-03-14' }],
      delWeight: del,
    })
    fireEvent.click(screen.getByText('✕'))
    fireEvent.click(screen.getByText('Bekreft?'))
    await waitFor(() => expect(del).toHaveBeenCalledWith('w1'))
  })
})

describe('Body – composition tab', () => {
  it('shows message when no composition data', () => {
    setup({ bt: 'comp' })
    expect(screen.getByText(/Logg vekt med fett/)).toBeInTheDocument()
  })

  it('shows composition form button', () => {
    setup({ bt: 'comp' })
    expect(screen.getByText(/Logg vekt, fett og muskelmasse/)).toBeInTheDocument()
  })

  it('comp form has all three inputs', () => {
    setup({ bt: 'comp', wef: true })
    expect(screen.getByPlaceholderText('Vekt (kg)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Fettprosent (%)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Muskelmasse (%)')).toBeInTheDocument()
  })
})

describe('Body – workout tab', () => {
  it('shows "Ingen trening logget" when empty', () => {
    setup({ bt: 'trening' })
    expect(screen.getByText('Ingen trening logget')).toBeInTheDocument()
  })

  it('shows workout type buttons when form open', () => {
    setup({ bt: 'trening', wf: true })
    expect(screen.getByText('Gåtur')).toBeInTheDocument()
    expect(screen.getByText('Styrke')).toBeInTheDocument()
    expect(screen.getByText('Løping')).toBeInTheDocument()
    expect(screen.getByText('Sykling')).toBeInTheDocument()
    expect(screen.getByText('Annet')).toBeInTheDocument()
  })

  it('workout form has duration input and date picker', () => {
    setup({ bt: 'trening', wf: true })
    expect(screen.getByPlaceholderText(/45 min/)).toBeInTheDocument()
    expect(screen.getByText('Dato')).toBeInTheDocument()
  })

  it('shows workout history list', () => {
    setup({
      bt: 'trening',
      wko: [
        { id: 'wk1', type: 'Styrke', duration: '45 min', date: '2024-03-14' },
        { id: 'wk2', type: 'Løping', duration: '30 min', date: '2024-03-13' },
      ],
    })
    expect(screen.getByText('Styrke')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('Løping')).toBeInTheDocument()
  })

  it('workout delete: two-step confirmation', async () => {
    const del = vi.fn().mockResolvedValue(true)
    setup({
      bt: 'trening',
      wko: [{ id: 'wk1', type: 'Styrke', duration: '45 min', date: '2024-03-14' }],
      delWorkout: del,
    })
    fireEvent.click(screen.getByText('✕'))
    expect(screen.getByText('Bekreft?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Bekreft?'))
    await waitFor(() => expect(del).toHaveBeenCalledWith('wk1'))
  })
})

describe('Body – tab switching', () => {
  it('calls setBt when tab clicked', () => {
    const setBt = vi.fn()
    setup({ setBt })
    fireEvent.click(screen.getByText('Trening'))
    expect(setBt).toHaveBeenCalledWith('trening')
  })
})
