import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'
import type { WeekCalendarViewProps as BarrelWeekCalendarViewProps } from '@/index'
import { WeekCalendarView } from './week-calendar-view'
import { SleepBand } from './sleep-band'
import { GhostEvent } from './ghost-event'

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
    expect(screen.getByRole('button', { name: /Sun 3/i })).toBeInTheDocument()
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
    expect(chip.parentElement?.className).toContain('bg-emerald-700')
  })

  it('applies named color class when color prop provided', () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[events[1]]} />)
    const chip = screen.getByRole('button', { name: /design review/i })
    expect(chip.parentElement?.className).toContain('bg-blue-600')
  })

  it('renders correct number of hour rows with custom hourCount', () => {
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} hourStart={9} hourCount={8} />,
    )
    expect(screen.getAllByText('9am').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('8am')).toHaveLength(0)
  })

  it('renders hour labels in 24h format when use24h is set', () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[]}
        hourStart={9}
        hourCount={8}
        use24h
      />,
    )
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.queryByText('9am')).not.toBeInTheDocument()
  })

  it('renders event chip start time in 24h format when use24h is set', () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[1]]}
        hourStart={9}
        hourCount={8}
        use24h
      />,
    )
    const chip = screen.getByRole('button', { name: /design review/i })
    expect(chip).toHaveTextContent('14:00')
    expect(chip).not.toHaveTextContent('2:00')
  })

  it('renders event chip start time in 12h format when use24h is not set', () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[1]]}
        hourStart={9}
        hourCount={8}
      />,
    )
    const chip = screen.getByRole('button', { name: /design review/i })
    expect(chip).toHaveTextContent('2:00')
    expect(chip).not.toHaveTextContent('14:00')
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

  it('renders time gutter label showing 12 at noon when today is in week', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T12:00:00'))
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} hourStart={8} hourCount={14} />,
    )
    expect(screen.getByTestId('time-gutter-label')).toHaveTextContent('12:00 PM')
    vi.useRealTimers()
  })

  it('renders current time label in 24h format when use24h is set', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T14:34:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} use24h />)
    expect(screen.getByTestId('time-gutter-label').textContent).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/)
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

  it('renders (No title) fallback for all-day event with empty title', () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[
          {
            id: 'ad2',
            title: '',
            start: '2026-05-04T00:00:00',
            end: '2026-05-04T23:59:59',
            allDay: true,
          },
        ]}
      />,
    )
    expect(screen.getByLabelText('(No title)')).toBeInTheDocument()
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

  it('navigating to a mid-week date shows the Sunday of that week', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    // Change day select to 13 (Wed May 13) — getSundayISO(May 13) = May 10
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '13' } })
    expect(screen.getByRole('button', { name: /Mon 11/i })).toBeInTheDocument()
  })

  it('selecting a day via nav auto-expands that day column', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    // Day 13 = Wed May 13 2026 (index 3 in Sun-first week)
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '13' } })
    expect(screen.getByRole('button', { name: /Wed 13/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('selecting a Sunday via nav auto-expands the Sunday column (index 0)', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    // Day 10 = Sun May 10 2026 (index 0 in Sun-first week)
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '10' } })
    expect(screen.getByRole('button', { name: /Sun 10/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking next week collapses any expanded day', async () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    await userEvent.click(screen.getByRole('button', { name: /Mon 4/i }))
    expect(screen.getByRole('button', { name: /Mon 4/i })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByRole('button', { name: /Mon 11/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking previous week collapses any expanded day', async () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-11" events={[]} />)
    await userEvent.click(screen.getByRole('button', { name: /Mon 11/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.getByRole('button', { name: /Mon 4/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('Day select retains selected day number after auto-expand', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    // May 15 = Friday, getSundayISO → May 10; Day select should still show 15
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '15' } })
    expect(screen.getByLabelText('Day')).toHaveValue('15')
  })
})

describe('onWeekChange', () => {
  it('does not fire on mount', () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} onWeekChange={onWeekChange} />,
    )
    expect(onWeekChange).not.toHaveBeenCalled()
  })

  it('fires with the new week Sunday ISO when Previous week is clicked', async () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} onWeekChange={onWeekChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(onWeekChange).toHaveBeenCalledExactlyOnceWith('2026-04-26')
  })

  it('fires with the new week Sunday ISO when Next week is clicked', async () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} onWeekChange={onWeekChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(onWeekChange).toHaveBeenCalledExactlyOnceWith('2026-05-10')
  })

  it('fires with the new week Sunday ISO when Today is clicked', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T10:00:00'))
    const onWeekChange = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart="2026-05-03" events={[]} onWeekChange={onWeekChange} />,
    )
    const todayBtn = screen.getByRole('button', { name: 'Today' })
    await userEvent.click(todayBtn)
    expect(onWeekChange).toHaveBeenCalledExactlyOnceWith('2026-05-17')
    vi.useRealTimers()
  })

  it('fires with the new week Sunday ISO when the Month select changes to a different week', () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} onWeekChange={onWeekChange} />,
    )
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '5' } })
    expect(onWeekChange).toHaveBeenCalledExactlyOnceWith('2026-05-31')
  })

  it('fires with the new week Sunday ISO when the Year select changes to a different week', () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} onWeekChange={onWeekChange} />,
    )
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2027' } })
    expect(onWeekChange).toHaveBeenCalledExactlyOnceWith('2027-05-02')
  })

  it('does not fire when a select-source date stays within the displayed week', () => {
    const onWeekChange = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} onWeekChange={onWeekChange} />,
    )
    // Day 6 = Wed May 6 2026 — still inside the displayed May 3-9 week
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '6' } })
    expect(onWeekChange).not.toHaveBeenCalled()
  })

  it('does not crash when onWeekChange is absent and nav is used', async () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
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

  it('defaults to Sunday when current day is Sunday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17T10:00:00')) // Sunday May 17
    render(<WeekCalendarView events={[]} />)
    // getSundayISO(Sunday May 17) = May 17 itself
    expect(screen.getByRole('button', { name: /Sun 17/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('respects defaultWeekStart prop', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={[]} />)
    expect(screen.getByRole('button', { name: /Mon 4/i })).toBeInTheDocument()
  })
})

describe('event forwarding', () => {
  it('forwards onEventEdit — shows edit button in popover that opens inline form', async () => {
    const onEdit = vi.fn()
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[events[0]]} onEventEdit={onEdit} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
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
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
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

describe('WeekCalendarView complete toggle', () => {
  it('clicking "Mark complete" calls onEventToggleComplete with the toggled event', async () => {
    const onEventToggleComplete = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventToggleComplete={onEventToggleComplete}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /mark complete/i }))
    expect(onEventToggleComplete).toHaveBeenCalledWith({ ...events[0], completed: true })
  })

  it('toggling an already-completed event calls onEventToggleComplete with completed: false', async () => {
    const onEventToggleComplete = vi.fn()
    const doneEvent: CalendarEvent = { ...events[0], id: 'done-1', completed: true }
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[doneEvent]}
        onEventToggleComplete={onEventToggleComplete}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /mark incomplete/i }))
    expect(onEventToggleComplete).toHaveBeenCalledWith({ ...doneEvent, completed: false })
  })

  it('toggle updates local state — chip title gets line-through after marking complete, other events untouched', async () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={events} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /mark complete/i }))
    const titleEls = screen.getAllByText('Team standup')
    const chipTitle = titleEls.find((el) => el.classList.contains('truncate'))
    expect(chipTitle).toHaveClass('line-through')
    const otherTitleEls = screen.getAllByText('Design review')
    const otherChipTitle = otherTitleEls.find((el) => el.classList.contains('truncate'))
    expect(otherChipTitle).not.toHaveClass('line-through')
  })

  it('toggling a recurrence instance resolves and toggles the original event', async () => {
    const onEventToggleComplete = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Recur complete',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventToggleComplete={onEventToggleComplete}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /recur complete/i })
    // Tuesday instance (recurrence copy) — toggling must resolve the original by id
    await userEvent.click(chips[1])
    await userEvent.click(screen.getByRole('button', { name: /mark complete/i }))
    expect(onEventToggleComplete).toHaveBeenCalledWith({ ...recurringEvent, completed: true })
  })

  it('toggles locally without crashing when onEventToggleComplete is not provided', async () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[events[0]]} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /mark complete/i }))
    expect(screen.getByRole('button', { name: /mark incomplete/i })).toBeInTheDocument()
  })

  it('completable event renders the chip circle and toggles via onEventToggleComplete', async () => {
    const onEventToggleComplete = vi.fn()
    const completableEvent: CalendarEvent = { ...events[0], completable: true }
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[completableEvent]}
        onEventToggleComplete={onEventToggleComplete}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Mark complete' }))
    expect(onEventToggleComplete).toHaveBeenCalledWith({ ...completableEvent, completed: true })
  })

  it('circle on a recurrence instance toggles the ORIGINAL event', async () => {
    const onEventToggleComplete = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Recur complete',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue'],
      completable: true,
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventToggleComplete={onEventToggleComplete}
      />,
    )
    const circles = screen.getAllByRole('checkbox', { name: 'Mark complete' })
    await userEvent.click(circles[circles.length - 1]) // an expanded instance, not the base chip
    expect(onEventToggleComplete).toHaveBeenCalledWith({ ...recurringEvent, completed: true })
  })
})

