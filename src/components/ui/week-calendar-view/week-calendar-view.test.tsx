import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'
import { WeekCalendarView } from './week-calendar-view'

const WEEK_START = '2026-05-04' // Monday

const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team standup',
    start: '2026-05-04T09:00:00',
    end: '2026-05-04T09:30:00',
  },
  {
    id: '2',
    title: 'Design review',
    start: '2026-05-06T14:00:00',
    end: '2026-05-06T15:00:00',
    color: 'blue' as const,
  },
]

const allDayEvent: CalendarEvent = {
  id: 'ad1',
  title: 'Conference Day',
  start: '2026-05-04T00:00:00',
  end: '2026-05-04T23:59:59',
  allDay: true,
}

describe('WeekCalendarView', () => {
  it('renders week calendar region', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getByRole('region', { name: 'Week calendar' })).toBeInTheDocument()
  })

  it('renders day column headers', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getByRole('button', { name: /Mon 4/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sun 10/i })).toBeInTheDocument()
  })

  it('renders date numbers in headers', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getByRole('button', { name: /Mon 4/i })).toBeInTheDocument()
  })

  it('renders hour labels', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getAllByText('8am').length).toBeGreaterThan(0)
  })

  it('renders events by title', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={events} />)
    expect(screen.getByRole('button', { name: /team standup/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /design review/i })).toBeInTheDocument()
  })

  it('applies default event color class when color prop omitted', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[events[0]]} />)
    const chip = screen.getByRole('button', { name: /team standup/i })
    expect(chip.className).toContain('bg-accent')
  })

  it('applies named color class when color prop provided', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[events[1]]} />)
    const chip = screen.getByRole('button', { name: /design review/i })
    expect(chip.className).toContain('bg-blue-600')
  })

  it('renders correct number of hour rows with custom hourCount', () => {
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} hourStart={9} hourCount={8} />,
    )
    expect(screen.getAllByText('9am').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('8am')).toHaveLength(0)
  })

  it('only renders events that fall within the displayed week', () => {
    const outsideEvent: CalendarEvent = {
      id: '3',
      title: 'Outside event',
      start: '2026-05-11T10:00:00',
      end: '2026-05-11T11:00:00',
    }
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[outsideEvent]} />)
    expect(screen.queryByRole('button', { name: /outside event/i })).not.toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} className="custom-class" />,
    )
    expect((container.firstChild as HTMLElement).className).toContain('custom-class')
  })

  it('applies custom hourHeight inline style to hour rows', () => {
    const { container } = render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} hourHeight={80} />,
    )
    const rowsWithStyle = Array.from(container.querySelectorAll('div')).filter(
      (el) => (el as HTMLElement).style.height === '80px',
    )
    expect(rowsWithStyle.length).toBeGreaterThan(0)
  })

  it('calls onEventClick with the event when chip clicked', async () => {
    const handler = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventClick={handler}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith(events[0])
  })

  it('renders custom renderEvent output instead of default chip', () => {
    const renderEvent = (e: CalendarEvent) => (
      <span data-testid="custom-chip">{e.title}-custom</span>
    )
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        renderEvent={renderEvent}
      />,
    )
    expect(screen.getByTestId('custom-chip')).toBeInTheDocument()
    expect(screen.getByTestId('custom-chip').textContent).toBe('Team standup-custom')
  })
})

describe('today highlight', () => {
  it('applies bg-item-hover to today day header', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T10:00:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    const monHeader = screen.getByRole('button', { name: /Mon 4/i })
    expect(monHeader.className).toContain('bg-item-hover')
    vi.useRealTimers()
  })

  it('does not apply today highlight to other day headers', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T10:00:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    const tueHeader = screen.getByRole('button', { name: /Tue 5/i })
    expect(tueHeader.className).not.toContain('bg-item-hover')
    vi.useRealTimers()
  })
})

describe('all-day row', () => {
  it('renders all-day row label when allDay events present', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[allDayEvent]} />)
    expect(screen.getByText('All day')).toBeInTheDocument()
  })

  it('renders all-day event chip in the all-day row', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[allDayEvent]} />)
    expect(screen.getByLabelText('Conference Day')).toBeInTheDocument()
  })

  it('does not render all-day row when no allDay events', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.queryByText('All day')).not.toBeInTheDocument()
  })

  it('does not render allDay events in the time grid', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[allDayEvent]} />)
    const chip = screen.getByLabelText('Conference Day')
    expect(chip.style.top).toBe('')
    expect(chip.style.height).toBe('')
  })
})

