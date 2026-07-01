import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
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

  it('interactive=false sets pointer-events none (visual-only mode)', () => {
    const { container } = render(
      <div style={{ position: 'relative', height: '800px' }}>
        <SleepBand
          sleepStart={23}
          sleepEnd={7}
          hourStart={0}
          hourCount={24}
          hourHeight={30}
          interactive={false}
        />
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
        <SleepBand
          sleepStart={23}
          sleepEnd={7}
          hourStart={6}
          hourCount={18}
          hourHeight={36}
          interactive={false}
        />
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
    expect(chip.style.top).toBe('0%')
    // Only the visible 1h (8–9am) portion shows — 1/14 ≈ 7.14%
    expect(parseFloat(chip.style.height)).toBeCloseTo(7.14, 1)
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
    expect(parseFloat(chip.style.top)).toBeCloseTo(92.86, 1)
    // visible portion: 9pm–10pm = 1h → 1/14*100 ≈ 7.14%
    expect(parseFloat(chip.style.height)).toBeCloseTo(7.14, 1)
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
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
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
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
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
    // Drag Mon (original)
    fireEvent.pointerDown(chips[0], { clientY: 100, clientX: 100, shiftKey: false })
    // Ghost should appear in both Mon and Wed columns (2 ghosts)
    const ghosts = document.querySelectorAll('[data-testid="ghost-event"]')
    expect(ghosts.length).toBe(2)
    fireEvent.pointerUp(chips[0])
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