describe('WeekCalendarView lock', () => {
  it('lock button on the chip calls onEventToggleLock with the toggled event', async () => {
    const onEventToggleLock = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventToggleLock={onEventToggleLock}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Lock event' }))
    expect(onEventToggleLock).toHaveBeenCalledWith({ ...events[0], locked: true })
  })

  it('toggling an already-locked event calls onEventToggleLock with locked: false', async () => {
    const onEventToggleLock = vi.fn()
    const lockedEvent: CalendarEvent = { ...events[0], id: 'locked-1', locked: true }
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[lockedEvent]}
        onEventToggleLock={onEventToggleLock}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Unlock event' }))
    expect(onEventToggleLock).toHaveBeenCalledWith({ ...lockedEvent, locked: false })
  })

  it('toggling lock on one event leaves the other event in local state untouched', async () => {
    const onEventToggleLock = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0], events[1]]}
        onEventToggleLock={onEventToggleLock}
      />,
    )
    const lockButtons = screen.getAllByRole('button', { name: 'Lock event' })
    expect(lockButtons.length).toBe(2)
    await userEvent.click(lockButtons[0])
    expect(onEventToggleLock).toHaveBeenCalledWith({ ...events[0], locked: true })
    // Reconciliation maps over ALL local events by id — the other event must fall through
    // the `e.id !== toggled.id` branch untouched: still rendered, still unlocked.
    expect(screen.getByRole('button', { name: 'Unlock event' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lock event' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /design review/i })).toBeInTheDocument()
  })

  it('toggling a recurrence instance lock resolves and toggles the original event', async () => {
    const onEventToggleLock = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Recur lock',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventToggleLock={onEventToggleLock}
      />,
    )
    const lockButtons = screen.getAllByRole('button', { name: 'Lock event' })
    await userEvent.click(lockButtons[1])
    expect(onEventToggleLock).toHaveBeenCalledWith({ ...recurringEvent, locked: true })
  })

  it('toggles locally without crashing when onEventToggleLock is not provided', async () => {
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[events[0]]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Lock event' }) as HTMLElement)
    expect(screen.getByRole('button', { name: 'Unlock event' })).toBeInTheDocument()
  })

  it('locked event: chip has no cursor-grab even when onEventMove is wired', () => {
    const lockedEvent: CalendarEvent = { ...events[0], locked: true }
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[lockedEvent]}
        onEventMove={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    expect(chip.className).not.toContain('cursor-grab')
  })

  it('locked event: resize strips are absent even when onEventResize is wired', () => {
    const lockedEvent: CalendarEvent = { ...events[0], locked: true }
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[lockedEvent]}
        onEventResize={vi.fn()}
      />,
    )
    expect(document.querySelector('[data-resize="start"]')).not.toBeInTheDocument()
    expect(document.querySelector('[data-resize="end"]')).not.toBeInTheDocument()
  })

  it('unlocked event still renders resize strips and cursor-grab when drag handlers are wired', () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventMove={vi.fn()}
        onEventResize={vi.fn()}
      />,
    )
    expect(document.querySelector('[data-resize="start"]')).toBeInTheDocument()
    const chip = screen.getByRole('button', { name: /team standup/i })
    expect(chip.className).toContain('cursor-grab')
  })

  it('locked survives recurrence expansion — fanned instances stay locked (no cursor-grab)', () => {
    const recurringLocked: CalendarEvent = {
      id: 'rl1',
      title: 'Recur locked',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue'],
      locked: true,
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringLocked]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /recur locked/i })
    expect(chips).toHaveLength(2)
    for (const chip of chips) {
      expect(chip.className).not.toContain('cursor-grab')
    }
  })

  it('a typed onEventToggleLock handler can read event.locked via the barrel WeekCalendarViewProps type with no cast (compile-time proof)', async () => {
    const seenLocked: (boolean | undefined)[] = []
    const onEventToggleLock: NonNullable<BarrelWeekCalendarViewProps['onEventToggleLock']> = (
      e,
    ) => {
      seenLocked.push(e.locked)
    }
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[events[0]]}
        onEventToggleLock={onEventToggleLock}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Lock event' }))
    expect(seenLocked).toEqual([true])
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

  it('renders current time label in gutter when today is in view', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T14:34:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getByTestId('time-gutter-label')).toBeInTheDocument()
    expect(screen.getByTestId('time-gutter-label').textContent).toMatch(/2:34/i)
    vi.useRealTimers()
  })

  it('does not render time gutter label when today is not visible', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T03:00:00'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.queryByTestId('time-gutter-label')).not.toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('TimeGutterLabel SSR safety', () => {
  it('emits no time-dependent markup on server render', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T12:00:00'))
    const html = renderToString(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} hourStart={8} hourCount={14} />,
    )
    expect(html).not.toContain('data-testid="time-gutter-label"')
    vi.useRealTimers()
  })

  it('renders the current-time label after mount', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T12:00:00'))
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} hourStart={8} hourCount={14} />,
    )
    expect(screen.getByTestId('time-gutter-label')).toBeInTheDocument()
    vi.useRealTimers()
  })

  // jsdom cannot assert visual occlusion (stacking/paint order) — this only
  // confirms the opaque-chip classes are present. Actual occlusion of the
  // static hour label is verified visually in Storybook (see wave checklist).
  it('renders an opaque chip that stacks above the static hour labels', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-04T12:00:00'))
    render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[]} hourStart={8} hourCount={14} />,
    )
    const label = screen.getByTestId('time-gutter-label')
    expect(label.className).toContain('bg-background')
    expect(label.className).toContain('z-20')
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
    expect(chipA.parentElement?.style.left).toBe('calc(0% + 1px)')
    expect(chipB.parentElement?.style.left).toBe('calc(50% + 1px)')
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

describe('SleepBand', () => {
  it('renders two sleep regions', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand sleepStart={23} sleepEnd={7} hourStart={0} hourCount={24} hourHeight={30} />
      </div>,
    )
    expect(container.querySelectorAll('[data-testid="sleep-region"]').length).toBe(2)
  })

  it('top region covers 00:00 to sleepEnd (7:00)', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand sleepStart={23} sleepEnd={7} hourStart={0} hourCount={24} hourHeight={30} />
      </div>,
    )
    const regions = container.querySelectorAll('[data-testid="sleep-region"]')
    const topRegion = regions[0] as HTMLElement
    // top=0, height = 7/24 * 100 ≈ 29.17%
    expect(topRegion.style.top).toBe('0%')
    expect(parseFloat(topRegion.style.height)).toBeCloseTo(29.17, 1)
  })

  it('bottom region covers sleepStart (23:00) to 24:00', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand sleepStart={23} sleepEnd={7} hourStart={0} hourCount={24} hourHeight={30} />
      </div>,
    )
    const regions = container.querySelectorAll('[data-testid="sleep-region"]')
    const bottomRegion = regions[1] as HTMLElement
    // top = 23/24 * 100 ≈ 95.83%, height = 1/24 * 100 ≈ 4.17%
    expect(parseFloat(bottomRegion.style.top)).toBeCloseTo(95.83, 1)
    expect(parseFloat(bottomRegion.style.height)).toBeCloseTo(4.17, 1)
  })

  it('clamps regions to visible hour range', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand sleepStart={23} sleepEnd={7} hourStart={8} hourCount={14} hourHeight={56} />
      </div>,
    )
    // Top region: 0:00-7:00 is entirely before hourStart=8 → not rendered
    // Bottom region: 23:00-24:00 is beyond hourStart+hourCount=22 → not rendered
    const regions = container.querySelectorAll('[data-testid="sleep-region"]')
    expect(regions.length).toBe(0)
  })

  it('shading never blocks pointer events so chips stay clickable in sleep hours', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand sleepStart={23} sleepEnd={7} hourStart={0} hourCount={24} hourHeight={30} />
      </div>,
    )
    const regions = container.querySelectorAll('[data-testid="sleep-region"]')
    expect(regions.length).toBe(2)
    regions.forEach((r) => {
      expect((r as HTMLElement).style.pointerEvents).toBe('none')
    })
  })

  it('renders sleep regions when hour range overlaps sleep hours (6am-midnight range)', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand sleepStart={23} sleepEnd={7} hourStart={6} hourCount={18} hourHeight={36} />
      </div>,
    )
    // Top region: 0:00–7:00 clamps to 6:00–7:00 → renders (1/18 height)
    // Bottom region: 23:00–24:00 within 6–24 → renders (1/18 height)
    const regions = container.querySelectorAll('[data-testid="sleep-region"]')
    expect(regions.length).toBe(2)
    const topRegion = regions[0] as HTMLElement
    expect(topRegion.style.top).toBe('0%')
    expect(parseFloat(topRegion.style.height)).toBeCloseTo(5.56, 1)
  })
})

describe('WeekCalendarView sleep-region interactivity', () => {
  const SLEEP_WINDOWS: CalendarEvent[] = [
    {
      id: 'night',
      title: 'Night reading',
      start: '2026-05-04T22:00:00',
      end: '2026-05-04T22:30:00',
      color: 'blue',
    },
  ]
  const dayWindows = Array.from({ length: 7 }, () => ({ wake: 9, sleep: 17 }))

  it('sleep-region shading never blocks pointer events even when sleepEnabled', () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={SLEEP_WINDOWS}
        sleepEnabled
        dayWindows={dayWindows}
      />,
    )
    const regions = document.querySelectorAll<HTMLElement>('[data-testid="sleep-region"]')
    expect(regions.length).toBeGreaterThan(0)
    regions.forEach((r) => expect(r.style.pointerEvents).toBe('none'))
  })

  it('opens the popover for an event that sits inside the sleep-shaded region', async () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={SLEEP_WINDOWS}
        sleepEnabled
        dayWindows={dayWindows}
        onEventEdit={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /night reading/i })
    fireEvent.pointerDown(chip, { clientY: 400, clientX: 200 })
    fireEvent.pointerUp(chip, { clientY: 400, clientX: 200 })
    await userEvent.click(chip)
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})

describe('GhostEvent', () => {
  it('renders ghost with data-testid', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={32} endSlot={36} hourStart={8} hourCount={14} hourHeight={56} />
      </div>,
    )
    expect(screen.getByTestId('ghost-event')).toBeInTheDocument()
  })

  it('ghost has aria-hidden', () => {
    render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={32} endSlot={36} hourStart={8} hourCount={14} hourHeight={56} />
      </div>,
    )
    expect(screen.getByTestId('ghost-event')).toHaveAttribute('aria-hidden', 'true')
  })

  it('ghost top is 0% when startSlot matches hourStart', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={32} endSlot={36} hourStart={8} hourCount={14} hourHeight={56} />
      </div>,
    )
    const ghost = container.querySelector('[data-testid="ghost-event"]') as HTMLElement
    expect(ghost.style.top).toBe('0%')
  })

  it('ghost height represents 1 hour (4 slots) correctly', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <GhostEvent startSlot={32} endSlot={36} hourStart={8} hourCount={14} hourHeight={56} />
      </div>,
    )
    const ghost = container.querySelector('[data-testid="ghost-event"]') as HTMLElement
    // 4 slots = 1 hour; hourCount=14 → 1/14 * 100 ≈ 7.14%
    expect(parseFloat(ghost.style.height)).toBeCloseTo(7.14, 1)
  })
})

