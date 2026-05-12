import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CalendarEventChip } from './calendar-event-chip'
import type { CalendarEvent } from './calendar-event-chip'

const event: CalendarEvent = {
  id: '1',
  title: 'Team standup',
  start: '2026-05-04T09:00:00',
  end: '2026-05-04T09:30:00',
}

const style: React.CSSProperties = {
  position: 'absolute',
  top: '10%',
  height: '10%',
  left: 'calc(0% + 1px)',
  width: 'calc(100% - 2px)',
}

describe('CalendarEventChip', () => {
  it('renders chip with event title', () => {
    render(<CalendarEventChip event={event} style={style} />)
    expect(screen.getByText('Team standup')).toBeInTheDocument()
  })

  it('chip has aria-label with title and time range', () => {
    render(<CalendarEventChip event={event} style={style} />)
    expect(screen.getByRole('button', { name: /team standup 9:00–9:30 am/i })).toBeInTheDocument()
  })

  it('popover opens on click and shows time range', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByText('9:00–9:30 AM')).toBeInTheDocument()
  })

  it('popover shows title in semibold', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    const titles = screen.getAllByText('Team standup')
    expect(titles.length).toBeGreaterThanOrEqual(2)
  })

  it('description rendered when present', async () => {
    const withDesc = { ...event, description: 'Daily sync' }
    render(<CalendarEventChip event={withDesc} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByText('Daily sync')).toBeInTheDocument()
  })

  it('description omitted when absent', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByText('Daily sync')).not.toBeInTheDocument()
  })

  it('edit button rendered when onEdit provided', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('edit button absent when onEdit not provided', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
  })

  it('onEdit called and popover closes when edit button clicked', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(event)
    expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument()
  })

  it('delete button rendered when onDelete provided', async () => {
    render(<CalendarEventChip event={event} style={style} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('delete button absent when onDelete not provided', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('onDelete called and popover closes when delete button clicked', async () => {
    const onDelete = vi.fn()
    render(<CalendarEventChip event={event} style={style} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith(event)
    expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument()
  })

  it('renderPopover slot rendered when provided', async () => {
    render(
      <CalendarEventChip
        event={event}
        style={style}
        renderPopover={() => <span>custom slot</span>}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByText('custom slot')).toBeInTheDocument()
  })

  it('shows start time when height > 4%', () => {
    const tallStyle = { ...style, height: '10%' }
    render(<CalendarEventChip event={event} style={tallStyle} />)
    expect(screen.getByText('9:00')).toBeInTheDocument()
  })

  it('hides start time when height <= 4%', () => {
    const shortStyle = { ...style, height: '3%' }
    render(<CalendarEventChip event={event} style={shortStyle} />)
    expect(screen.queryByText('9:00')).not.toBeInTheDocument()
  })

  it('fires onClick prop when chip clicked', async () => {
    const onClick = vi.fn()
    render(<CalendarEventChip event={event} style={style} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(onClick).toHaveBeenCalledWith(event)
  })

  it('fires onClick on keydown Enter', () => {
    const onClick = vi.fn()
    const { getByRole } = render(
      <CalendarEventChip event={event} style={style} onClick={onClick} />,
    )
    const btn = getByRole('button', { name: /team standup/i })
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(onClick).toHaveBeenCalledWith(event)
  })

  it('fires onClick on keydown Space', () => {
    const onClick = vi.fn()
    const { getByRole } = render(
      <CalendarEventChip event={event} style={style} onClick={onClick} />,
    )
    const btn = getByRole('button', { name: /team standup/i })
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(onClick).toHaveBeenCalledWith(event)
  })

  it('formats cross-period time range correctly', async () => {
    const crossEvent: CalendarEvent = {
      id: '2',
      title: 'Long meeting',
      start: '2026-05-04T10:00:00',
      end: '2026-05-04T14:00:00',
    }
    render(<CalendarEventChip event={crossEvent} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /long meeting/i }))
    expect(screen.getByText('10:00 AM–2:00 PM')).toBeInTheDocument()
  })

  it('formats PM-only time range correctly', async () => {
    const pmEvent: CalendarEvent = {
      id: '3',
      title: 'PM meeting',
      start: '2026-05-04T13:00:00',
      end: '2026-05-04T14:00:00',
    }
    render(<CalendarEventChip event={pmEvent} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /pm meeting/i }))
    expect(screen.getByText('1:00–2:00 PM')).toBeInTheDocument()
  })

  it('formats midnight (12 AM) correctly', async () => {
    const midnightEvent: CalendarEvent = {
      id: '4',
      title: 'Midnight event',
      start: '2026-05-04T00:00:00',
      end: '2026-05-04T00:30:00',
    }
    render(<CalendarEventChip event={midnightEvent} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /midnight event/i }))
    expect(screen.getByText('12:00–12:30 AM')).toBeInTheDocument()
  })

  it('hides start time when height is non-string (numeric)', () => {
    const numericHeightStyle = { ...style, height: 5 }
    render(<CalendarEventChip event={event} style={numericHeightStyle as React.CSSProperties} />)
    expect(screen.queryByText('9:00')).not.toBeInTheDocument()
  })
})
