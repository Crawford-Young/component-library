import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TimeInput } from './time-input'

function setup(value: string, onChange = vi.fn()) {
  render(<TimeInput value={value} onChange={onChange} label="Start" id="test-time" />)
  return { onChange }
}

describe('TimeInput', () => {
  // --- parsing ---

  it('parses midnight (00:00) as 12:00 AM', () => {
    setup('00:00')
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '12',
    )
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('00')
    expect(screen.getByRole('button', { name: 'AM' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'PM' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('parses noon (12:00) as 12:00 PM', () => {
    setup('12:00')
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '12',
    )
    expect(screen.getByRole('button', { name: 'PM' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('parses 09:30 as 9:30 AM', () => {
    setup('09:30')
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '9',
    )
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('30')
    expect(screen.getByRole('button', { name: 'AM' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('parses 13:45 as 1:45 PM', () => {
    setup('13:45')
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '1',
    )
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('45')
    expect(screen.getByRole('button', { name: 'PM' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('parses 23:59 as 11:59 PM', () => {
    setup('23:59')
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '11',
    )
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('59')
    expect(screen.getByRole('button', { name: 'PM' })).toHaveAttribute('aria-pressed', 'true')
  })

  // --- hour spinner ---

  it('increment hour calls onChange with +1 hour', async () => {
    const { onChange } = setup('09:00')
    await userEvent.click(screen.getByRole('button', { name: 'Increment hour' }))
    expect(onChange).toHaveBeenCalledWith('10:00')
  })

  it('decrement hour calls onChange with -1 hour', async () => {
    const { onChange } = setup('09:00')
    await userEvent.click(screen.getByRole('button', { name: 'Decrement hour' }))
    expect(onChange).toHaveBeenCalledWith('08:00')
  })

  it('hour wraps from 12 to 1 on increment', async () => {
    const { onChange } = setup('12:00')
    await userEvent.click(screen.getByRole('button', { name: 'Increment hour' }))
    expect(onChange).toHaveBeenCalledWith('13:00')
  })

  it('hour wraps from 1 to 12 on decrement', async () => {
    const { onChange } = setup('01:00')
    await userEvent.click(screen.getByRole('button', { name: 'Decrement hour' }))
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  it('typing a valid hour calls onChange with new 24h string', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '11' } })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.blur(hourInput)
    expect(onChange).toHaveBeenCalledWith('11:00')
  })

  // --- minute spinner ---

  it('increment minute calls onChange with +1 minute', async () => {
    const { onChange } = setup('09:00')
    await userEvent.click(screen.getByRole('button', { name: 'Increment minute' }))
    expect(onChange).toHaveBeenCalledWith('09:01')
  })

  it('decrement minute calls onChange with -1 minute', async () => {
    const { onChange } = setup('09:30')
    await userEvent.click(screen.getByRole('button', { name: 'Decrement minute' }))
    expect(onChange).toHaveBeenCalledWith('09:29')
  })

  it('minute wraps from 59 to 0 on increment', async () => {
    const { onChange } = setup('09:59')
    await userEvent.click(screen.getByRole('button', { name: 'Increment minute' }))
    expect(onChange).toHaveBeenCalledWith('09:00')
  })

  it('minute wraps from 0 to 59 on decrement', async () => {
    const { onChange } = setup('09:00')
    await userEvent.click(screen.getByRole('button', { name: 'Decrement minute' }))
    expect(onChange).toHaveBeenCalledWith('09:59')
  })

  it('typing a valid minute calls onChange with new 24h string', () => {
    const { onChange } = setup('09:00')
    const minInput = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.change(minInput, { target: { value: '45' } })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.blur(minInput)
    expect(onChange).toHaveBeenCalledWith('09:45')
  })

  // --- AM/PM ---

  it('clicking PM when AM converts to PM', async () => {
    const { onChange } = setup('09:00')
    await userEvent.click(screen.getByRole('button', { name: 'PM' }))
    expect(onChange).toHaveBeenCalledWith('21:00')
  })

  it('clicking AM when PM converts to AM', async () => {
    const { onChange } = setup('21:00')
    await userEvent.click(screen.getByRole('button', { name: 'AM' }))
    expect(onChange).toHaveBeenCalledWith('09:00')
  })

  it('12:00 AM → click PM → 12:00 (noon)', async () => {
    const { onChange } = setup('00:00')
    await userEvent.click(screen.getByRole('button', { name: 'PM' }))
    expect(onChange).toHaveBeenCalledWith('12:00')
  })

  it('12:00 PM → click AM → 00:00 (midnight)', async () => {
    const { onChange } = setup('12:00')
    await userEvent.click(screen.getByRole('button', { name: 'AM' }))
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  // --- disabled ---

  it('disabled state disables all buttons and inputs', () => {
    render(<TimeInput value="09:00" onChange={vi.fn()} disabled />)
    screen.getAllByRole('button').forEach((btn) => expect(btn).toBeDisabled())
    screen.getAllByRole('spinbutton').forEach((inp) => expect(inp).toBeDisabled())
  })

  // --- id + label props ---

  it('id prop is applied to hour input', () => {
    render(<TimeInput value="09:00" onChange={vi.fn()} id="my-time" label="Start" />)
    expect(document.getElementById('my-time')).not.toBeNull()
    expect(document.getElementById('my-time')).toHaveAttribute('type', 'text')
  })

  it('label prop prefixes aria-labels on spinbuttons', () => {
    render(<TimeInput value="09:00" onChange={vi.fn()} label="End" />)
    expect(screen.getByRole('spinbutton', { name: 'End hour' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'End minute' })).toBeInTheDocument()
  })

  it('renders fallback aria-labels when no label prop', () => {
    render(<TimeInput value="09:00" onChange={vi.fn()} />)
    expect(screen.getByRole('spinbutton', { name: 'Hour' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Minute' })).toBeInTheDocument()
  })

  // --- minute 2-digit display ---

  it('minute displays with leading zero (09:05 shows 05)', () => {
    setup('09:05')
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('05')
  })

  it('minute displays 00 for zero minutes', () => {
    setup('09:00')
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('00')
  })

  // --- wheel scroll ---

  it('wheel up on hour increments hour and prevents page scroll', () => {
    const { onChange } = setup('09:00')
    const spy = vi.spyOn(Event.prototype, 'preventDefault')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('10:00')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('wheel down on hour decrements hour', () => {
    const { onChange } = setup('09:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('08:00')
  })

  it('wheel up on minute increments minute and prevents page scroll', () => {
    const { onChange } = setup('09:00')
    const spy = vi.spyOn(Event.prototype, 'preventDefault')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start minute' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('09:01')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('wheel down on minute decrements minute', () => {
    const { onChange } = setup('09:30')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start minute' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('09:29')
  })

  it('wheel up on hour wraps 12 → 1', () => {
    const { onChange } = setup('12:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('13:00')
  })

  it('wheel down on hour wraps 1 → 12', () => {
    const { onChange } = setup('01:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  it('wheel up on minute wraps 59 → 0', () => {
    const { onChange } = setup('09:59')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start minute' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('09:00')
  })

  it('wheel down on minute wraps 0 → 59', () => {
    const { onChange } = setup('09:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start minute' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('09:59')
  })

  // --- 24h mode ---

  it('24h: parses 00:00 as hour 00', () => {
    render(<TimeInput value="00:00" onChange={vi.fn()} label="Start" use24h />)
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '00',
    )
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('00')
  })

  it('24h: parses 13:45 as hour 13, minute 45', () => {
    render(<TimeInput value="13:45" onChange={vi.fn()} label="Start" use24h />)
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '13',
    )
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('45')
  })

  it('24h: parses 23:59 as hour 23', () => {
    render(<TimeInput value="23:59" onChange={vi.fn()} label="Start" use24h />)
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '23',
    )
  })

  it('24h: no AM/PM buttons rendered', () => {
    render(<TimeInput value="09:00" onChange={vi.fn()} use24h />)
    expect(screen.queryByRole('button', { name: 'AM' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'PM' })).toBeNull()
  })

  it('24h: increment hour emits padded string', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Increment hour' }))
    expect(onChange).toHaveBeenCalledWith('10:00')
  })

  it('24h: decrement hour emits padded string', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="13:30" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Decrement hour' }))
    expect(onChange).toHaveBeenCalledWith('12:30')
  })

  it('24h: increment hour wraps 23 → 00', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="23:00" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Increment hour' }))
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  it('24h: decrement hour wraps 00 → 23', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="00:00" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Decrement hour' }))
    expect(onChange).toHaveBeenCalledWith('23:00')
  })

  it('24h: wheel up on hour increments', () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('10:00')
  })

  it('24h: wheel down on hour decrements', () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('08:00')
  })

  it('24h: wheel up on hour wraps 23 → 00', () => {
    const onChange = vi.fn()
    render(<TimeInput value="23:00" onChange={onChange} label="Start" use24h />)
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  it('24h: wheel down on hour wraps 00 → 23', () => {
    const onChange = vi.fn()
    render(<TimeInput value="00:00" onChange={onChange} label="Start" use24h />)
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('23:00')
  })

  it('24h: typing a valid hour emits correct string on blur', () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '21' } })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.blur(hourInput)
    expect(onChange).toHaveBeenCalledWith('21:00')
  })

  // --- edge: PM hours increment/decrement ---

  it('increment hour in PM: 11 PM → 12 AM (auto-switch PM→AM)', async () => {
    const { onChange } = setup('23:00')
    await userEvent.click(screen.getByRole('button', { name: 'Increment hour' }))
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  it('decrement hour in PM: 12 PM → 11 AM (auto-switch PM→AM)', async () => {
    const { onChange } = setup('12:00')
    await userEvent.click(screen.getByRole('button', { name: 'Decrement hour' }))
    expect(onChange).toHaveBeenCalledWith('11:00')
  })

  // --- commit on blur / 24h input in 12h mode ---

  it('typing intermediate value does not call onChange until blur', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '1' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('typing 17 in 12h mode sets 5 PM on blur', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '17' } })
    fireEvent.blur(hourInput)
    expect(onChange).toHaveBeenCalledWith('17:00')
  })

  it('typing 13 in 12h mode sets 1 PM on blur', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '13' } })
    fireEvent.blur(hourInput)
    expect(onChange).toHaveBeenCalledWith('13:00')
  })

  it('typing 0 in 12h mode sets 12 AM (midnight) on blur', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '0' } })
    fireEvent.blur(hourInput)
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  it('invalid hour reverts to previous value on blur', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: 'abc' } })
    fireEvent.blur(hourInput)
    expect(onChange).not.toHaveBeenCalled()
    expect((hourInput as HTMLInputElement).value).toBe('9')
  })

  it('typing Enter on hour commits value', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '11' } })
    fireEvent.keyDown(hourInput, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('11:00')
  })

  it('typing Enter on minute commits value', () => {
    const { onChange } = setup('09:00')
    const minInput = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.change(minInput, { target: { value: '30' } })
    fireEvent.keyDown(minInput, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('09:30')
  })

  it('invalid minute reverts to previous value on blur', () => {
    const { onChange } = setup('09:00')
    const minInput = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.change(minInput, { target: { value: '99' } })
    fireEvent.blur(minInput)
    expect(onChange).not.toHaveBeenCalled()
    expect((minInput as HTMLInputElement).value).toBe('00')
  })

  // --- focus handlers ---

  it('focusing hour input does not call onChange', () => {
    const { onChange } = setup('09:00')
    fireEvent.focus(screen.getByRole('spinbutton', { name: 'Start hour' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('focusing minute input does not call onChange', () => {
    const { onChange } = setup('09:00')
    fireEvent.focus(screen.getByRole('spinbutton', { name: 'Start minute' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not sync hour display while hour input is focused on prop update', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <TimeInput value="09:00" onChange={onChange} label="Start" id="test-time" />,
    )
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.focus(hourInput)
    rerender(<TimeInput value="10:00" onChange={onChange} label="Start" id="test-time" />)
    expect((hourInput as HTMLInputElement).value).toBe('9')
  })

  it('does not sync minute display while minute input is focused on prop update', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <TimeInput value="09:00" onChange={onChange} label="Start" id="test-time" />,
    )
    const minInput = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.focus(minInput)
    rerender(<TimeInput value="09:30" onChange={onChange} label="Start" id="test-time" />)
    expect((minInput as HTMLInputElement).value).toBe('00')
  })

  it('non-Enter keydown on hour input does not commit', () => {
    const { onChange } = setup('09:00')
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: '11' } })
    fireEvent.keyDown(hourInput, { key: 'Tab' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('non-Enter keydown on minute input does not commit', () => {
    const { onChange } = setup('09:00')
    const minInput = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.change(minInput, { target: { value: '30' } })
    fireEvent.keyDown(minInput, { key: 'Tab' })
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- 24h minute increment ---

  it('24h: increment minute emits padded string', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Increment minute' }))
    expect(onChange).toHaveBeenCalledWith('09:01')
  })

  it('24h: increment minute wraps 59 → 00', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:59" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Increment minute' }))
    expect(onChange).toHaveBeenCalledWith('09:00')
  })

  it('24h: decrement minute emits padded string', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:30" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Decrement minute' }))
    expect(onChange).toHaveBeenCalledWith('09:29')
  })

  it('24h: decrement minute wraps 0 → 59', async () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    await userEvent.click(screen.getByRole('button', { name: 'Decrement minute' }))
    expect(onChange).toHaveBeenCalledWith('09:59')
  })

  it('24h: wheel up on minute increments', () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start minute' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('09:01')
  })

  it('24h: invalid hour reverts to padded value on blur', () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    const hourInput = screen.getByRole('spinbutton', { name: 'Start hour' })
    fireEvent.change(hourInput, { target: { value: 'abc' } })
    fireEvent.blur(hourInput)
    expect(onChange).not.toHaveBeenCalled()
    expect((hourInput as HTMLInputElement).value).toBe('09')
  })

  it('24h: typing a valid minute emits correct string on blur', () => {
    const onChange = vi.fn()
    render(<TimeInput value="09:00" onChange={onChange} label="Start" use24h />)
    const minInput = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.change(minInput, { target: { value: '45' } })
    fireEvent.blur(minInput)
    expect(onChange).toHaveBeenCalledWith('09:45')
  })

  // --- AM/PM auto-switch ---

  it('increment hour: 11 AM → 12 PM (auto-switch AM→PM)', async () => {
    const { onChange } = setup('11:00')
    await userEvent.click(screen.getByRole('button', { name: 'Increment hour' }))
    expect(onChange).toHaveBeenCalledWith('12:00')
  })

  it('decrement hour: 12 AM → 11 PM (auto-switch AM→PM)', async () => {
    const { onChange } = setup('00:00')
    await userEvent.click(screen.getByRole('button', { name: 'Decrement hour' }))
    expect(onChange).toHaveBeenCalledWith('23:00')
  })

  it('wheel up: 11 AM → 12 PM (auto-switch AM→PM)', () => {
    const { onChange } = setup('11:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('12:00')
  })

  it('wheel down: 12 PM → 11 AM (auto-switch PM→AM)', () => {
    const { onChange } = setup('12:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('11:00')
  })

  it('wheel up: 11 PM → 12 AM (auto-switch PM→AM)', () => {
    const { onChange } = setup('23:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: -1 })
    expect(onChange).toHaveBeenCalledWith('00:00')
  })

  it('wheel down: 12 AM → 11 PM (auto-switch AM→PM)', () => {
    const { onChange } = setup('00:00')
    fireEvent.wheel(screen.getByRole('spinbutton', { name: 'Start hour' }), { deltaY: 1 })
    expect(onChange).toHaveBeenCalledWith('23:00')
  })
})