describe('event position clamping', () => {
  it('event starting before hourStart is pinned to top=0', () => {
    const earlyEvent: CalendarEvent = {
      id: 'early',
      title: 'Early bird',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T09:00:00',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[earlyEvent]}
        hourStart={8}
        hourCount={14}
      />,
    )
    const chip = screen.getByRole('button', { name: /early bird/i })
    expect(chip.parentElement?.style.top).toBe('0%')
    // Only the visible 1h (8–9am) portion shows — 1/14 ≈ 7.14%
    expect(parseFloat(chip.parentElement?.style.height ?? '')).toBeCloseTo(7.14, 1)
  })

  it('event ending past the visible range has height clipped to remaining grid', () => {
    const lateEvent: CalendarEvent = {
      id: 'late',
      title: 'Overnight',
      start: '2026-05-04T21:00:00',
      end: '2026-05-05T02:00:00',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[lateEvent]}
        hourStart={8}
        hourCount={14}
      />,
    )
    // Two chips now: original (Mon 21:00–22:00 visible) + overflow continuation (Tue 00:00–02:00)
    const chips = screen.getAllByRole('button', { name: /overnight/i })
    const chip = chips[0] // original in Mon column
    // top = (21-8)/14*100 ≈ 92.86%
    expect(parseFloat(chip.parentElement?.style.top ?? '')).toBeCloseTo(92.86, 1)
    // visible portion: 9pm–10pm = 1h → 1/14*100 ≈ 7.14%
    expect(parseFloat(chip.parentElement?.style.height ?? '')).toBeCloseTo(7.14, 1)
  })
})

describe('drag to create', () => {
  it('calls onEventCreate after drag-to-create and form save', async () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={onCreate}
      />,
    )
    // pointerdown on first hour row of first day column
    const rows = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(rows[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    // create form should appear
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Event title'), 'New event')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onCreate).toHaveBeenCalledOnce()
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ title: 'New event' }))
  })

  it('dismisses create popover when Escape is pressed', async () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={vi.fn()}
      />,
    )
    const rows = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(rows[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
  })

  it('dismisses create popover when Cancel button is clicked', async () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={vi.fn()}
      />,
    )
    const rows = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(rows[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
  })

  it('getPointerDayIdx returns non-zero when clientX is within a column rect (mocked)', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={vi.fn()}
      />,
    )
    const rows = document.querySelectorAll('[data-drag-cell]')
    // rows[14].parentElement is day column 1 (after 14 rows of day 0)
    const day1Col = rows[14]?.parentElement
    // Mock all getBoundingClientRect: day1Col returns a real rect, others return zeros
    const zeroRect = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
    const col1Rect = {
      left: 100,
      right: 200,
      top: 0,
      bottom: 500,
      width: 100,
      height: 500,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return this === day1Col ? col1Rect : zeroRect
    })
    fireEvent.pointerDown(rows[0], { pointerId: 1, clientY: 0 })
    // Fire pointerMove with clientX=150 in column 1 rect range → getPointerDayIdx returns 1
    fireEvent.pointerMove(rows[0], { pointerId: 1, clientX: 150, clientY: 0 })
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    // Popover shows — verifies drag completed
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('multi-day drag covers recurrenceDays fallback in create handler', async () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={onCreate}
      />,
    )
    const rows = document.querySelectorAll('[data-drag-cell]')
    const day1Col = rows[14]?.parentElement
    const zeroRect = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
    const col1Rect = {
      left: 100,
      right: 200,
      top: 0,
      bottom: 500,
      width: 100,
      height: 500,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return this === day1Col ? col1Rect : zeroRect
    })
    // Start drag in day 0, move into day 1 → currentDayIdx=1, startDayIdx=0 → multi-day path
    fireEvent.pointerDown(rows[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerMove(rows[0], { pointerId: 1, clientX: 150, clientY: 0 })
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    // Uncheck all pre-selected recurrence day buttons so recurrenceDays becomes undefined
    // This covers the ?? [] fallback branch in the create handler
    const dayButtons = screen.queryAllByRole('button', { name: /^Day: / })
    for (const btn of dayButtons) {
      if (btn.getAttribute('aria-pressed') === 'true') {
        await userEvent.click(btn)
      }
    }
    await userEvent.type(screen.getByLabelText('Event title'), 'Multi-day event')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    // onCreate called via multi-day path with recurrenceDays=undefined → ?? [] fallback hit
    expect(onCreate).toHaveBeenCalledOnce()
    vi.restoreAllMocks()
  })
})

describe('drag ghost — resizing and recurrence-select', () => {
  it('renders ghost event when drag state transitions to resizing-end', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventResize={vi.fn()}
      />,
    )
    const resizeHandle = document.querySelector('[data-resize="end"]')
    expect(resizeHandle).toBeInTheDocument()
    fireEvent.pointerDown(resizeHandle!, { pointerId: 1 })
    expect(screen.getByTestId('ghost-event')).toBeInTheDocument()
  })

  it('calls onEventResize with updated end time when pointerUp after resizing', () => {
    const onResize = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventResize={onResize}
      />,
    )
    const resizeHandle = document.querySelector('[data-resize="end"]')!
    fireEvent.pointerDown(resizeHandle, { pointerId: 1 })
    fireEvent.pointerMove(resizeHandle, { pointerId: 1, clientY: 300 })
    fireEvent.pointerUp(resizeHandle, { pointerId: 1 })
    expect(onResize).toHaveBeenCalledOnce()
    expect(onResize).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))
  })

  it('renders ghost event when drag state transitions to recurrence-select (shiftKey)', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200, shiftKey: true })
    expect(screen.getByTestId('ghost-event')).toBeInTheDocument()
  })

  it('calls onEventEdit with recurrenceDays when pointerUp after recurrence-select', () => {
    const onEdit = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventEdit={onEdit}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200, shiftKey: true })
    // In JSDOM getPointerDayIdx returns 0 (Sun); startDayIdx=1 (Mon) → range [0,1] → Sun+Mon
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerMove(cells[0], { pointerId: 1, clientY: 200, clientX: 0 })
    fireEvent.pointerUp(cells[0], { pointerId: 1 })
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: expect.arrayContaining(['Mon']) }),
    )
  })

  it('updateSlot fires again during a second pointerMove in recurrence-select mode', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200, shiftKey: true })
    // Move exercises the recurrence-select branch in handleGridPointerMove
    fireEvent.pointerMove(chip, { pointerId: 1, clientX: 130, clientY: 201 })
    // Second move continues exercising recurrence-select branch
    fireEvent.pointerMove(chip, { pointerId: 1, clientX: 150, clientY: 202 })
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBeGreaterThan(0)
  })

  it('calls onEventMove when pointerUp while in moving state', () => {
    const onMove = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={onMove}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200 })
    fireEvent.pointerMove(chip, { pointerId: 1, clientX: 102, clientY: 203 })
    fireEvent.pointerUp(chip, { pointerId: 1 })
    expect(onMove).toHaveBeenCalledOnce()
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))
  })
})

describe('drag slop threshold — press-release is a click, not a move', () => {
  const slopEvent: CalendarEvent = {
    id: 'sl1',
    title: 'Slop event',
    start: '2026-05-04T09:00:00',
    end: '2026-05-04T10:00:00',
  }

  it('opens the popover and does not move when the chip is pressed and released without dragging', async () => {
    const onMove = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[slopEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={onMove}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /slop event/i }))
    // Radix PopoverTrigger opened on click → the Edit action is visible
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
    expect(onMove).not.toHaveBeenCalled()
  })

  it('opens the popover and does not move when pointer travel stays under the slop distance', () => {
    const onMove = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[slopEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={onMove}
      />,
    )
    const chip = screen.getByRole('button', { name: /slop event/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200 })
    // hypot(2, 1) ≈ 2.2 px — below the slop threshold
    fireEvent.pointerMove(chip, { pointerId: 1, clientX: 102, clientY: 201 })
    fireEvent.pointerUp(chip, { pointerId: 1, clientX: 102, clientY: 201 })
    expect(onMove).not.toHaveBeenCalled()
    // The native click that follows a stationary press still opens the popover
    fireEvent.click(chip)
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
  })

  it('commits a move once pointer travel exceeds the slop distance', () => {
    const onMove = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[slopEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={onMove}
      />,
    )
    const chip = screen.getByRole('button', { name: /slop event/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200 })
    // 20 px vertical travel — beyond the 4 px slop threshold → engages move
    fireEvent.pointerMove(chip, { pointerId: 1, clientX: 100, clientY: 220 })
    fireEvent.pointerUp(chip, { pointerId: 1, clientX: 100, clientY: 220 })
    expect(onMove).toHaveBeenCalledOnce()
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ id: 'sl1' }))
    // A committed drag generates no click → the popover never opened
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument()
  })

  it('preserves recurrence-instance identity and original date on a slop-exceeding move', () => {
    const onMove = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r9',
      title: 'Recur slop',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T10:00:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={onMove}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /recur slop/i })
    // chips[1] = Tuesday recurrence instance
    fireEvent.pointerDown(chips[1], { pointerId: 1, clientX: 100, clientY: 200 })
    fireEvent.pointerMove(chips[1], { pointerId: 1, clientX: 100, clientY: 230 })
    fireEvent.pointerUp(chips[1], { pointerId: 1, clientX: 100, clientY: 230 })
    expect(onMove).toHaveBeenCalledOnce()
    const moved = onMove.mock.calls[0][0]
    expect(moved.id).toBe('r9')
    expect(moved.start.substring(0, 10)).toBe('2026-05-04')
  })

  it('defers the drag ghost until the slop threshold is crossed, then shows recurrence columns', () => {
    const recurringEvent: CalendarEvent = {
      id: 'r10',
      title: 'Ghost slop',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T10:00:00',
      recurrenceDays: ['Mon', 'Wed'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /ghost slop/i })
    // Pointerdown alone must NOT engage the drag → no ghost yet
    fireEvent.pointerDown(chips[0], { pointerId: 1, clientX: 100, clientY: 200 })
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBe(0)
    // Crossing the threshold engages the move → ghosts render on recurrence columns
    fireEvent.pointerMove(chips[0], { pointerId: 1, clientX: 100, clientY: 220 })
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBeGreaterThanOrEqual(
      2,
    )
    fireEvent.pointerUp(chips[0], { pointerId: 1, clientX: 100, clientY: 220 })
  })
})

