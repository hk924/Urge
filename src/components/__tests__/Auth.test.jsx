import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Auth from '../Auth'

function setup(overrides = {}) {
  const props = {
    authEmail: '', setAuthEmail: vi.fn(),
    authName: '', setAuthName: vi.fn(),
    authStep: 'email', setAuthStep: vi.fn(),
    otpCode: '', setOtpCode: vi.fn(),
    authMsg: '', setAuthMsg: vi.fn(),
    sendOTP: vi.fn(), verifyOTP: vi.fn(),
    ...overrides,
  }
  return { props, ...render(<Auth {...props} />) }
}

describe('Auth – email step', () => {
  it('renders name and email inputs', () => {
    setup()
    expect(screen.getByPlaceholderText('Ditt navn')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('din@epost.no')).toBeInTheDocument()
  })

  it('has disabled "Send kode" when name/email empty', () => {
    setup()
    const btn = screen.getByText('Send kode')
    expect(btn).toBeDisabled()
  })

  it('enables "Send kode" when both filled', () => {
    setup({ authEmail: 'test@test.no', authName: 'Test' })
    const btn = screen.getByText('Send kode')
    expect(btn).not.toBeDisabled()
  })

  it('calls sendOTP on click when valid', () => {
    const { props } = setup({ authEmail: 'test@test.no', authName: 'Test' })
    fireEvent.click(screen.getByText('Send kode'))
    expect(props.sendOTP).toHaveBeenCalled()
  })

  it('does not call sendOTP when email missing', () => {
    const { props } = setup({ authName: 'Test' })
    fireEvent.click(screen.getByText('Send kode'))
    expect(props.sendOTP).not.toHaveBeenCalled()
  })

  it('shows error message when authMsg set', () => {
    setup({ authMsg: 'Noe gikk galt' })
    expect(screen.getByText('Noe gikk galt')).toBeInTheDocument()
  })
})

describe('Auth – OTP step', () => {
  it('renders OTP input and shows email', () => {
    setup({ authStep: 'otp', authEmail: 'test@test.no' })
    expect(screen.getByText('Skriv inn koden')).toBeInTheDocument()
    expect(screen.getByText('test@test.no')).toBeInTheDocument()
  })

  it('has disabled "Bekreft" when OTP < 6 digits', () => {
    setup({ authStep: 'otp', otpCode: '123' })
    expect(screen.getByText('Bekreft')).toBeDisabled()
  })

  it('enables "Bekreft" when OTP is 6 digits', () => {
    setup({ authStep: 'otp', otpCode: '123456' })
    expect(screen.getByText('Bekreft')).not.toBeDisabled()
  })

  it('calls verifyOTP on valid 6-digit code', () => {
    const { props } = setup({ authStep: 'otp', otpCode: '123456' })
    fireEvent.click(screen.getByText('Bekreft'))
    expect(props.verifyOTP).toHaveBeenCalled()
  })

  it('filters non-numeric input from OTP', () => {
    const { props } = setup({ authStep: 'otp' })
    const input = screen.getByPlaceholderText('000000')
    fireEvent.change(input, { target: { value: 'abc123' } })
    // The onChange handler calls setOtpCode with filtered value
    expect(props.setOtpCode).toHaveBeenCalledWith('123')
  })

  it('"Tilbake" resets to email step', () => {
    const { props } = setup({ authStep: 'otp' })
    fireEvent.click(screen.getByText('Tilbake'))
    expect(props.setAuthStep).toHaveBeenCalledWith('email')
    expect(props.setOtpCode).toHaveBeenCalledWith('')
    expect(props.setAuthMsg).toHaveBeenCalledWith('')
  })

  it('"Send kode på nytt" calls sendOTP', () => {
    const { props } = setup({ authStep: 'otp' })
    fireEvent.click(screen.getByText('Send kode på nytt'))
    expect(props.sendOTP).toHaveBeenCalled()
  })
})

describe('Auth – loading step', () => {
  it('shows "Vennligst vent..."', () => {
    setup({ authStep: 'loading' })
    expect(screen.getByText('Vennligst vent...')).toBeInTheDocument()
  })
})
