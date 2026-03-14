import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Stats from '../Stats'

const triggers = [
  { id: 'unique', label: 'Unik mulighet', icon: 'sparkle', rc: 5, sc: 1 },
  { id: 'errand', label: 'Snike meg til', icon: 'bag', rc: 3, sc: 2 },
]

const weekData = [
  { day: 'Ma', date: '2024-03-11', hasResist: true, hasCheckin: false, hasSmell: false, isToday: false, isFuture: false },
  { day: 'Ti', date: '2024-03-12', hasResist: false, hasCheckin: true, hasSmell: false, isToday: false, isFuture: false },
  { day: 'On', date: '2024-03-13', hasResist: false, hasCheckin: false, hasSmell: true, isToday: false, isFuture: false },
  { day: 'To', date: '2024-03-14', hasResist: true, hasCheckin: false, hasSmell: false, isToday: true, isFuture: false },
  { day: 'Fr', date: '2024-03-15', hasResist: false, hasCheckin: false, hasSmell: false, isToday: false, isFuture: true },
  { day: 'Lø', date: '2024-03-16', hasResist: false, hasCheckin: false, hasSmell: false, isToday: false, isFuture: true },
  { day: 'Sø', date: '2024-03-17', hasResist: false, hasCheckin: false, hasSmell: false, isToday: false, isFuture: true },
]

const milestones = [
  { a: 500, l: 'En god flaske vin' },
  { a: 1000, l: 'God middag' },
]

const base = {
  curS: 5, besS: 10, tR: 8, tS: 3, ms: 400,
  smellCost: 50, milestones, tc: triggers, weekData,
  sc: 'stats', setScreen: vi.fn(),
}

function setup(overrides = {}) {
  return render(<Stats {...base} {...overrides} />)
}

describe('Stats – basic rendering', () => {
  it('shows page title', () => {
    setup()
    // "Statistikk" appears both in heading and TabBar, so use getAllByText
    const els = screen.getAllByText('Statistikk')
    expect(els.length).toBeGreaterThanOrEqual(1)
  })

  it('shows streak, best, resists and smells', () => {
    setup()
    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('Beste')).toBeInTheDocument()
    expect(screen.getByText('Motstått')).toBeInTheDocument()
    expect(screen.getByText('Smell')).toBeInTheDocument()
  })

  it('shows money saved amount', () => {
    setup()
    expect(screen.getByText('Penger spart')).toBeInTheDocument()
    expect(screen.getByText(/400/)).toBeInTheDocument()
  })

  it('shows formula: resists × smellCost', () => {
    setup()
    expect(screen.getByText('8 x 50 kr')).toBeInTheDocument()
  })
})

describe('Stats – milestones', () => {
  it('shows milestone labels', () => {
    setup()
    expect(screen.getByText('En god flaske vin')).toBeInTheDocument()
    expect(screen.getByText('God middag')).toBeInTheDocument()
  })
})

describe('Stats – streak badge', () => {
  it('shows "Ny start" when streak is 0', () => {
    setup({ curS: 0 })
    expect(screen.getByText('Ny start')).toBeInTheDocument()
    expect(screen.getByText('En ny start')).toBeInTheDocument()
  })

  it('shows level label when streak > 0', () => {
    setup({ curS: 5 })
    expect(screen.getByText('Nivå 1')).toBeInTheDocument()
  })

  it('shows Nivå 2 when streak >= 7', () => {
    setup({ curS: 15 })
    expect(screen.getByText('Nivå 2')).toBeInTheDocument()
  })

  it('shows "Du er på høyeste nivå!" at level 4', () => {
    setup({ curS: 100 })
    expect(screen.getByText('Du er på høyeste nivå!')).toBeInTheDocument()
  })
})

describe('Stats – week overview', () => {
  it('shows weekday labels', () => {
    setup()
    expect(screen.getByText('Ma')).toBeInTheDocument()
    expect(screen.getByText('Ti')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })
})

describe('Stats – trigger breakdown', () => {
  it('shows trigger labels', () => {
    setup()
    expect(screen.getByText('Triggere')).toBeInTheDocument()
    expect(screen.getByText('Unik mulighet')).toBeInTheDocument()
    expect(screen.getByText('Snike meg til')).toBeInTheDocument()
  })
})