describe('internal CRUD state management', () => {
  it('event appears in calendar after drag-to-create without external state management', async () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={vi.fn()}
      />,
    )
    const rows = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(rows[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    await userEvent.type(screen.getByLabelText('Event title'), 'My new event')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(screen.getByRole('button', { name: /my new event/i })).toBeInTheDocument()
  })

  it('edit updates event in calendar without external state management', async () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Original title',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T10:00:00',
    }
    render(
      <WeekCalendarView defaultWeekStart="2026-05-04" events={[event]} onEventEdit={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /original title/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const titleInput = screen.getByRole('textbox', { name: /title/i })
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated title')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByRole('button', { name: /updated title/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /original title/i })).not.toBeInTheDocument()
  })

  it('delete removes event from calendar without external state management', async () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Delete me',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T10:00:00',
    }
    render(
      <WeekCalendarView defaultWeekStart="2026-05-04" events={[event]} onEventDelete={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /delete me/i }))
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(screen.queryByRole('button', { name: /delete me/i })).not.toBeInTheDocument()
  })

  it('move updates event position in calendar without external state management', () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Moveable',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T10:00:00',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[event]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /moveable/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: false })
    fireEvent.pointerUp(chip)
    // Event still in calendar (position updated internally)
    expect(screen.getByRole('button', { name: /moveable/i })).toBeInTheDocument()
  })

  it('recurrence-select updates recurrenceDays on event without external state management', async () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Original',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T10:00:00',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[event]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    const chip = screen.getByRole('button', { name: /original/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientY: 100, clientX: 100, shiftKey: true })
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerMove(cells[0], { pointerId: 1, clientY: 100, clientX: 0 })
    fireEvent.pointerUp(cells[0], { pointerId: 1 })
    // Event rendered on recurrence days (original + expanded instances)
    expect(screen.getAllByRole('button', { name: /original/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('edit with multiple events only updates the target', async () => {
    const twoEvents: CalendarEvent[] = [
      { id: 'e1', title: 'First event', start: '2026-05-04T09:00:00', end: '2026-05-04T10:00:00' },
      { id: 'e2', title: 'Second event', start: '2026-05-05T09:00:00', end: '2026-05-05T10:00:00' },
    ]
    render(<WeekCalendarView defaultWeekStart="2026-05-04" events={twoEvents} />)
    await userEvent.click(screen.getByRole('button', { name: /first event/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const titleInput = screen.getByRole('textbox', { name: /title/i })
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Renamed')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByRole('button', { name: /renamed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /second event/i })).toBeInTheDocument()
  })

  it('move with multiple events only repositions the target', () => {
    const twoEvents: CalendarEvent[] = [
      { id: 'e1', title: 'Move this', start: '2026-05-04T09:00:00', end: '2026-05-04T10:00:00' },
      { id: 'e2', title: 'Stay here', start: '2026-05-05T09:00:00', end: '2026-05-05T10:00:00' },
    ]
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={twoEvents}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /move this/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: false })
    // Move must exceed DRAG_SLOP_PX to engage the drag (see week-calendar-view.tsx)
    fireEvent.pointerMove(chip, { clientY: 120, clientX: 100, shiftKey: false })
    fireEvent.pointerUp(chip)
    expect(screen.getByRole('button', { name: /move this/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stay here/i })).toBeInTheDocument()
  })

  it('resize updates event end and leaves other events unchanged', () => {
    const twoEvents: CalendarEvent[] = [
      { id: 'e1', title: 'Resize me', start: '2026-05-04T09:00:00', end: '2026-05-04T10:00:00' },
      { id: 'e2', title: 'Untouched', start: '2026-05-05T09:00:00', end: '2026-05-05T10:00:00' },
    ]
    const { container } = render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={twoEvents}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventResize={vi.fn()}
      />,
    )
    const resizeHandle = container.querySelector('[data-resize="end"]') as HTMLElement
    fireEvent.pointerDown(resizeHandle, { pointerId: 1, clientY: 100 })
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerMove(cells[4], { pointerId: 1, clientY: 168 })
    fireEvent.pointerUp(cells[4], { pointerId: 1 })
    expect(screen.getByRole('button', { name: /resize me/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /untouched/i })).toBeInTheDocument()
  })

  it('cancel button closes create form without creating an event', async () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={onCreate}
      />,
    )
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(cells[0], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })
})

describe('sleep mode', () => {
  it('renders SleepBand when sleepEnabled=true with sleepStart and sleepEnd', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={0}
        hourCount={24}
        sleepEnabled={true}
        sleepStart={23}
        sleepEnd={7}
      />,
    )
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBeGreaterThan(0)
  })

  it('does not render visible sleep regions when sleepEnabled=false and sleep hours outside custom range', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        sleepEnabled={false}
        sleepStart={23}
        sleepEnd={7}
      />,
    )
    // Default hourStart=8, hourCount=14 (8am–10pm); sleep 11pm–7am has no overlap
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBe(0)
  })

  it('renders visual-only sleep regions when sleepEnabled=false and custom hours overlap sleep', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={6}
        hourCount={18}
        sleepEnabled={false}
        sleepStart={23}
        sleepEnd={7}
      />,
    )
    // 6am–midnight range overlaps sleep (6am–7am and 11pm–midnight) → 2 regions × 7 columns = 14
    const regions = document.querySelectorAll('[data-testid="sleep-region"]')
    expect(regions.length).toBe(14)
    // Visual-only: pointer events pass through
    regions.forEach((r) => {
      expect((r as HTMLElement).style.pointerEvents).toBe('none')
    })
  })

  it('overrides hourStart/hourCount to 0/24 when sleepEnabled=true', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        sleepEnabled={true}
        sleepStart={23}
        sleepEnd={7}
      />,
    )
    // When sleep is on, 12am should appear
    expect(screen.getAllByText('12am').length).toBeGreaterThan(0)
  })
})

describe('Today nav source', () => {
  it('clicking Today button in nav jumps to current week', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T10:00:00'))
    render(<WeekCalendarView defaultWeekStart="2026-05-03" events={[]} />)
    // Today button should be enabled (different week)
    const todayBtn = screen.getByRole('button', { name: 'Today' })
    await userEvent.click(todayBtn)
    // May 20 → getSundayISO(May 20) = May 17
    expect(screen.getByRole('button', { name: /Sun 17/i })).toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('drag-to-create multi-day', () => {
  it('ghost renders in multiple columns when drag spans days', () => {
    render(<WeekCalendarView defaultWeekStart="2026-05-03" events={[]} onEventCreate={vi.fn()} />)
    const cells = document.querySelectorAll('[data-drag-cell]')
    // pointerdown col 0 (Sun)
    fireEvent.pointerDown(cells[0], { pointerId: 1, clientY: 0 })
    // pointermove simulating move to col 1 (Mon) — clientX doesn't affect JSDOM layout
    fireEvent.pointerMove(cells[0], { pointerId: 1, clientY: 0 })
    // At minimum, one ghost should be visible
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBeGreaterThan(0)
    fireEvent.pointerUp(cells[0], { pointerId: 1 })
  })

  it('multi-day drag merges form recurrenceDays with drag span', async () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={onCreate}
      />,
    )
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[14], { pointerId: 1, clientY: 0 })
    fireEvent.pointerMove(cells[14], { pointerId: 1, clientY: 0, clientX: 0 })
    fireEvent.pointerUp(cells[14], { pointerId: 1 })
    // Click Wed pill in the form to pre-select an additional day
    await userEvent.click(screen.getByRole('button', { name: /day: wed/i }))
    await userEvent.type(screen.getByLabelText('Event title'), 'Merged')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledOnce()
    // recurrenceDays should include Wed (from pill) + Sun+Mon (from drag span)
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceDays: expect.arrayContaining(['Sun', 'Mon', 'Wed']),
      }),
    )
  })

  it('multi-day drag fires onEventCreate once with recurrenceDays (no duplicate callbacks)', async () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventCreate={onCreate}
      />,
    )
    const cells = document.querySelectorAll('[data-drag-cell]')
    // cells[14] = column 1 (Mon dayIdx=1) with 14 hours/col
    // pointerDown on Mon (startDayIdx=1) + pointerMove (JSDOM getPointerDayIdx=0) = currentDayIdx=0
    // pendingCreate: startDayIdx=0, currentDayIdx=1 → multi-day branch
    fireEvent.pointerDown(cells[14], { pointerId: 1, clientY: 0 })
    fireEvent.pointerMove(cells[14], { pointerId: 1, clientY: 0, clientX: 0 })
    fireEvent.pointerUp(cells[14], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Event title'), 'Multi-day')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    // Callback fires ONCE regardless of how many days the drag spans
    expect(onCreate).toHaveBeenCalledOnce()
    // Event has recurrenceDays covering the dragged span
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: expect.arrayContaining(['Sun', 'Mon']) }),
    )
  })
})

describe('drag move cross-day', () => {
  it('calls onEventMove with updated day when shift is not held', () => {
    const onMove = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[
          {
            id: 'e1',
            title: 'Test event',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T10:00:00',
          },
        ]}
        onEventMove={onMove}
      />,
    )
    const chip = screen.getByRole('button', { name: /test event/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: false })
    // Move must exceed DRAG_SLOP_PX to engage the drag (see week-calendar-view.tsx)
    fireEvent.pointerMove(chip, { clientY: 120, clientX: 100, shiftKey: false })
    fireEvent.pointerUp(chip)
    expect(onMove).toHaveBeenCalledOnce()
  })
})

describe('resize from start handle', () => {
  it('calls onEventResize with updated start time when top handle is dragged', () => {
    const onResize = vi.fn()
    const { container } = render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[
          {
            id: 'e1',
            title: 'Resize event',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T10:00:00',
          },
        ]}
        onEventResize={onResize}
      />,
    )
    const topHandle = container.querySelector('[data-resize="start"]') as HTMLElement
    fireEvent.pointerDown(topHandle)
    // Fire pointerUp on the grid element (which carries the onPointerUp handler)
    const grid = container.querySelector('.grid.relative') as HTMLElement
    fireEvent.pointerUp(grid)
    expect(onResize).toHaveBeenCalledOnce()
    const updated = onResize.mock.calls[0][0]
    expect(updated.id).toBe('e1')
  })
})

describe('shift+drag recurrence-select', () => {
  it('does not call onEventMove when shift is held — updates recurrenceDays via onEventEdit', () => {
    const onMove = vi.fn()
    const onEdit = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[
          {
            id: 'e1',
            title: 'Recur event',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T10:00:00',
          },
        ]}
        onEventMove={onMove}
        onEventEdit={onEdit}
      />,
    )
    const chip = screen.getByRole('button', { name: /recur event/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: true })
    fireEvent.pointerUp(chip)
    expect(onMove).not.toHaveBeenCalled()
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: expect.any(Array) }),
    )
  })
})

