import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CalendarEvent } from './week-calendar-view'
import { WeekCalendarView } from './week-calendar-view'

const WEEK_START = '2026-05-04' // Monday

const events = [
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

describe('WeekCalendarView', () => {
  it('renders week calendar region', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={[]} />)
    expect(screen.getByRole('region', { name: 'Week calendar' })).toBeInTheDocument()
  })

  it('renders day column headers', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={[]} />)
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('renders date numbers in headers', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={[]} />)
    // Monday 4th May 2026
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renders hour labels', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={[]} />)
    // Default hourStart=8 → '8am'
    expect(screen.getAllByText('8am').length).toBeGreaterThan(0)
  })

  it('renders events by title', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={events} />)
    expect(screen.getByLabelText('Team standup')).toBeInTheDocument()
    expect(screen.getByLabelText('Design review')).toBeInTheDocument()
  })

  it('applies default event color class when color prop omitted', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={[events[0]]} />)
    const chip = screen.getByLabelText('Team standup')
    expect(chip.className).toContain('bg-accent')
  })

  it('applies named color class when color prop provided', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={[events[1]]} />)
    const chip = screen.getByLabelText('Design review')
    expect(chip.className).toContain('bg-blue-600')
  })

  it('renders correct number of hour rows with custom hourCount', () => {
    render(<WeekCalendarView weekStart={WEEK_START} events={[]} hourStart={9} hourCount={8} />)
    // 9am should appear, 8am should not
    expect(screen.getAllByText('9am').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('8am')).toHaveLength(0)
  })

  it('only renders events that fall within the displayed week', () => {
    const outsideEvent = {
      id: '3',
      title: 'Outside event',
      start: '2026-05-11T10:00:00',
      end: '2026-05-11T11:00:00',
    }
    render(<WeekCalendarView weekStart={WEEK_START} events={[outsideEvent]} />)
    expect(screen.queryByLabelText('Outside event')).not.toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <WeekCalendarView weekStart={WEEK_START} events={[]} className="custom-class" />,
    )
    expect((container.firstChild as HTMLElement).className).toContain('custom-class')
  })

  it('applies custom hourHeight inline style to hour rows', () => {
    const { container } = render(
      <WeekCalendarView weekStart={WEEK_START} events={[]} hourHeight={80} />,
    )
    const rowsWithStyle = Array.from(container.querySelectorAll('div')).filter(
      (el) => (el as HTMLElement).style.height === '80px',
    )
    expect(rowsWithStyle.length).toBeGreaterThan(0)
  })

  it('calls onEventClick with the event when chip clicked', async () => {
    const handler = vi.fn()
    render(<WeekCalendarView weekStart={WEEK_START} events={[events[0]]} onEventClick={handler} />)
    await userEvent.click(screen.getByRole('button', { name: 'Team standup' }))
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith(events[0])
  })

  it('renders custom renderEvent output instead of default chip', () => {
    const renderEvent = (e: CalendarEvent) => (
      <span data-testid="custom-chip">{e.title}-custom</span>
    )
    render(
      <WeekCalendarView weekStart={WEEK_START} events={[events[0]]} renderEvent={renderEvent} />,
    )
    expect(screen.getByTestId('custom-chip')).toBeInTheDocument()
    expect(screen.getByTestId('custom-chip').textContent).toBe('Team standup-custom')
  })
})
