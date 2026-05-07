import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { NumberInput } from './number-input'

describe('NumberInput', () => {
  it('renders decrement and increment buttons', () => {
    render(<NumberInput value={5} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increment' })).toBeInTheDocument()
  })

  it('renders current value in the input', () => {
    render(<NumberInput value={42} onChange={vi.fn()} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(42)
  })

  it('calls onChange with incremented value when + clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} step={1} />)
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('calls onChange with decremented value when − clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} step={1} />)
    await user.click(screen.getByRole('button', { name: 'Decrement' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('respects custom step', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberInput value={0} onChange={onChange} step={5} />)
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('disables decrement at min boundary', () => {
    render(<NumberInput value={0} onChange={vi.fn()} min={0} />)
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled()
  })

  it('disables increment at max boundary', () => {
    render(<NumberInput value={10} onChange={vi.fn()} max={10} />)
    expect(screen.getByRole('button', { name: 'Increment' })).toBeDisabled()
  })

  it('clamps decrement to min', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberInput value={1} onChange={onChange} min={0} step={5} />)
    await user.click(screen.getByRole('button', { name: 'Decrement' }))
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('clamps increment to max', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberInput value={9} onChange={onChange} max={10} step={5} />)
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('calls onChange when input value changes to valid number', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberInput value={0} onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '7')
    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('does not call onChange when input value is not a valid number', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    const callsAfterClear = onChange.mock.calls.length
    expect(onChange).toHaveBeenCalledTimes(callsAfterClear)
  })

  it('disables all controls when disabled prop is true', () => {
    render(<NumberInput value={5} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Increment' })).toBeDisabled()
    expect(screen.getByRole('spinbutton')).toBeDisabled()
  })

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<NumberInput value={3} onChange={vi.fn()} ref={ref} />)
    expect(ref.current?.tagName).toBe('INPUT')
  })

  it('merges custom className on the wrapper', () => {
    const { container } = render(<NumberInput value={0} onChange={vi.fn()} className="w-32" />)
    expect((container.firstChild as HTMLElement).className).toContain('w-32')
  })
})