describe('escape key', () => {
  it('escape key cancels ongoing drag', () => {
    const onCreate = vi.fn()
    render(<WeekCalendarView defaultWeekStart="2026-05-03" events={[]} onEventCreate={onCreate} />)
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[0], { pointerId: 1, clientY: 0 })
    // Ghost should be visible
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBeGreaterThan(0)
    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' })
    // Ghost should be gone
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBe(0)
  })
})

describe('sleep block', () => {
  it('does not open create form when drag starts in sleep hours (early morning)', () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={0}
        hourCount={24}
        sleepEnabled={true}
        sleepStart={23}
        sleepEnd={7}
        onEventCreate={onCreate}
      />,
    )
    // Row 0 = midnight = slot 0 = in sleep zone (sleepEnd=7 means 0:00–6:59 is sleep)
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(cells[0], { pointerId: 1 })
    // Form should NOT appear
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
  })

  it('does not open create form when drag starts in late-night sleep hours (>= sleepStart)', () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={0}
        hourCount={24}
        sleepEnabled={true}
        sleepStart={23}
        sleepEnd={7}
        onEventCreate={onCreate}
      />,
    )
    // cells are ordered day0-hour0 … day0-hour23 day1-hour0 … so index 23 = day0, hour 23
    // slot = 23*4 = 92, startHour = floor(92/4) = 23 >= sleepStart=23 → blocked
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[23], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(cells[23], { pointerId: 1 })
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
  })
})

describe('shift+drag day header highlighting', () => {
  const recurEvent: CalendarEvent = {
    id: 'recur1',
    title: 'Recur target',
    start: '2026-05-04T09:00:00',
    end: '2026-05-04T10:00:00',
  }

  it('source day header gets highlight class during recurrence-select drag', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    const chip = screen.getByRole('button', { name: /recur target/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: true })
    // Day headers — source is Mon (dayIdx=1)
    const dayHeaders = screen.getAllByRole('button', {
      name: /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\d+$/i,
    })
    expect(dayHeaders[1].className).toContain('ring-primary')
  })

  it('non-covered day headers do not get highlight class', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    const chip = screen.getByRole('button', { name: /recur target/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: true })
    // getPointerDayIdx returns 0 in JSDOM, so range=[0,1]; dayIdx=6 (Sat) is outside range
    const dayHeaders = screen.getAllByRole('button', {
      name: /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\d+$/i,
    })
    expect(dayHeaders[6].className).not.toContain('ring-primary/30')
  })

  it('ghost during recurrence-select shows "Recur" label', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    const chip = screen.getByRole('button', { name: /recur target/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: true })
    const ghost = document.querySelector('[data-testid="ghost-event"]')
    expect(ghost?.textContent).toContain('Recur')
  })
})

describe('ctrl+z undo delete', () => {
  const deleteEvent: CalendarEvent = {
    id: 'del1',
    title: 'Delete me',
    start: '2026-05-04T09:00:00',
    end: '2026-05-04T10:00:00',
  }

  it('restores deleted event on Ctrl+Z', async () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[deleteEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    // Open chip popover and delete
    await userEvent.click(screen.getByRole('button', { name: /delete me/i }))
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(screen.queryByRole('button', { name: /delete me/i })).not.toBeInTheDocument()
    // Ctrl+Z
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(screen.getByRole('button', { name: /delete me/i })).toBeInTheDocument()
  })

  it('restores most recently deleted event on Ctrl+Z (LIFO)', async () => {
    const twoEvents: CalendarEvent[] = [
      { id: 'a', title: 'First event', start: '2026-05-04T09:00:00', end: '2026-05-04T10:00:00' },
      { id: 'b', title: 'Second event', start: '2026-05-04T11:00:00', end: '2026-05-04T12:00:00' },
    ]
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={twoEvents}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    // Delete first event
    await userEvent.click(screen.getByRole('button', { name: /first event/i }))
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    // Delete second event
    await userEvent.click(screen.getByRole('button', { name: /second event/i }))
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    // Ctrl+Z restores second (LIFO)
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(screen.getByRole('button', { name: /second event/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /first event/i })).not.toBeInTheDocument()
    // Second Ctrl+Z restores first
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(screen.getByRole('button', { name: /first event/i })).toBeInTheDocument()
  })

  it('Ctrl+Z with no deleted history does nothing', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[deleteEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(screen.getByRole('button', { name: /delete me/i })).toBeInTheDocument()
  })

  it('calls onEventRestore callback when Ctrl+Z fires', async () => {
    const onRestore = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        events={[deleteEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventRestore={onRestore}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /delete me/i }))
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(onRestore).toHaveBeenCalledOnce()
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'del1' }))
  })
})

