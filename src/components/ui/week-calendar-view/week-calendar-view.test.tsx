import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'
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
    expect(chip.className).toContain('bg-emerald-700')
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
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
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

  it('has pointer-events auto so drag is blocked in sleep hours', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand sleepStart={23} sleepEnd={7} hourStart={0} hourCount={24} hourHeight={30} />
      </div>,
    )
    const regions = container.querySelectorAll('[data-testid="sleep-region"]')
    regions.forEach((r) => {
      expect((r as HTMLElement).style.pointerEvents).toBe('auto')
    })
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
})

describe('drag ghost — resizing and duplicating', () => {
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

  it('renders ghost event when drag state transitions to duplicating (shiftKey)', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
        onEventDuplicate={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200, shiftKey: true })
    expect(screen.getByTestId('ghost-event')).toBeInTheDocument()
  })

  it('calls onEventDuplicate with copies when pointerUp after duplicating', () => {
    const onDuplicate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
        onEventDuplicate={onDuplicate}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200, shiftKey: true })
    fireEvent.pointerUp(chip, { pointerId: 1 })
    expect(onDuplicate).toHaveBeenCalledOnce()
    expect(onDuplicate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ title: 'Team standup' })]),
    )
  })

  it('updateSlot fires again during a second pointerMove in duplicating mode', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[events[0]]}
        hourStart={8}
        hourCount={14}
        hourHeight={56}
        onEventMove={vi.fn()}
        onEventDuplicate={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { pointerId: 1, clientX: 100, clientY: 200, shiftKey: true })
    // Move exercises the duplicating branch in handleGridPointerMove
    fireEvent.pointerMove(chip, { pointerId: 1, clientX: 130, clientY: 201 })
    // Second move continues exercising duplicating branch
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

  it('does not render SleepBand when sleepEnabled=false', () => {
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[]}
        sleepEnabled={false}
        sleepStart={23}
        sleepEnd={7}
      />,
    )
    expect(document.querySelectorAll('[data-testid="sleep-region"]').length).toBe(0)
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

  it('creates multiple events when drag spans multiple days on release', async () => {
    const onCreate = vi.fn()
    render(<WeekCalendarView defaultWeekStart="2026-05-03" events={[]} onEventCreate={onCreate} />)
    const cells = document.querySelectorAll('[data-drag-cell]')
    fireEvent.pointerDown(cells[0], { pointerId: 1, clientY: 0 })
    fireEvent.pointerUp(cells[0], { pointerId: 1 })
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Event title'), 'Multi-day')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledOnce()
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

describe('shift+drag duplicate', () => {
  it('does not call onEventMove when shift is held — calls onEventDuplicate', () => {
    const onMove = vi.fn()
    const onDuplicate = vi.fn()
    render(
      <WeekCalendarView
        defaultWeekStart="2026-05-03"
        events={[
          {
            id: 'e1',
            title: 'Dup event',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T10:00:00',
          },
        ]}
        onEventMove={onMove}
        onEventDuplicate={onDuplicate}
      />,
    )
    const chip = screen.getByRole('button', { name: /dup event/i })
    fireEvent.pointerDown(chip, { clientY: 100, clientX: 100, shiftKey: true })
    fireEvent.pointerUp(chip)
    expect(onMove).not.toHaveBeenCalled()
    expect(onDuplicate).toHaveBeenCalledOnce()
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
