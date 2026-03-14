import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Log from '../Log'

const triggers = [
  { id: 'unique', label: 'Unik mulighet', icon: 'sparkle' },
  { id: 'errand', label: 'Snike meg til på ærend', icon: 'bag' },
]

const base = {
  sml: [], res: [], triggers,
  sel: null, setSel: vi.fn(),
  delResist: vi.fn().mockResolvedValue(true),
  delSmell: vi.fn().mockResolvedValue(true),
  sc: 'log', setScreen: vi.fn(),
}

function setup(overrides = {}) {
  return render(<Log {...base} {...overrides} />)
}

describe('Log – empty state', () => {
  it('shows empty message when no data', () => {
    setup()
    expect(screen.getByText('Ingen logg enda!')).toBeInTheDocument()
  })
})

describe('Log – list view', () => {
  it('shows resist and smell counts', () => {
    setup({
      res: [
        { id: 'r1', trigger_type: 'unique', date: '2024-03-14', logged_at: '2024-03-14T10:00:00' },
        { id: 'r2', trigger_type: 'unique', date: '2024-03-13', logged_at: '2024-03-13T10:00:00' },
      ],
      sml: [{ id: 's1', what: 'Kake', date: '2024-03-12', cost: 45, logged_at: '2024-03-12T10:00:00' }],
    })
    expect(screen.getByText('2')).toBeInTheDocument() // resist count (unique)
    expect(screen.getByText('Motstått')).toBeInTheDocument()
    expect(screen.getByText('Smell')).toBeInTheDocument()
  })

  it('shows resist entries with trigger label', () => {
    setup({
      res: [{ id: 'r1', trigger_type: 'unique', date: '2024-03-14', logged_at: '2024-03-14T10:00:00' }],
    })
    expect(screen.getByText('Unik mulighet')).toBeInTheDocument()
  })

  it('shows smell entries with "what" text', () => {
    setup({
      sml: [{ id: 's1', what: 'Sjokolade', trigger_text: 'Var sulten', date: '2024-03-13', cost: 30, logged_at: '2024-03-13T10:00:00' }],
    })
    expect(screen.getByText('Sjokolade')).toBeInTheDocument()
  })

  it('shows "Ingen detaljer" for smells without what', () => {
    setup({
      sml: [{ id: 's1', what: '', date: '2024-03-13', cost: 0, logged_at: '2024-03-13T10:00:00' }],
    })
    expect(screen.getByText('Ingen detaljer')).toBeInTheDocument()
  })

  it('clicking an entry calls setSel', () => {
    const setSel = vi.fn()
    setup({
      res: [{ id: 'r1', trigger_type: 'unique', date: '2024-03-14', logged_at: '2024-03-14T10:00:00' }],
      setSel,
    })
    fireEvent.click(screen.getByText('Unik mulighet'))
    expect(setSel).toHaveBeenCalled()
  })
})

describe('Log – resist detail view', () => {
  const resist = { id: 'r1', _type: 'resist', trigger_type: 'unique', date: '2024-03-14', note: 'Var fristet', logged_at: '2024-03-14T10:00:00' }

  it('shows trigger, date and note', () => {
    setup({ sel: resist })
    expect(screen.getByText('Motstått')).toBeInTheDocument()
    expect(screen.getByText('Unik mulighet')).toBeInTheDocument()
    expect(screen.getByText('Var fristet')).toBeInTheDocument()
  })

  it('two-step delete: first click shows "Bekreft sletting"', () => {
    setup({ sel: resist })
    const btn = screen.getByText('Slett')
    fireEvent.click(btn)
    expect(screen.getByText('Bekreft sletting')).toBeInTheDocument()
  })

  it('second click calls delResist and closes', async () => {
    const del = vi.fn().mockResolvedValue(true)
    const setSel = vi.fn()
    setup({ sel: resist, delResist: del, setSel })
    fireEvent.click(screen.getByText('Slett'))
    fireEvent.click(screen.getByText('Bekreft sletting'))
    await waitFor(() => expect(del).toHaveBeenCalledWith('r1'))
    await waitFor(() => expect(setSel).toHaveBeenCalledWith(null))
  })

  it('"Lukk" closes detail without deleting', () => {
    const setSel = vi.fn()
    setup({ sel: resist, setSel })
    fireEvent.click(screen.getByText('Lukk'))
    expect(setSel).toHaveBeenCalledWith(null)
  })
})

describe('Log – smell detail view', () => {
  const smell = {
    id: 's1', _type: 'smell', trigger_text: 'Var sulten', feeling: 'Stresset',
    what: 'Sjokolade', cost: 45, date: '2024-03-13', logged_at: '2024-03-13T10:00:00'
  }

  it('shows all fields when populated', () => {
    setup({ sel: smell })
    expect(screen.getByText('Smell-memo')).toBeInTheDocument()
    expect(screen.getByText('Var sulten')).toBeInTheDocument()
    expect(screen.getByText('Stresset')).toBeInTheDocument()
    expect(screen.getByText('Sjokolade')).toBeInTheDocument()
    expect(screen.getByText('45 kr')).toBeInTheDocument()
  })

  it('shows reflection text when "what" exists', () => {
    setup({ sel: smell })
    expect(screen.getByText(/Var det verdt det/)).toBeInTheDocument()
  })

  it('hides cost when cost is 0', () => {
    setup({ sel: { ...smell, cost: 0 } })
    expect(screen.queryByText(/kr$/)).not.toBeInTheDocument()
  })

  it('two-step delete works for smells', async () => {
    const del = vi.fn().mockResolvedValue(true)
    const setSel = vi.fn()
    setup({ sel: smell, delSmell: del, setSel })
    fireEvent.click(screen.getByText('Slett'))
    fireEvent.click(screen.getByText('Bekreft sletting'))
    await waitFor(() => expect(del).toHaveBeenCalledWith('s1'))
  })
})