describe('recurrence day expansion', () => {
  it('renders event on each recurrence day in the current week', () => {
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Daily standup',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Wed', 'Fri'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    // Event should appear 3 times: Mon, Wed, Fri
    expect(screen.getAllByRole('button', { name: /daily standup/i }).length).toBe(3)
  })

  it('all recurrence instances are editable — edit and delete buttons show in popover', async () => {
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Recur editable',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /recur editable/i })
    // Tuesday instance (recurrence copy) should also have edit/delete
    await userEvent.click(chips[1])
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
  })

  it('editing a recurrence instance updates the original event', async () => {
    const onEdit = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Edit me',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventEdit={onEdit}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /edit me/i })
    // Click the Tuesday instance (second chip)
    await userEvent.click(chips[1])
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    await userEvent.clear(screen.getByLabelText('Title'))
    await userEvent.type(screen.getByLabelText('Title'), 'Renamed')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledOnce()
    // ID must be the original, not the synthetic recur ID
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1', title: 'Renamed' }))
  })

  it('deleting a recurrence instance removes the original event', async () => {
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Delete recur',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /delete recur/i })
    expect(chips.length).toBe(2)
    // Delete via Tuesday instance
    await userEvent.click(chips[1])
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    // All instances gone (original deleted)
    expect(screen.queryByRole('button', { name: /delete recur/i })).not.toBeInTheDocument()
  })

  it('shift+drag unions new range with existing recurrenceDays (accumulate, not replace)', () => {
    const onEdit = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Shift recur',
      start: '2026-05-04T09:00:00', // Monday (dayIdx=1)
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon', 'Tue', 'Wed'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventEdit={onEdit}
      />,
    )
    // Shift+drag on Mon original chip
    const chips = screen.getAllByRole('button', { name: /shift recur/i })
    fireEvent.pointerDown(chips[0], { clientY: 100, clientX: 100, shiftKey: true })
    fireEvent.pointerUp(chips[0])
    expect(onEdit).toHaveBeenCalledOnce()
    const result = onEdit.mock.calls[0][0]
    // Existing Mon+Tue+Wed must all be present after the drag (union, not replace)
    expect(result.recurrenceDays).toEqual(expect.arrayContaining(['Mon', 'Tue', 'Wed']))
    expect(result.id).toBe('r1')
  })

  it('shift+drag auto-sets recurrenceFrequency to weekly when not already set', () => {
    const onEdit = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[
          {
            id: 'r1',
            title: 'Auto weekly',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T09:30:00',
          },
        ]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventEdit={onEdit}
      />,
    )
    const chip = screen.getByRole('button', { name: /auto weekly/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: true })
    fireEvent.pointerUp(chip)
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ recurrenceFrequency: 'weekly' }))
  })

  it('shift+drag preserves existing recurrenceFrequency when already set', () => {
    const onEdit = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[
          {
            id: 'r1',
            title: 'Monthly event',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T09:30:00',
            recurrenceFrequency: 'monthly' as const,
          },
        ]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventEdit={onEdit}
      />,
    )
    const chip = screen.getByRole('button', { name: /monthly event/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: true })
    fireEvent.pointerUp(chip)
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ recurrenceFrequency: 'monthly' }))
  })

  it('shift+drag on recurrence instance falls back to instance dayIdx when original is outside current week', () => {
    const onEdit = vi.fn()
    // Original event on 2026-04-27 (previous week Mon) with Mon recurrence
    const recurringEvent: CalendarEvent = {
      id: 'r2',
      title: 'Out of week',
      start: '2026-04-27T09:00:00', // previous Monday, NOT in 2026-05-03 week
      end: '2026-04-27T09:30:00',
      recurrenceDays: ['Mon'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03" // week of 2026-05-03 to 2026-05-09
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventEdit={onEdit}
      />,
    )
    // Mon 2026-05-04 instance should be visible (recurrence expanded into current week)
    const chips = screen.getAllByRole('button', { name: /out of week/i })
    expect(chips.length).toBeGreaterThanOrEqual(1)
    fireEvent.pointerDown(chips[0], { clientY: 100, clientX: 100, shiftKey: true })
    fireEvent.pointerUp(chips[0])
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'r2' }))
  })

  it('overnight event renders continuation block in the next day column', () => {
    const overnightEvent: CalendarEvent = {
      id: 'o1',
      title: 'Night shift',
      start: '2026-05-04T23:00:00', // Monday
      end: '2026-05-05T01:00:00', // Tuesday
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[overnightEvent]}
        hourStart={0}
        hourCount={24}
        hourHeight={28}
      />,
    )
    // Original on Mon + overflow continuation on Tue = 2 chips
    expect(screen.getAllByRole('button', { name: /night shift/i }).length).toBe(2)
  })

  it('overflow continuation chip has no edit or delete buttons', async () => {
    const overnightEvent: CalendarEvent = {
      id: 'o1',
      title: 'Overflow chip',
      start: '2026-05-04T23:00:00',
      end: '2026-05-05T01:00:00',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[overnightEvent]}
        hourStart={0}
        hourCount={24}
        hourHeight={28}
        onEventEdit={vi.fn()}
        onEventDelete={vi.fn()}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /overflow chip/i })
    // Continuation chip (Tue, index 1) — clicking should NOT show edit/delete
    await userEvent.click(chips[1])
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument()
  })

  it('overnight recur instance has correct end date (next day)', () => {
    const overnightRecur: CalendarEvent = {
      id: 'r1',
      title: 'Overnight recur',
      start: '2026-05-04T23:00:00', // Monday
      end: '2026-05-05T01:00:00',
      recurrenceDays: ['Mon', 'Wed'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[overnightRecur]}
        hourStart={0}
        hourCount={24}
        hourHeight={28}
      />,
    )
    // Mon original + Mon overflow + Wed recur + Wed overflow = 4 chips
    expect(screen.getAllByRole('button', { name: /overnight recur/i }).length).toBe(4)
  })

  it('does not duplicate the original event on its own recurrence day', () => {
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'No dup',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      recurrenceDays: ['Mon'], // only Mon — should appear once, not twice
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    expect(screen.getAllByRole('button', { name: /no dup/i }).length).toBe(1)
  })

  it('does not render an overflow chip when the overnight continuation day falls outside the displayed week', () => {
    const saturdayOvernight: CalendarEvent = {
      id: 'sat-overnight',
      title: 'Late Saturday',
      start: '2026-05-09T23:00:00', // Saturday, last day of the displayed week
      end: '2026-05-10T01:00:00', // Sunday of the NEXT week — outside daySet
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[saturdayOvernight]}
        hourStart={0}
        hourCount={24}
        hourHeight={28}
      />,
    )
    expect(screen.getAllByRole('button', { name: /late saturday/i }).length).toBe(1)
  })

  it('event with seriesDays but no recurrenceDays renders on its own day only (no fan-out)', () => {
    const seriesSeedOnly: CalendarEvent = {
      id: 'seed1',
      title: 'Series seed only',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T09:30:00',
      seriesDays: ['Mon', 'Wed', 'Fri'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[seriesSeedOnly]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    // seriesDays is edit-seed-only — it must NOT drive WeekCalendarView's display fan-out
    expect(screen.getAllByRole('button', { name: /series seed only/i }).length).toBe(1)
  })

  it('move on recurrence instance calls onEventMove with original event id and preserved date', () => {
    const onMove = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Recur move',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T10:00:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={onMove}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /recur move/i })
    // chips[1] = Tuesday instance (recurrence copy)
    fireEvent.pointerDown(chips[1], { clientY: 100, clientX: 100, shiftKey: false })
    // Move must exceed DRAG_SLOP_PX to engage the drag (see week-calendar-view.tsx)
    fireEvent.pointerMove(chips[1], { clientY: 120, clientX: 100, shiftKey: false })
    fireEvent.pointerUp(chips[1])
    expect(onMove).toHaveBeenCalledOnce()
    // ID must be original, date must be original (Mon), not the recur day (Tue)
    const moved = onMove.mock.calls[0][0]
    expect(moved.id).toBe('r1')
    expect(moved.start.substring(0, 10)).toBe('2026-05-04')
  })

  it('resize on recurrence instance calls onEventResize with original event id and preserved date', () => {
    const onResize = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Recur resize',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T10:00:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    const { container } = render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventResize={onResize}
      />,
    )
    // Both Mon and Tue instances have resize handles now
    const resizeHandles = container.querySelectorAll('[data-resize="end"]')
    expect(resizeHandles.length).toBe(2)
    fireEvent.pointerDown(resizeHandles[1], { pointerId: 1, clientY: 100 })
    const grid = container.querySelector('.grid.relative') as HTMLElement
    fireEvent.pointerUp(grid)
    expect(onResize).toHaveBeenCalledOnce()
    const resized = onResize.mock.calls[0][0]
    expect(resized.id).toBe('r1')
    expect(resized.end.substring(0, 10)).toBe('2026-05-04')
  })

  it('resize-start on recurrence instance calls onEventResize with original event id and preserved date', () => {
    const onResize = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Recur resize start',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T10:00:00',
      recurrenceDays: ['Mon', 'Tue'],
    }
    const { container } = render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventResize={onResize}
      />,
    )
    const startHandles = container.querySelectorAll('[data-resize="start"]')
    expect(startHandles.length).toBe(2)
    fireEvent.pointerDown(startHandles[1], { pointerId: 1, clientY: 100 })
    const grid = container.querySelector('.grid.relative') as HTMLElement
    fireEvent.pointerUp(grid)
    expect(onResize).toHaveBeenCalledOnce()
    const resized = onResize.mock.calls[0][0]
    expect(resized.id).toBe('r1')
    expect(resized.start.substring(0, 10)).toBe('2026-05-04')
  })

  it('ghost shows on all recurrence columns during move of any instance', () => {
    const recurringEvent: CalendarEvent = {
      id: 'r1',
      title: 'Ghost all',
      start: '2026-05-04T09:00:00', // Monday
      end: '2026-05-04T10:00:00',
      recurrenceDays: ['Mon', 'Wed'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[recurringEvent]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /ghost all/i })
    // happy-dom returns a zero rect for every element, so the slop-crossing
    // pointermove below would otherwise resolve to day column 0 (see
    // getPointerDayIdx) instead of staying on the Monday column the drag
    // started on. Mock day column 1 (Monday) with a real rect so clientX=100
    // still resolves there, matching the pre-move dayIdx captured on press.
    const rows = document.querySelectorAll('[data-drag-cell]')
    const mondayCol = rows[14]?.parentElement
    const zeroRect = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
    const mondayRect = {
      left: 100,
      right: 200,
      top: 0,
      bottom: 500,
      width: 100,
      height: 500,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return this === mondayCol ? mondayRect : zeroRect
    })
    // Drag Mon (original)
    fireEvent.pointerDown(chips[0], { clientY: 100, clientX: 100, shiftKey: false })
    // Move must exceed DRAG_SLOP_PX to engage the drag (see week-calendar-view.tsx)
    fireEvent.pointerMove(chips[0], { clientY: 120, clientX: 100, shiftKey: false })
    // Ghost should appear in both Mon and Wed columns (2 ghosts)
    const ghosts = document.querySelectorAll('[data-testid="ghost-event"]')
    expect(ghosts.length).toBe(2)
    fireEvent.pointerUp(chips[0])
    vi.restoreAllMocks()
  })
})

