import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CalendarNavBar } from './calendar-nav-bar'

const date = new Date(2026, 4, 11) // Mon May 11 2026

describe('CalendarNavBar', () => {
  it('renders Previous week button', () => {
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Previous week' })).toBeInTheDocument()
  })

  it('renders Next week button', () => {
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Next week' })).toBeInTheDocument()
  })

  it('← fires onDateChange with date − 7 days', async () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    const call = handler.mock.calls[0][0] as Date
    expect(call.toISOString().slice(0, 10)).toBe('2026-05-04')
  })

  it('→ fires onDateChange with date + 7 days', async () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    const call = handler.mock.calls[0][0] as Date
    expect(call.toISOString().slice(0, 10)).toBe('2026-05-18')
  })

  it('Day select shows current day value', () => {
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect((screen.getByLabelText('Day') as HTMLSelectElement).value).toBe('11')
  })

  it('Month select shows current month value (0-indexed)', () => {
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect((screen.getByLabelText('Month') as HTMLSelectElement).value).toBe('4')
  })

  it('Year select shows current year value', () => {
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect((screen.getByLabelText('Year') as HTMLSelectElement).value).toBe('2026')
  })

  it('Day change fires onDateChange with new date', () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '20' } })
    const call = handler.mock.calls[0][0] as Date
    expect(call.getDate()).toBe(20)
    expect(call.getMonth()).toBe(4)
    expect(call.getFullYear()).toBe(2026)
  })

  it('Month change fires onDateChange with correct date', () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '0' } })
    const call = handler.mock.calls[0][0] as Date
    expect(call.getMonth()).toBe(0)
    expect(call.getDate()).toBe(11)
  })

  it('Year change fires onDateChange with correct date', () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2027' } })
    const call = handler.mock.calls[0][0] as Date
    expect(call.getFullYear()).toBe(2027)
    expect(call.getDate()).toBe(11)
  })

  it('Feb 30 clamps to Feb 28 in non-leap year', () => {
    const march30 = new Date(2026, 2, 30)
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={march30} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1' } })
    const call = handler.mock.calls[0][0] as Date
    expect(call.getDate()).toBe(28)
    expect(call.getMonth()).toBe(1)
  })

  it('Feb 30 clamps to Feb 29 in leap year', () => {
    const march30 = new Date(2028, 2, 30)
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={march30} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1' } })
    const call = handler.mock.calls[0][0] as Date
    expect(call.getDate()).toBe(29)
    expect(call.getMonth()).toBe(1)
  })

  it('applies custom className', () => {
    const { container } = render(
      <CalendarNavBar currentDate={date} onDateChange={vi.fn()} className="custom-nav" />,
    )
    expect((container.firstChild as HTMLElement).className).toContain('custom-nav')
  })

  it('← passes source "prev" to onDateChange', async () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(handler.mock.calls[0][1]).toBe('prev')
  })

  it('→ passes source "next" to onDateChange', async () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(handler.mock.calls[0][1]).toBe('next')
  })

  it('day select passes source "select" to onDateChange', () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '20' } })
    expect(handler.mock.calls[0][1]).toBe('select')
  })

  it('month select passes source "select" to onDateChange', () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '0' } })
    expect(handler.mock.calls[0][1]).toBe('select')
  })

  it('year select passes source "select" to onDateChange', () => {
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2027' } })
    expect(handler.mock.calls[0][1]).toBe('select')
  })
})

describe('Today button', () => {
  it('renders Today button', () => {
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
  })

  it('Today button fires onDateChange with today date and source "today"', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 20, 10, 0, 0))
    const handler = vi.fn()
    render(<CalendarNavBar currentDate={date} onDateChange={handler} />)
    // Use fireEvent to avoid userEvent timer conflicts with vi.useFakeTimers
    fireEvent.click(screen.getByRole('button', { name: 'Today' }))
    const [calledDate, calledSource] = handler.mock.calls[0] as [Date, string]
    expect(calledDate.toISOString().slice(0, 10)).toBe('2026-05-20')
    expect(calledSource).toBe('today')
    vi.useRealTimers()
  })

  it('Today button is disabled when current week contains today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 13, 10, 0, 0)) // Wed May 13 — in same week as date (Mon May 11)
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled()
    vi.useRealTimers()
  })

  it('Today button is enabled when current week does not contain today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 20, 10, 0, 0)) // May 20 — different week
    render(<CalendarNavBar currentDate={date} onDateChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Today' })).not.toBeDisabled()
    vi.useRealTimers()
  })
})
