import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SmellFlow from '../SmellFlow'

beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); vi.setSystemTime(new Date(2024, 2, 14)) })
afterEach(() => { vi.useRealTimers() })

const base = {
  ssr: true, setSsr: vi.fn(),
  ssf: false, setSsf: vi.fn(),
  stl: 'Det er helt greit.',
  sm: { trigger: '', feeling: '', what: '', cost: '' },
  setSm: vi.fn(),
  tR: 5, ms: 250,
  addSmell: vi.fn().mockResolvedValue(true),
}

function setup(overrides = {}) {
  return render(<SmellFlow {...base} {...overrides} />)
}

describe('SmellFlow – support screen', () => {
  it('shows supportive message', () => {
    setup()
    expect(screen.getByText('Det er helt greit.')).toBeInTheDocument()
  })

  it('shows resist count and money info when resists > 0', () => {
    setup()
    expect(screen.getByText(/motstått 5 fristelser/)).toBeInTheDocument()
  })

  it('shows fallback text when no resists', () => {
    setup({ tR: 0 })
    expect(screen.getByText('Alle starter et sted.')).toBeInTheDocument()
  })

  it('"Ja, skriv memo" opens memo form', () => {
    setup()
    fireEvent.click(screen.getByText('Ja, skriv memo'))
    expect(base.setSsf).toHaveBeenCalledWith(true)
  })

  it('"Hopp over" saves empty smell and closes', async () => {
    const addSmell = vi.fn().mockResolvedValue(true)
    const setSsr = vi.fn()
    setup({ addSmell, setSsr })
    fireEvent.click(screen.getByText('Hopp over'))
    await waitFor(() => expect(addSmell).toHaveBeenCalledWith(
      { trigger: '', feeling: '', what: '', cost: 0 },
      '2024-03-14'
    ))
    await waitFor(() => expect(setSsr).toHaveBeenCalledWith(false))
  })
})

describe('SmellFlow – memo form', () => {
  it('renders all input fields', () => {
    setup({ ssf: true })
    expect(screen.getByPlaceholderText(/gikk forbi bakeriet/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/stresset, lei meg/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Kvikk Lunsj/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('F.eks. 65')).toBeInTheDocument()
  })

  it('has date picker showing "I dag" by default', () => {
    setup({ ssf: true })
    // The date button shows "I dag"
    const dateButtons = screen.getAllByText('I dag')
    expect(dateButtons.length).toBeGreaterThan(0)
  })

  it('date picker opens and shows last 7 days', () => {
    const { container } = setup({ ssf: true })
    // Click the date button (which shows "I dag")
    const dateButtons = screen.getAllByText('I dag')
    fireEvent.click(dateButtons[0])
    // Now the dropdown should show
    expect(screen.getByText('I går')).toBeInTheDocument()
    expect(screen.getByText('2 dager siden')).toBeInTheDocument()
  })

  it('"Lagre memo" calls addSmell with current sm and date', async () => {
    const addSmell = vi.fn().mockResolvedValue(true)
    const setSm = vi.fn()
    setup({
      ssf: true, addSmell, setSm,
      sm: { trigger: 'Sulten', feeling: 'Lei', what: 'Kake', cost: '50' },
    })
    fireEvent.click(screen.getByText('Lagre memo'))
    await waitFor(() => expect(addSmell).toHaveBeenCalledWith(
      { trigger: 'Sulten', feeling: 'Lei', what: 'Kake', cost: '50' },
      '2024-03-14'
    ))
  })

  it('"Lukk" closes without saving', () => {
    const addSmell = vi.fn()
    setup({ ssf: true, addSmell })
    fireEvent.click(screen.getByText('Lukk'))
    expect(addSmell).not.toHaveBeenCalled()
    expect(base.setSsf).toHaveBeenCalledWith(false)
    expect(base.setSsr).toHaveBeenCalledWith(false)
  })
})