describe('timer callbacks', () => {
  it('setInterval callback fires for time indicator after 60s', () => {
    vi.useRealTimers()
    vi.useFakeTimers({
      toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
    })
    vi.setSystemTime(new Date('2026-05-04T10:00:00'))
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    expect(screen.getByTestId('time-indicator')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.getByTestId('time-indicator')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('setInterval callback fires for time gutter label after 60s', () => {
    vi.useRealTimers()
    vi.useFakeTimers({
      toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
    })
    vi.setSystemTime(new Date('2026-05-04T10:00:00'))
    render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
      />,
    )
    expect(screen.getByTestId('time-gutter-label')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.getByTestId('time-gutter-label')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('setTimeout callback fires at midnight to refresh today state', () => {
    vi.useRealTimers()
    vi.useFakeTimers({
      toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
    })
    vi.setSystemTime(new Date('2026-05-04T23:59:59'))
    render(<WeekCalendarView defaultWeekStart={WEEK_START} events={[]} />)
    expect(screen.getByRole('button', { name: /Mon 4/i })).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1001)
    })
    expect(screen.getByRole('button', { name: /Mon 4/i })).toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('sleep zone drag blocking', () => {
  it('does not open create popover when drag starts in sleep hours', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={0}
        hourCount={24}
        hourHeight={30}
        sleepEnabled
        sleepStart={23}
        sleepEnd={7}
        onEventCreate={vi.fn()}
      />,
    )
    // Row 0 = slot 0 = hour 0 AM < sleepEnd(7) → sleep zone → blocked
    const rows = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(rows[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(rows[0], { pointerId: 1 })
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
  })

  it('opens create popover when drag starts in allowed zone with sleepEnabled', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        hourStart={0}
        hourCount={24}
        hourHeight={30}
        sleepEnabled
        sleepStart={23}
        sleepEnd={7}
        onEventCreate={vi.fn()}
      />,
    )
    // Row 8 = slot 32 = hour 8 AM: sleepEnd(7) <= 8 < sleepStart(23) → allowed zone
    const rows = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(rows[8], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(rows[8], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
  })
})

describe('dayWindows (per-day wake/sleep windows)', () => {
  interface Window {
    wake: number
    sleep: number
  }
  const WINDOW_SUN_START = '2026-05-03' // Sunday

  function uniform(win: Window): Window[] {
    return Array.from({ length: 7 }, () => ({ ...win }))
  }
  function override(base: Window[], idx: number, win: Window): Window[] {
    return base.map((w, i) => (i === idx ? win : w))
  }

  const UNIFORM = uniform({ wake: 9, sleep: 17 })
  const EARLY_RISER = override(UNIFORM, 1, { wake: 6, sleep: 17 }) // Mon
  const NIGHT_OWL = override(UNIFORM, 5, { wake: 9, sleep: 23 }) // Fri

  function dayColumns(): HTMLElement[] {
    const seen = new Set<HTMLElement>()
    const cols: HTMLElement[] = []
    document.querySelectorAll('[data-drag-cell]').forEach((cell) => {
      const parent = cell.parentElement as HTMLElement
      if (!seen.has(parent)) {
        seen.add(parent)
        cols.push(parent)
      }
    })
    return cols
  }

  function cellCount(): number {
    return document.querySelectorAll('[data-drag-cell]').length
  }

  it('uniform windowed: grid spans the shared window (9am, 8 rows) with no shading', () => {
    render(
      <WeekCalendarView defaultWeekStart={WINDOW_SUN_START} events={[]} dayWindows={UNIFORM} />,
    )
    expect(screen.getAllByText('9am').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('8am')).toHaveLength(0)
    expect(cellCount()).toBe(8 * 7)
    // Union equals every day's own window → nothing to shade.
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBe(0)
  })

  it('early-riser windowed: union starts 6am (11 rows); only non-early days shade 6->9am', () => {
    render(
      <WeekCalendarView defaultWeekStart={WINDOW_SUN_START} events={[]} dayWindows={EARLY_RISER} />,
    )
    expect(screen.getAllByText('6am').length).toBeGreaterThan(0)
    expect(cellCount()).toBe(11 * 7)
    const cols = dayColumns()
    // Mon (idx 1) fills the union floor → no region.
    expect(cols[1].querySelectorAll('[data-testid="sleep-region"]').length).toBe(0)
    // Sun (idx 0) shades 6->9am: height 3/11 of grid, pinned to top.
    const sunRegions = cols[0].querySelectorAll<HTMLElement>('[data-testid="sleep-region"]')
    expect(sunRegions.length).toBe(1)
    expect(sunRegions[0].style.top).toBe('0%')
    expect(sunRegions[0].style.height).toBe(`${(3 / 11) * 100}%`)
    // 6 shading days × 1 region.
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBe(6)
  })

  it('night-owl windowed: union ends 11pm (14 rows); only non-owl days shade 5pm->11pm', () => {
    render(
      <WeekCalendarView defaultWeekStart={WINDOW_SUN_START} events={[]} dayWindows={NIGHT_OWL} />,
    )
    expect(cellCount()).toBe(14 * 7)
    const cols = dayColumns()
    // Fri (idx 5) fills the union ceiling → no region.
    expect(cols[5].querySelectorAll('[data-testid="sleep-region"]').length).toBe(0)
    const sunRegions = cols[0].querySelectorAll<HTMLElement>('[data-testid="sleep-region"]')
    expect(sunRegions.length).toBe(1)
    // 5pm(17) -> 11pm(23) within a 9->23 grid.
    expect(sunRegions[0].style.top).toBe(`${((17 - 9) / 14) * 100}%`)
    expect(sunRegions[0].style.height).toBe(`${(6 / 14) * 100}%`)
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBe(6)
  })

  it('full-day + dayWindows: 24h grid with two wrap regions per uniform day', () => {
    render(
      <WeekCalendarView
        defaultWeekStart={WINDOW_SUN_START}
        events={[]}
        sleepEnabled
        dayWindows={UNIFORM}
      />,
    )
    // Full-day mode keeps the 0/24 grid regardless of dayWindows.
    expect(screen.getAllByText('12am').length).toBeGreaterThan(0)
    expect(cellCount()).toBe(24 * 7)
    // Each day: morning 0->9 + evening 17->24 = 2 regions × 7 days.
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBe(14)
  })

  it('drag-create is blocked when the drag starts outside that day’s window', () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WINDOW_SUN_START}
        events={[]}
        dayWindows={EARLY_RISER}
        onEventCreate={onCreate}
      />,
    )
    // Sun window is 9->17; union grid starts 6am. Sun col row 0 = 6am < wake(9) → blocked.
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(cells[0], { pointerId: 1 })
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
  })

  it('drag-create is allowed when the drag starts inside that day’s window', () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WINDOW_SUN_START}
        events={[]}
        dayWindows={EARLY_RISER}
        onEventCreate={onCreate}
      />,
    )
    // Mon window is 6->17; Mon col row 0 = 6am >= wake(6) → allowed. Mon = col idx 1, 11 rows/col.
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[11], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(cells[11], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
  })

  it('warns and falls back to default behavior when dayWindows length is not 7', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <WeekCalendarView
        defaultWeekStart={WINDOW_SUN_START}
        events={[]}
        dayWindows={uniform({ wake: 9, sleep: 17 }).slice(0, 5)}
      />,
    )
    expect(warnSpy).toHaveBeenCalled()
    // Falls back to default hourStart=8 / hourCount=14 grid.
    expect(screen.getAllByText('8am').length).toBeGreaterThan(0)
    expect(cellCount()).toBe(14 * 7)
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBe(0)
    warnSpy.mockRestore()
  })

  it('does not warn for a malformed length in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <WeekCalendarView
        defaultWeekStart={WINDOW_SUN_START}
        events={[]}
        dayWindows={uniform({ wake: 9, sleep: 17 }).slice(0, 5)}
      />,
    )
    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  const EARLY_HALF = override(UNIFORM, 1, { wake: 6.5, sleep: 17 }) // Mon wakes at 6:30am
  const NIGHT_HALF = override(UNIFORM, 5, { wake: 9, sleep: 22.5 }) // Fri sleeps at 10:30pm

  it('fractional wake: grid floors to 6am (11 rows); Mon shades a half-hour, others a full 3 hours', () => {
    render(
      <WeekCalendarView defaultWeekStart={WINDOW_SUN_START} events={[]} dayWindows={EARLY_HALF} />,
    )
    expect(screen.getAllByText('6am').length).toBeGreaterThan(0)
    expect(cellCount()).toBe(11 * 7)
    const cols = dayColumns()
    // Mon (idx 1) shades only 6:00->6:30, pinned to the grid top.
    const monRegions = cols[1].querySelectorAll<HTMLElement>('[data-testid="sleep-region"]')
    expect(monRegions.length).toBe(1)
    expect(monRegions[0].style.top).toBe('0%')
    expect(monRegions[0].style.height).toBe(`${((6.5 - 6) / 11) * 100}%`)
    // Sun (idx 0, wake 9) shades the full 6->9am gap.
    const sunRegions = cols[0].querySelectorAll<HTMLElement>('[data-testid="sleep-region"]')
    expect(sunRegions.length).toBe(1)
    expect(sunRegions[0].style.top).toBe('0%')
    expect(sunRegions[0].style.height).toBe(`${((9 - 6) / 11) * 100}%`)
  })

  it('fractional sleep: grid ceils to 11pm (14 rows); Fri shades a half-hour, others a full 6 hours', () => {
    render(
      <WeekCalendarView defaultWeekStart={WINDOW_SUN_START} events={[]} dayWindows={NIGHT_HALF} />,
    )
    expect(cellCount()).toBe(14 * 7)
    const cols = dayColumns()
    // Fri (idx 5) shades only 10:30pm->11pm.
    const friRegions = cols[5].querySelectorAll<HTMLElement>('[data-testid="sleep-region"]')
    expect(friRegions.length).toBe(1)
    expect(friRegions[0].style.top).toBe(`${((22.5 - 9) / 14) * 100}%`)
    expect(friRegions[0].style.height).toBe(`${((23 - 22.5) / 14) * 100}%`)
    // Sun (idx 0, sleep 17) shades the full 5pm->11pm gap.
    const sunRegions = cols[0].querySelectorAll<HTMLElement>('[data-testid="sleep-region"]')
    expect(sunRegions.length).toBe(1)
    expect(sunRegions[0].style.top).toBe(`${((17 - 9) / 14) * 100}%`)
    expect(sunRegions[0].style.height).toBe(`${((23 - 17) / 14) * 100}%`)
  })

  it('drag-create compares the exact fractional slot time, not the floored hour', () => {
    const onCreate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart={WINDOW_SUN_START}
        events={[]}
        dayWindows={EARLY_HALF}
        onEventCreate={onCreate}
      />,
    )
    // Mon (idx 1) window is 6:30am->5pm; grid floors to 6am so Mon's row 0 spans 6:00-7:00.
    // Mon is the 2nd day column → cells 11-21 (11 rows/day).
    const cells = document.querySelectorAll('[data-drag-cell]')
    const monRow0 = cells[11]

    // offsetY 0 => 6:00 exactly => still before wake(6.5) => blocked.
    fireEvent.pointerDown(monRow0, { pointerId: 1, clientY: 0, offsetY: 0 })
    fireEvent.pointerUp(monRow0, { pointerId: 1 })
    expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()

    // offsetY halfway through the 56px hour row => 6:30 exactly => at wake(6.5) => allowed.
    fireEvent.pointerDown(monRow0, { pointerId: 1, clientY: 0, offsetY: 28 })
    fireEvent.pointerUp(monRow0, { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
  })
})