describe('nav bar', () => {
  it('renders Previous week and Next week buttons', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getByRole('button', { name: 'Previous week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next week' })).toBeInTheDocument()
  })

  it('clicking Next week advances to the following week', async () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByRole('button', { name: /Mon 11/i })).toBeInTheDocument()
  })

  it('clicking Previous week goes back one week', async () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-11" events={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.getByRole('button', { name: /Mon 4/i })).toBeInTheDocument()
  })

  it('navigating to a mid-week date shows the Monday of that week', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    // Change day select to 13 (Wed May 13) — getMondayISO(May 13) = May 11
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '13' } })
    expect(screen.getByRole('button', { name: /Mon 11/i })).toBeInTheDocument()
  })
})

describe('internal state', () => {
  it('defaults to current week when no defaultWeekStart given', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-12T10:00:00')) // Tuesday
    render(<WeekCalendarView events={[]} />)
    expect(screen.getByRole('button', { name: /Mon 11/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('defaults to Monday when current day is Sunday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17T10:00:00')) // Sunday May 17
    render(<WeekCalendarView events={[]} />)
    // getMondayISO(Sunday May 17) = May 11
    expect(screen.getByRole('button', { name: /Mon 11/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('respects defaultWeekStart prop', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    expect(screen.getByRole('button', { name: /Mon 4/i })).toBeInTheDocument()
  })
})

describe('event forwarding', () => {
  it('forwards onEventEdit — shows edit button in popover', async () => {
    const onEdit = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[events[0]]} onEventEdit={onEdit} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(events[0])
  })

  it('forwards onEventDelete — shows delete button in popover', async () => {
    const onDelete = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventDelete={onDelete}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith(events[0])
  })

  it('forwards renderEventPopover slot', async () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        renderEventPopover={() => <span>custom popover</span>}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByText('custom popover')).toBeInTheDocument()
  })
})

describe('time indicator', () => {
  it('renders time indicator in today column when time is within visible hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T10:00:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(document.querySelector('[data-testid="time-indicator"]')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('does not render time indicator when current time is outside visible hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T03:00:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(document.querySelector('[data-testid="time-indicator"]')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('does not render time indicator on non-today columns', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T10:00:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(document.querySelectorAll('[data-testid="time-indicator"]').length).toBe(1)
    vi.useRealTimers()
  })
})

describe('day expand', () => {
  it('day header buttons have aria-pressed="false" by default', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getByRole('button', { name: /Mon 4/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking a day header sets aria-pressed="true"', async () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    const monButton = screen.getByRole('button', { name: /Mon 4/i })
    await userEvent.click(monButton)
    expect(monButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking an expanded day header collapses it', async () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    const monButton = screen.getByRole('button', { name: /Mon 4/i })
    await userEvent.click(monButton)
    await userEvent.click(monButton)
    expect(monButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('only one day can be expanded at a time', async () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    const monButton = screen.getByRole('button', { name: /Mon 4/i })
    const tueButton = screen.getByRole('button', { name: /Tue 5/i })
    await userEvent.click(monButton)
    await userEvent.click(tueButton)
    expect(monButton).toHaveAttribute('aria-pressed', 'false')
    expect(tueButton).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('overlap layout', () => {
  it('renders two overlapping events side by side', () => {
    const overlapping: CalendarEvent[] = [
      { id: 'o1', title: 'Event A', start: '2026-05-04T09:00:00', end: '2026-05-04T10:00:00' },
      { id: 'o2', title: 'Event B', start: '2026-05-04T09:30:00', end: '2026-05-04T10:30:00' },
    ]
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={overlapping} />)
    const chipA = screen.getByRole('button', { name: /event a/i })
    const chipB = screen.getByRole('button', { name: /event b/i })
    expect(chipA.style.left).toBe('calc(0% + 1px)')
    expect(chipB.style.left).toBe('calc(50% + 1px)')
  })
})

describe('event keyboard accessibility', () => {
  it('calls onEventClick when Enter key is pressed on event', () => {
    const handler = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventClick={handler}
      />,
    )
    const eventChip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.keyDown(eventChip, { key: 'Enter' })
    expect(handler).toHaveBeenCalledWith(events[0])
  })

  it('calls onEventClick when Space key is pressed on event', () => {
    const handler = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventClick={handler}
      />,
    )
    const eventChip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.keyDown(eventChip, { key: ' ' })
    expect(handler).toHaveBeenCalledWith(events[0])
  })
})
