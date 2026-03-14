import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ResistFlow from '../ResistFlow'

beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); vi.setSystemTime(new Date(2024, 2, 14)) })
afterEach(() => { vi.useRealTimers() })

const triggers = [
  { id: 'unique', label: 'Unik mulighet', icon: 'sparkle' },
  { id: 'errand', label: 'Snike meg til på ærend', icon: 'bag' },
]

const base = {
  rs: 'trigger', setRs: vi.fn(),
  st2: null, setSt2: vi.fn(),
  cf: false, setCf: vi.fn(),
  rq2: '', setRq2: vi.fn(),
  lq: '', setLq: vi.fn(),
  triggers,
  goals: { goals: ['weight'], whys: ['self'] },
  addResist: vi.fn().mockResolvedValue(true),
  curS: 5, ms: 250, nm: { a: 500, l: 'En god flaske vin' }, mp: 50,
  err: '', setErr: vi.fn(),
  onClose: vi.fn(),
}

function setup(overrides = {}) {
  return render(<ResistFlow {...base} {...overrides} />)
}

describe('ResistFlow – trigger selection', () => {
  it('renders trigger buttons', () => {
    setup()
    expect(screen.getByText('Unik mulighet')).toBeInTheDocument()
    expect(screen.getByText('Snike meg til på ærend')).toBeInTheDocument()
  })

  it('shows "Bra jobba!" heading', () => {
    setup()
    expect(screen.getByText('Bra jobba!')).toBeInTheDocument()
  })

  it('has disabled-looking "Registrer" when no trigger selected', () => {
    setup()
    const btn = screen.getByText('Registrer')
    // Button has opacity 0.4 when st2 is null (visual disable)
    expect(btn.style.opacity).toBe('0.4')
  })

  it('clicking trigger calls setSt2', () => {
    setup()
    fireEvent.click(screen.getByText('Unik mulighet'))
    expect(base.setSt2).toHaveBeenCalledWith('unique')
  })

  it('"Registrer" with trigger selected calls addResist', async () => {
    const addResist = vi.fn().mockResolvedValue(true)
    setup({ st2: 'unique', addResist })
    fireEvent.click(screen.getByText('Registrer'))
    await waitFor(() => expect(addResist).toHaveBeenCalledWith('unique', '', '2024-03-14'))
  })

  it('shows date picker for past 7 days', () => {
    setup()
    // Click the date button
    const dateBtn = screen.getByText(/I dag/)
    fireEvent.click(dateBtn)
    expect(screen.getByText('I går')).toBeInTheDocument()
  })

  it('"Lukk" calls onClose', () => {
    setup()
    fireEvent.click(screen.getByText('Lukk'))
    expect(base.onClose).toHaveBeenCalled()
  })

  it('situation note textarea exists', () => {
    setup()
    expect(screen.getByPlaceholderText(/Fortell kjapt/)).toBeInTheDocument()
  })
})

describe('ResistFlow – reward screen', () => {
  it('shows streak and saved money', () => {
    setup({ rs: 'reward', rq2: 'Du er sterk!' })
    expect(screen.getByText('5')).toBeInTheDocument() // streak
    expect(screen.getByText(/250/)).toBeInTheDocument() // money
    expect(screen.getByText(/"Du er sterk!"/)).toBeInTheDocument()
  })

  it('shows next milestone', () => {
    setup({ rs: 'reward' })
    expect(screen.getByText(/En god flaske vin/)).toBeInTheDocument()
  })

  it('"Tilbake" calls onClose', () => {
    setup({ rs: 'reward' })
    fireEvent.click(screen.getByText('Tilbake'))
    expect(base.onClose).toHaveBeenCalled()
  })
})