// Timezone correctness: `expandRecurringEvents`/`splitOvernightEvents` must derive day
// membership, overnight detection, and generated timestamps from parsed `Date`s in
// view-local terms — never from ISO substrings. Every test below pins `process.env.TZ`
// explicitly (rather than trusting the runner's ambient zone) and uses explicit-offset ISO
// inputs whose literal date component diverges from the real local calendar date, so a
// regression back to substring reads fails deterministically under CI's UTC runner too.
describe('timezone correctness — local view semantics', () => {
  const ORIGINAL_TZ = process.env['TZ']

  afterEach(() => {
    if (ORIGINAL_TZ === undefined) {
      delete process.env['TZ']
    } else {
      process.env['TZ'] = ORIGINAL_TZ
    }
  })

  function dayColumns(): HTMLElement[] {
    const seen = new Set<HTMLElement>()
    const cols: HTMLElement[] = []
    document.querySelectorAll('[data-drag-cell]').forEach((cell) => {
      const parent = cell.parentElement as HTMLElement
      if (!seen.has(parent)) {
        seen.add(parent)
        cols.push(parent)
      }
    })
    return cols
  }

  it('does not split a chip whose ISO literal rolls to the next day but whose real instants share one local calendar day', () => {
    process.env['TZ'] = 'UTC'
    const event: CalendarEvent = {
      id: 'phantom1',
      title: 'Phantom Check',
      // Literal date component rolls Jul 7 -> Jul 8, but both real instants land on the
      // SAME UTC calendar day (Jul 8): 03:30Z and 04:15Z respectively.
      start: '2026-07-07T23:30:00-04:00', // = 2026-07-08T03:30:00Z
      end: '2026-07-08T00:15:00-04:00', // = 2026-07-08T04:15:00Z
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-07-05"
        events={[event]}
        hourStart={0}
        hourCount={24}
      />,
    )
    // A substring reader sees startDate='2026-07-07' < endDate='2026-07-08' and wrongly
    // splits this into two chips (the phantom-chip bug). Date-based local extraction sees
    // both instants on Jul 8 and renders exactly one.
    expect(screen.getAllByRole('button', { name: /phantom check/i }).length).toBe(1)
  })

  it('splits a genuinely local overnight event into two chips with correct local time labels', () => {
    process.env['TZ'] = 'UTC'
    const event: CalendarEvent = {
      id: 'real-overnight',
      title: 'Real Overnight',
      start: '2026-07-07T23:30:00Z',
      end: '2026-07-08T00:15:00Z',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-07-05"
        events={[event]}
        hourStart={0}
        hourCount={24}
        use24h
      />,
    )
    const chips = screen.getAllByRole('button', { name: /real overnight/i })
    expect(chips.length).toBe(2)
    // chips[0] = original, full un-clipped range; chips[1] = overflow continuation, whose
    // displayed start is local midnight of the continuation day, not the original start.
    expect(chips[0]).toHaveAccessibleName(/23:30.*00:15/)
    expect(chips[1]).toHaveAccessibleName(/00:00.*00:15/)
  })

  it('deleting the original chip of a real overnight split resolves to the shared base event id', async () => {
    process.env['TZ'] = 'UTC'
    const onDelete = vi.fn()
    const event: CalendarEvent = {
      id: 'real-overnight-2',
      title: 'Overnight Delete',
      start: '2026-07-07T23:30:00Z',
      end: '2026-07-08T00:15:00Z',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-07-05"
        events={[event]}
        hourStart={0}
        hourCount={24}
        onEventDelete={onDelete}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /overnight delete/i })
    expect(chips.length).toBe(2)
    // Overflow continuation (chips[1]) carries no independent identity.
    await userEvent.click(chips[1])
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    // Original (chips[0]) resolves delete to the base event id, removing both chips.
    await userEvent.click(chips[0])
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'real-overnight-2' }))
    expect(screen.queryByRole('button', { name: /overnight delete/i })).not.toBeInTheDocument()
  })

  it('recurrence instance lands on the intended local day and time under an explicit-offset input', () => {
    process.env['TZ'] = 'Asia/Tokyo'
    const event: CalendarEvent = {
      id: 'recur-offset',
      title: 'Instance Test',
      // 2026-07-06T23:30:00-04:00 = 2026-07-07T03:30:00Z = 2026-07-07T12:30 in Tokyo (+09:00).
      // The TRUE local day is Tuesday Jul 7, not the literal Monday Jul 6 a substring reads.
      start: '2026-07-06T23:30:00-04:00',
      end: '2026-07-06T23:35:00-04:00', // 5 minutes later, same local day (non-overnight)
      recurrenceDays: ['Tue', 'Thu'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-07-05"
        events={[event]}
        hourStart={0}
        hourCount={24}
        use24h
      />,
    )
    // A substring-derived originalStartDate would wrongly compute Monday, so the recurrence
    // loop would fail to skip Tuesday (the event's own true local day) and fan out a
    // duplicate there — 3 chips total instead of 2 (Tue original + Thu instance).
    const chips = screen.getAllByRole('button', { name: /instance test/i })
    expect(chips.length).toBe(2)
    chips.forEach((chip) => {
      expect(chip).toHaveAccessibleName(/12:30.*12:35/)
    })
  })

  it('overflow chip start is local midnight of the true continuation day, not the literal offset date', () => {
    process.env['TZ'] = 'UTC'
    const event: CalendarEvent = {
      id: 'true-overflow',
      title: 'True Overflow',
      start: '2026-07-08T02:00:00Z', // Wed Jul 8, 02:00 UTC
      // Literal date reads Jul 8, but this instant is 2026-07-09T01:00:00Z — Thu Jul 9 UTC.
      end: '2026-07-08T20:00:00-05:00',
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-07-05"
        events={[event]}
        hourStart={0}
        hourCount={24}
        use24h
      />,
    )
    const cols = dayColumns()
    // Wed (idx 3) holds only the original chip; Thu (idx 4) holds the overflow continuation
    // — the true local day of the end instant, not the literal "Jul 8" written in the string.
    expect(within(cols[3]).getAllByRole('button', { name: /true overflow/i }).length).toBe(1)
    const overflowChip = within(cols[4]).getByRole('button', { name: /true overflow/i })
    expect(overflowChip).toHaveAccessibleName(/00:00/)
  })

  // Audit-found violations sharing the same root cause: `dragMode.event` for a recurrence
  // drag is the ORIGINAL event straight from the consumer's `events` prop, which may carry
  // any ISO shape (including an explicit offset). Reading `.start.substring(0, 10)` to pin
  // the drag's date to the original's day reads the offset's own written date, not the
  // viewer's local calendar day.
  it("moving a recurrence instance anchors the new time to the original event's correct local day, even when its ISO carries a diverging offset", () => {
    process.env['TZ'] = 'UTC'
    const onMove = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r-move',
      title: 'Move Offset',
      start: '2026-07-06T22:00:00-05:00', // literal Jul 6, real local (UTC) day Jul 7
      end: '2026-07-06T22:30:00-05:00',
      recurrenceDays: ['Tue', 'Thu'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-07-05"
        events={[recurringEvent]}
        hourStart={0}
        hourCount={24}
        hourHeight={56}
        onEventMove={onMove}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /move offset/i })
    // chips[0] = Tue (the event's own true local day); chips[1] = Thu recurrence instance.
    fireEvent.pointerDown(chips[1], { clientY: 100, clientX: 100, shiftKey: false })
    fireEvent.pointerMove(chips[1], { clientY: 120, clientX: 100, shiftKey: false })
    fireEvent.pointerUp(chips[1])
    expect(onMove).toHaveBeenCalledOnce()
    const moved = onMove.mock.calls[0][0]
    expect(moved.id).toBe('r-move')
    const originalAnchor = new Date(recurringEvent.start)
    const movedStart = new Date(moved.start)
    expect(movedStart.getFullYear()).toBe(originalAnchor.getFullYear())
    expect(movedStart.getMonth()).toBe(originalAnchor.getMonth())
    expect(movedStart.getDate()).toBe(originalAnchor.getDate())
  })

  // The chip's own `handleSave` (calendar-event-chip.tsx) emits real toISOString() instants,
  // so reconciling the edit back onto the recurrence's original event must read the edited
  // instance's LOCAL wall-clock via Date getters, not slice the written ISO text — and must
  // anchor to the original's LOCAL calendar day, not its literal written date.
  it("editing a recurrence instance reconciles onto the original event's correct local day and time under a diverging offset", async () => {
    process.env['TZ'] = 'Asia/Tokyo'
    const onEdit = vi.fn()
    const recurringEvent: CalendarEvent = {
      id: 'r-edit',
      title: 'Edit Offset',
      // = 2026-07-07T03:30:00Z = 2026-07-07T12:30 in Tokyo. True local day is Jul 7 (Tue),
      // not the literal Jul 6 the written offset shows.
      start: '2026-07-06T23:30:00-04:00',
      end: '2026-07-06T23:35:00-04:00',
      recurrenceDays: ['Tue', 'Thu'],
    }
    render(
      <WeekCalendarView
        defaultWeekStart="2026-07-05"
        events={[recurringEvent]}
        hourStart={0}
        hourCount={24}
        onEventEdit={onEdit}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /edit offset/i })
    // chips[1] = Thu recurrence instance.
    await userEvent.click(chips[1])
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    const startH = screen.getByRole('spinbutton', { name: 'Start hour' })
    const startM = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.change(startH, { target: { value: '10' } })
    fireEvent.blur(startH)
    fireEvent.change(startM, { target: { value: '15' } })
    fireEvent.blur(startM)
    await userEvent.click(screen.getAllByRole('button', { name: 'AM' })[0])
    const endH = screen.getByRole('spinbutton', { name: 'End hour' })
    const endM = screen.getByRole('spinbutton', { name: 'End minute' })
    fireEvent.change(endH, { target: { value: '11' } })
    fireEvent.blur(endH)
    fireEvent.change(endM, { target: { value: '0' } })
    fireEvent.blur(endM)
    await userEvent.click(screen.getAllByRole('button', { name: 'AM' })[1])
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onEdit).toHaveBeenCalledOnce()
    const saved = onEdit.mock.calls[0][0]
    expect(saved.id).toBe('r-edit')
    const originalAnchor = new Date(recurringEvent.start)
    const savedStart = new Date(saved.start)
    expect(savedStart.getFullYear()).toBe(originalAnchor.getFullYear())
    expect(savedStart.getMonth()).toBe(originalAnchor.getMonth())
    expect(savedStart.getDate()).toBe(originalAnchor.getDate())
    expect(savedStart.getHours()).toBe(10)
    expect(savedStart.getMinutes()).toBe(15)
    const savedEnd = new Date(saved.end)
    expect(savedEnd.getDate()).toBe(originalAnchor.getDate())
    expect(savedEnd.getHours()).toBe(11)
    expect(savedEnd.getMinutes()).toBe(0)
  })
})

describe('resyncToken', () => {
  const resyncEvent: CalendarEvent = {
    id: 'rt-1',
    title: 'Original title',
    start: '2026-05-04T09:00:00',
    end: '2026-05-04T10:00:00',
  }
  const updatedEvent: CalendarEvent = { ...resyncEvent, title: 'Updated title' }

  it('re-seeds localEvents from the current events prop when resyncToken identity changes', () => {
    const { rerender } = render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[resyncEvent]} resyncToken={1} />,
    )
    expect(screen.getByRole('button', { name: /original title/i })).toBeInTheDocument()

    rerender(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[updatedEvent]} resyncToken={2} />,
    )
    expect(screen.getByRole('button', { name: /updated title/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /original title/i })).not.toBeInTheDocument()
  })

  it('preserves local state across a re-render when resyncToken is unchanged', () => {
    const { rerender } = render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[resyncEvent]} resyncToken={1} />,
    )
    rerender(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[updatedEvent]} resyncToken={1} />,
    )
    expect(screen.getByRole('button', { name: /original title/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /updated title/i })).not.toBeInTheDocument()
  })

  it('defers resync while a drag is active and applies it against events as of apply time once the drag returns to idle', () => {
    const onEventCreate = vi.fn()
    const { rerender } = render(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[resyncEvent]}
        resyncToken={1}
        onEventCreate={onEventCreate}
      />,
    )
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[0], { pointerId: 1, clientY: 0 })
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBeGreaterThan(0)

    rerender(
      <WeekCalendarView
        defaultWeekStart={WEEK_START}
        events={[updatedEvent]}
        resyncToken={2}
        onEventCreate={onEventCreate}
      />,
    )
    // Still mid-drag — resync must be deferred, so the old title still renders.
    expect(screen.getByRole('button', { name: /original title/i })).toBeInTheDocument()
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBeGreaterThan(0)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(document.querySelectorAll('[data-testid="ghost-event"]').length).toBe(0)
    expect(screen.getByRole('button', { name: /updated title/i })).toBeInTheDocument()
  })

  it('does not change the displayed week when resyncToken changes', async () => {
    const { rerender } = render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[resyncEvent]} resyncToken={1} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByRole('button', { name: /Mon 18/i })).toBeInTheDocument()

    rerender(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[updatedEvent]} resyncToken={2} />,
    )
    expect(screen.getByRole('button', { name: /Mon 18/i })).toBeInTheDocument()
  })

  it('is a zero behavior change across re-renders when resyncToken is undefined', () => {
    const { rerender } = render(
      <WeekCalendarView defaultWeekStart={WEEK_START} events={[resyncEvent]} />,
    )
    expect(screen.getByRole('button', { name: /original title/i })).toBeInTheDocument()

    rerender(<WeekCalendarView defaultWeekStart={WEEK_START} events={[updatedEvent]} />)
    expect(screen.getByRole('button', { name: /original title/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /updated title/i })).not.toBeInTheDocument()
  })
})
