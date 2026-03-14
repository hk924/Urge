import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../Home'

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2024, 2, 14)) })
afterEach(() => { vi.useRealTimers() })

function setup(overrides = {}) {
  const props = {
    user: { email: 'test@test.no', user_metadata: { name: 'Hallgeir' } },
    goals: { goals: ['weight'], whys: ['self'] },
    curS: 5, besS: 10, ms: 500, tR: 10, tS: 2, nm: { a: 1000, l: 'God middag' }, mp: 50,
    chk: [],
    hq: 'Motivasjon her', setHq: vi.fn(),
    cd: '2024-03-14', setCd: vi.fn(),
    sdp: false, setSdp: vi.fn(),
    addCheckin: vi.fn(), delCheckin: vi.fn(),
    err: '', setErr: vi.fn(),
    setScreen: vi.fn(), sc: 'home',
    onResist: vi.fn(), onSmell: vi.fn(), onOpenSettings: vi.fn(),
    ...overrides,
  }
  return { props, ...render(<Home {...props} />) }
}

describe('Home – basic rendering', () => {
  it('shows greeting with user name', () => {
    setup()
    expect(screen.getByText(/Hei, Hallgeir/)).toBeInTheDocument()
  })

  it('shows motivational quote', () => {
    setup()
    expect(screen.getByText(/"Motivasjon her"/)).toBeInTheDocument()
  })

  it('shows streak count', () => {
    setup()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows money saved', () => {
    setup()
    expect(screen.getByText(/500/)).toBeInTheDocument()
  })

  it('shows resist and smell buttons', () => {
    setup()
    expect(screen.getByText('Jeg motstod en fristelse')).toBeInTheDocument()
    expect(screen.getByText('Jeg gikk på en smell')).toBeInTheDocument()
  })
})

describe('Home – navigation', () => {
  it('resist button calls onResist', () => {
    const { props } = setup()
    fireEvent.click(screen.getByText('Jeg motstod en fristelse'))
    expect(props.onResist).toHaveBeenCalled()
  })

  it('smell button calls onSmell', () => {
    const { props } = setup()
    fireEvent.click(screen.getByText('Jeg gikk på en smell'))
    expect(props.onSmell).toHaveBeenCalled()
  })

  it('settings gear calls onOpenSettings', () => {
    const { props, container } = setup()
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[0]) // settings button
    expect(props.onOpenSettings).toHaveBeenCalled()
  })
})

describe('Home – checkin', () => {
  it('shows mood buttons when no checkin for date', () => {
    setup()
    expect(screen.getByText('Hvordan ble dagen?')).toBeInTheDocument()
    expect(screen.getByText('En god minusdag')).toBeInTheDocument()
    expect(screen.getByText('Helt ok')).toBeInTheDocument()
    expect(screen.getByText('Gikk på smell')).toBeInTheDocument()
  })

  it('calls addCheckin when mood clicked', () => {
    const { props } = setup()
    fireEvent.click(screen.getByText('En god minusdag'))
    expect(props.addCheckin).toHaveBeenCalledWith('2024-03-14', 'En god minusdag', 'good')
  })

  it('shows checked-in state with mood and "Angre"', () => {
    setup({ chk: [{ id: 'c1', date: '2024-03-14', mood: 'En god minusdag', mood_id: 'good' }] })
    // Mood appears in the confirmed checkin display AND in the recent checkins list
    const els = screen.getAllByText('En god minusdag')
    expect(els.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Angre')).toBeInTheDocument()
    expect(screen.getByText('Sees i morgen.')).toBeInTheDocument()
  })

  it('"Angre" calls delCheckin with checkin id', () => {
    const del = vi.fn()
    setup({
      chk: [{ id: 'c1', date: '2024-03-14', mood: 'En god minusdag', mood_id: 'good' }],
      delCheckin: del,
    })
    fireEvent.click(screen.getByText('Angre'))
    expect(del).toHaveBeenCalledWith('c1')
  })
})

describe('Home – date picker', () => {
  it('toggles date dropdown', () => {
    setup({ sdp: true })
    expect(screen.getByText('I dag')).toBeInTheDocument()
    expect(screen.getByText('I går')).toBeInTheDocument()
  })
})

describe('Home – recent checkins', () => {
  it('shows last checkins in history', () => {
    setup({
      chk: [
        { id: '1', date: '2024-03-14', mood: 'Helt ok', mood_id: 'ok' },
        { id: '2', date: '2024-03-13', mood: 'En god minusdag', mood_id: 'good' },
      ],
    })
    expect(screen.getByText('Siste dager')).toBeInTheDocument()
  })
})
