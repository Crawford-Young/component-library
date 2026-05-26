import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CalendarEventChip } from './calendar-event-chip'
import type { CalendarEvent, CalendarEventColor } from './calendar-event-chip'

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

  it('location rendered in popover when present', async () => {
    const withLoc = { ...event, location: 'Zoom' }
    render(<CalendarEventChip event={withLoc} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByText('Zoom')).toBeInTheDocument()
  })

  it('location omitted from popover when absent', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByText('Zoom')).not.toBeInTheDocument()
  })

  it('shows location on chip when height > 10% and location present', () => {
    const tallStyle = { ...style, height: '12%' }
    const withLoc = { ...event, location: 'Building A' }
    render(<CalendarEventChip event={withLoc} style={tallStyle} />)
    expect(screen.getByText('Building A')).toBeInTheDocument()
  })

  it('hides location on chip when height <= 10%', () => {
    const medStyle = { ...style, height: '8%' }
    const withLoc = { ...event, location: 'Building A' }
    render(<CalendarEventChip event={withLoc} style={medStyle} />)
    expect(screen.queryByText('Building A')).not.toBeInTheDocument()
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

  it('clicking edit button opens inline edit form', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument()
  })

  it('saving inline edit calls onEdit with updated event', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const titleInput = screen.getByRole('textbox', { name: /title/i })
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated standup')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated standup' }))
  })

  it('canceling edit form returns to view mode', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByText('9:00–9:30 AM')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('edit form has color swatch buttons for all 15 colors', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const swatches = screen.getAllByRole('button', { name: /^color:/i })
    expect(swatches).toHaveLength(15)
  })

  it('selecting a color swatch marks it as pressed', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const blueBtn = screen.getByRole('button', { name: /color: blue/i })
    await userEvent.click(blueBtn)
    expect(blueBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('closing popover resets edit state', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    expect(screen.getByText('9:00–9:30 AM')).toBeInTheDocument()
  })

  it('edit form allows changing location and description', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.type(screen.getByRole('textbox', { name: /location/i }), 'Zoom')
    await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Daily sync')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'Zoom', description: 'Daily sync' }),
    )
  })

  it('edit form allows changing start and end time', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const startInput = screen.getByLabelText(/^start$/i)
    const endInput = screen.getByLabelText(/^end$/i)
    await userEvent.clear(startInput)
    await userEvent.type(startInput, '10:00')
    await userEvent.clear(endInput)
    await userEvent.type(endInput, '11:00')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ start: '2026-05-04T10:00:00', end: '2026-05-04T11:00:00' }),
    )
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

  describe('expanded mode', () => {
    it('shows full time range in chip when expanded', () => {
      const shortStyle = { ...style, height: '2%' }
      render(<CalendarEventChip event={event} style={shortStyle} expanded />)
      const chip = screen.getByRole('button', { name: /team standup/i })
      expect(chip).toHaveTextContent('9:00–9:30 AM')
    })

    it('does not show bare start time when expanded', () => {
      render(<CalendarEventChip event={event} style={style} expanded />)
      expect(screen.queryByText('9:00')).not.toBeInTheDocument()
    })

    it('shows location in chip when expanded and location present', () => {
      const withLoc = { ...event, location: 'Zoom' }
      render(<CalendarEventChip event={withLoc} style={style} expanded />)
      const chip = screen.getByRole('button', { name: /team standup/i })
      expect(chip).toHaveTextContent('Zoom')
    })

    it('shows description in chip when expanded and description present', () => {
      const withDesc = { ...event, description: 'Daily sync' }
      render(<CalendarEventChip event={withDesc} style={style} expanded />)
      const chip = screen.getByRole('button', { name: /team standup/i })
      expect(chip).toHaveTextContent('Daily sync')
    })

    it('does not show description in chip when not expanded', () => {
      const withDesc = { ...event, description: 'Daily sync' }
      render(<CalendarEventChip event={withDesc} style={style} />)
      const chip = screen.getByRole('button', { name: /team standup/i })
      expect(chip).not.toHaveTextContent('Daily sync')
    })
  })

  describe('color variants', () => {
    const cases: Array<[CalendarEventColor, string]> = [
      ['indigo', 'bg-indigo-600'],
      ['teal', 'bg-teal-700'],
      ['orange', 'bg-orange-700'],
      ['rose', 'bg-rose-600'],
      ['sky', 'bg-sky-700'],
      ['fuchsia', 'bg-fuchsia-700'],
      ['lime', 'bg-lime-700'],
      ['amber', 'bg-amber-700'],
      ['cyan', 'bg-cyan-700'],
    ]
    it.each(cases)('applies %s color class to chip', (color, expectedClass) => {
      const coloredEvent: CalendarEvent = { ...event, color }
      render(<CalendarEventChip event={coloredEvent} style={style} />)
      expect(screen.getAllByRole('button', { name: /team standup/i })[0].className).toContain(
        expectedClass,
      )
    })
  })
})

describe('recurrence fields in edit form', () => {
  const eventWithRecurrence: CalendarEvent = {
    id: 'r1',
    title: 'Morning run',
    start: '2026-05-04T07:00:00',
    end: '2026-05-04T07:30:00',
    recurrenceDays: ['Mon', 'Wed', 'Fri'],
    recurrenceFrequency: 'weekly',
  }

  it('edit form shows day pill toggles', async () => {
    render(
      <CalendarEventChip event={eventWithRecurrence} style={style} onEdit={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('group', { name: /recurrence days/i })).toBeInTheDocument()
  })

  it('day pills are pre-checked based on recurrenceDays', async () => {
    render(
      <CalendarEventChip event={eventWithRecurrence} style={style} onEdit={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('button', { name: 'Day: Mon' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Tue' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('frequency select shows current recurrenceFrequency', async () => {
    render(
      <CalendarEventChip event={eventWithRecurrence} style={style} onEdit={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect((screen.getByLabelText('Repeat') as HTMLSelectElement).value).toBe('weekly')
  })

  it('saving edit form calls onEdit with recurrence fields', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceDays: ['Mon', 'Wed', 'Fri'],
        recurrenceFrequency: 'weekly',
      }),
    )
  })
})

describe('resize handle', () => {
  it('renders resize handle in chip', () => {
    const { container } = render(<CalendarEventChip event={event} style={style} />)
    expect(container.querySelector('[data-resize="true"]')).toBeInTheDocument()
  })

  it('pointerdown on resize handle calls onResizeStart', () => {
    const onResizeStart = vi.fn()
    const { container } = render(
      <CalendarEventChip event={event} style={style} onResizeStart={onResizeStart} />,
    )
    const handle = container.querySelector('[data-resize="true"]') as HTMLElement
    fireEvent.pointerDown(handle)
    expect(onResizeStart).toHaveBeenCalledWith(event)
  })

  it('pointerdown on chip body calls onMoveStart with clientY', () => {
    const onMoveStart = vi.fn()
    render(<CalendarEventChip event={event} style={style} onMoveStart={onMoveStart} />)
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { clientY: 250 })
    expect(onMoveStart).toHaveBeenCalledWith(event, 250)
  })
})
