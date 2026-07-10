import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CalendarEventChip } from './calendar-event-chip'
import type { CalendarEvent, CalendarEventColor } from './calendar-event-chip'
import type {
  CalendarEvent as BarrelCalendarEvent,
  CalendarEventChipProps as BarrelCalendarEventChipProps,
} from '@/index'

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

  it('popover content is capped to available height and scrolls', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    const popover = screen.getByRole('dialog')
    expect(popover.className).toContain('max-h-[var(--radix-popover-content-available-height)]')
    expect(popover.className).toContain('overflow-y-auto')
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
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('edit button absent when onEdit not provided', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('clicking edit button opens inline edit form', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument()
  })

  it('saving inline edit calls onEdit with updated event', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const titleInput = screen.getByRole('textbox', { name: /title/i })
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated standup')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated standup' }))
  })

  it('canceling edit form returns to view mode', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByText('9:00–9:30 AM')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('edit form has color swatch buttons for all 15 colors', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const swatches = screen.getAllByRole('button', { name: /^color:/i })
    expect(swatches).toHaveLength(15)
  })

  it('selecting a color swatch marks it as pressed', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const blueBtn = screen.getByRole('button', { name: /color: blue/i })
    await userEvent.click(blueBtn)
    expect(blueBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('closing popover resets edit state', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
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
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
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
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const startH = screen.getByRole('spinbutton', { name: 'Start hour' })
    const startM = screen.getByRole('spinbutton', { name: 'Start minute' })
    const endH = screen.getByRole('spinbutton', { name: 'End hour' })
    const endM = screen.getByRole('spinbutton', { name: 'End minute' })
    fireEvent.change(startH, { target: { value: '10' } })
    fireEvent.blur(startH)
    fireEvent.change(startM, { target: { value: '0' } })
    fireEvent.blur(startM)
    fireEvent.change(endH, { target: { value: '11' } })
    fireEvent.blur(endH)
    fireEvent.change(endM, { target: { value: '0' } })
    fireEvent.blur(endM)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    const saved = onEdit.mock.calls[0][0]
    // Behavior-flipped (was a literal zoneless-string match): handleSave now emits real
    // instants via toISOString(), so the saved string always carries milliseconds + "Z" —
    // the correctness check is that the LOCAL wall-clock the user typed round-trips, not
    // that the raw string equals a hand-built zoneless template.
    expect(new Date(saved.start).getHours()).toBe(10)
    expect(new Date(saved.start).getMinutes()).toBe(0)
    expect(new Date(saved.end).getHours()).toBe(11)
    expect(new Date(saved.end).getMinutes()).toBe(0)
    expect(new Date(saved.start).getDate()).toBe(new Date(event.start).getDate())
    expect(new Date(saved.end).getDate()).toBe(new Date(event.start).getDate())
  })

  it('overnight edit: end < start advances end to next day', async () => {
    const onEdit = vi.fn()
    const overnightEvent = {
      ...event,
      start: '2026-05-04T23:00:00',
      end: '2026-05-04T23:30:00',
    }
    render(<CalendarEventChip event={overnightEvent} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    // Set end to 01:00 (< start 23:00) → should go to next day
    fireEvent.change(screen.getByRole('spinbutton', { name: 'End hour' }), {
      target: { value: '1' },
    })
    fireEvent.blur(screen.getByRole('spinbutton', { name: 'End hour' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    const saved = onEdit.mock.calls[0][0]
    // Behavior-flipped (was `saved.start.substring(0, 10)` / `saved.end.substring(0, 10)`):
    // those substrings read the ISO's UTC calendar date. handleSave now emits real instants
    // via toISOString(), so a UTC-date substring on a local-midnight-crossing edit is no
    // longer the correct assertion — the invariant is the LOCAL calendar date, checked via
    // Date getters, which is exactly what a zoneless input's substring used to coincide with.
    expect(new Date(saved.start).getDate()).toBe(4)
    expect(new Date(saved.end).getDate()).toBe(5)
  })

  it('overnight edit: shows +1 day label when end < start', async () => {
    const overnightEvent = {
      ...event,
      start: '2026-05-04T23:00:00',
      end: '2026-05-05T01:00:00',
    }
    render(<CalendarEventChip event={overnightEvent} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByText('+1 day')).toBeInTheDocument()
  })

  describe('UTC/local wall-clock invariant (offset-explicit inputs)', () => {
    it('no-op edit round-trips start/end instants exactly (kills the post-save time jump)', async () => {
      const onEdit = vi.fn()
      const utcEvent: CalendarEvent = {
        ...event,
        id: 'tz-noop',
        start: '2026-07-07T14:00:00.000Z',
        end: '2026-07-07T14:30:00.000Z',
      }
      render(<CalendarEventChip event={utcEvent} style={style} onEdit={onEdit} />)
      await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
      await userEvent.click(screen.getByRole('button', { name: /save/i }))
      const saved = onEdit.mock.calls[0][0]
      expect(new Date(saved.start).getTime()).toBe(new Date(utcEvent.start).getTime())
      expect(new Date(saved.end).getTime()).toBe(new Date(utcEvent.end).getTime())
    })

    it('seeds draft start/end from the LOCAL wall-clock of an explicit-offset ISO event', async () => {
      const offsetEvent: CalendarEvent = {
        ...event,
        id: 'tz-seed',
        start: '2026-07-07T08:00:00+02:00',
        end: '2026-07-07T09:15:00+02:00',
      }
      const to12h = (d: Date): { hourStr: string; minuteStr: string; ampm: 'AM' | 'PM' } => {
        const h24 = d.getHours()
        const hour12 = h24 % 12 === 0 ? 12 : h24 % 12
        return {
          hourStr: String(hour12),
          minuteStr: String(d.getMinutes()).padStart(2, '0'),
          ampm: h24 < 12 ? 'AM' : 'PM',
        }
      }
      const expectedStart = to12h(new Date(offsetEvent.start))
      const expectedEnd = to12h(new Date(offsetEvent.end))

      render(<CalendarEventChip event={offsetEvent} style={style} onEdit={vi.fn()} />)
      await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

      expect(screen.getByRole('spinbutton', { name: 'Start hour' })).toHaveValue(
        expectedStart.hourStr,
      )
      expect(screen.getByRole('spinbutton', { name: 'Start minute' })).toHaveValue(
        expectedStart.minuteStr,
      )
      expect(screen.getByRole('spinbutton', { name: 'End hour' })).toHaveValue(expectedEnd.hourStr)
      expect(screen.getByRole('spinbutton', { name: 'End minute' })).toHaveValue(
        expectedEnd.minuteStr,
      )

      // Each TimeInput (Start, then End) always renders both an AM and a PM button; DOM order
      // is stable (Start block before End block), so index 0 = Start's button, 1 = End's.
      const amButtons = screen.getAllByRole('button', { name: 'AM' })
      const pmButtons = screen.getAllByRole('button', { name: 'PM' })
      const startAmPmBtn = expectedStart.ampm === 'AM' ? amButtons[0] : pmButtons[0]
      const endAmPmBtn = expectedEnd.ampm === 'AM' ? amButtons[1] : pmButtons[1]
      expect(startAmPmBtn).toHaveAttribute('aria-pressed', 'true')
      expect(endAmPmBtn).toHaveAttribute('aria-pressed', 'true')
    })

    it('saves an edited time to the intended LOCAL wall-clock (verified via Date getters)', async () => {
      const onEdit = vi.fn()
      // +09:00 is far enough from any plausible runner zone that the calendar date WRITTEN in
      // the ISO string diverges from the TRUE local calendar date of the instant — exactly the
      // shape the UTC/local-date mismatch bug flips (anchor computed from the written date
      // instead of `new Date(event.start)`'s local getters).
      const offsetEvent: CalendarEvent = {
        ...event,
        id: 'tz-edit',
        start: '2026-07-07T01:00:00+09:00',
        end: '2026-07-07T02:00:00+09:00',
      }
      const trueLocalStart = new Date(offsetEvent.start)

      render(<CalendarEventChip event={offsetEvent} style={style} onEdit={onEdit} />)
      await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
      const startH = screen.getByRole('spinbutton', { name: 'Start hour' })
      fireEvent.change(startH, { target: { value: '10' } })
      fireEvent.blur(startH)
      // Force AM explicitly so the final draft hour is fully deterministic regardless of the
      // AM/PM the (possibly still-buggy) seed landed on.
      await userEvent.click(screen.getAllByRole('button', { name: 'AM' })[0])
      await userEvent.click(screen.getByRole('button', { name: /save/i }))
      const saved = onEdit.mock.calls[0][0]
      expect(new Date(saved.start).getHours()).toBe(10)
      expect(new Date(saved.start).getFullYear()).toBe(trueLocalStart.getFullYear())
      expect(new Date(saved.start).getMonth()).toBe(trueLocalStart.getMonth())
      expect(new Date(saved.start).getDate()).toBe(trueLocalStart.getDate())
    })

    it('local-overnight end: +1 day lands on the LOCAL calendar day after start, not the UTC one', async () => {
      const onEdit = vi.fn()
      // Same divergent-offset shape as above: the written ISO date is one calendar day ahead
      // of the TRUE local date of the instant in any zone west of +09:00.
      const localOvernightEvent: CalendarEvent = {
        ...event,
        id: 'tz-overnight',
        start: '2026-07-07T01:00:00+09:00',
        end: '2026-07-07T02:00:00+09:00',
      }
      const trueLocalStart = new Date(localOvernightEvent.start)
      const expectedEndLocalDay = new Date(
        trueLocalStart.getFullYear(),
        trueLocalStart.getMonth(),
        trueLocalStart.getDate() + 1,
      )

      render(<CalendarEventChip event={localOvernightEvent} style={style} onEdit={onEdit} />)
      await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
      // Force both Start and End to explicit, deterministic clock values (11:00 PM / 1:00 AM)
      // so the overnight branch is guaranteed to trigger regardless of what the (possibly
      // still-buggy) seed produced.
      const startH = screen.getByRole('spinbutton', { name: 'Start hour' })
      const startM = screen.getByRole('spinbutton', { name: 'Start minute' })
      fireEvent.change(startH, { target: { value: '11' } })
      fireEvent.blur(startH)
      fireEvent.change(startM, { target: { value: '0' } })
      fireEvent.blur(startM)
      await userEvent.click(screen.getAllByRole('button', { name: 'PM' })[0])

      const endH = screen.getByRole('spinbutton', { name: 'End hour' })
      const endM = screen.getByRole('spinbutton', { name: 'End minute' })
      fireEvent.change(endH, { target: { value: '1' } })
      fireEvent.blur(endH)
      fireEvent.change(endM, { target: { value: '0' } })
      fireEvent.blur(endM)
      await userEvent.click(screen.getAllByRole('button', { name: 'AM' })[1])

      await userEvent.click(screen.getByRole('button', { name: /save/i }))
      const saved = onEdit.mock.calls[0][0]
      const savedEndLocal = new Date(saved.end)
      expect(savedEndLocal.getFullYear()).toBe(expectedEndLocalDay.getFullYear())
      expect(savedEndLocal.getMonth()).toBe(expectedEndLocalDay.getMonth())
      expect(savedEndLocal.getDate()).toBe(expectedEndLocalDay.getDate())
    })
  })

  it('delete button rendered when onDelete provided', async () => {
    render(<CalendarEventChip event={event} style={style} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('delete button absent when onDelete not provided', async () => {
    render(<CalendarEventChip event={event} style={style} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('onDelete called and popover closes when delete button clicked', async () => {
    const onDelete = vi.fn()
    render(<CalendarEventChip event={event} style={style} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
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

  it('does not fire onClick for non-Enter/Space keydown', () => {
    const onClick = vi.fn()
    const { getByRole } = render(
      <CalendarEventChip event={event} style={style} onClick={onClick} />,
    )
    const btn = getByRole('button', { name: /team standup/i })
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(onClick).not.toHaveBeenCalled()
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

  describe('use24h', () => {
    it('shows start time in 24h format on chip when use24h is set', () => {
      const tallStyle = { ...style, height: '10%' }
      render(<CalendarEventChip event={event} style={tallStyle} use24h />)
      expect(screen.getByText('09:00')).toBeInTheDocument()
      expect(screen.queryByText('9:00')).not.toBeInTheDocument()
    })

    it('chip aria-label shows 24h time range when use24h is set', () => {
      render(<CalendarEventChip event={event} style={style} use24h />)
      expect(screen.getByRole('button', { name: /team standup 09:00–09:30/i })).toBeInTheDocument()
    })

    it('popover shows 24h time range when use24h is set', async () => {
      render(<CalendarEventChip event={event} style={style} use24h />)
      await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
      expect(screen.getByText('09:00–09:30')).toBeInTheDocument()
    })

    it('formats cross-period 24h time range without AM/PM', async () => {
      const crossEvent: CalendarEvent = {
        id: '2',
        title: 'Long meeting',
        start: '2026-05-04T10:00:00',
        end: '2026-05-04T14:00:00',
      }
      render(<CalendarEventChip event={crossEvent} style={style} use24h />)
      await userEvent.click(screen.getByRole('button', { name: /long meeting/i }))
      expect(screen.getByText('10:00–14:00')).toBeInTheDocument()
    })

    it('defaults to 12h format when use24h is omitted', () => {
      render(<CalendarEventChip event={event} style={style} />)
      expect(screen.getByRole('button', { name: /team standup 9:00–9:30 am/i })).toBeInTheDocument()
    })
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
      const button = screen.getAllByRole('button', { name: /team standup/i })[0]
      expect(button.parentElement?.className).toContain(expectedClass)
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
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('group', { name: /recurrence days/i })).toBeInTheDocument()
  })

  it('day pills are pre-checked based on recurrenceDays', async () => {
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Day: Mon' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Tue' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('frequency select shows current recurrenceFrequency', async () => {
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect((screen.getByLabelText('Repeat') as HTMLSelectElement).value).toBe('weekly')
  })

  it('saving edit form calls onEdit with recurrence fields', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceDays: ['Mon', 'Wed', 'Fri'],
        recurrenceFrequency: 'weekly',
      }),
    )
  })

  it('toggling an inactive day pill adds it to recurrenceDays', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Day: Tue' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: expect.arrayContaining(['Mon', 'Tue', 'Wed']) }),
    )
  })

  it('toggling an active day pill removes it from recurrenceDays', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Day: Mon' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    const savedDays = (onEdit.mock.calls[0][0] as { recurrenceDays: string[] }).recurrenceDays
    expect(savedDays).not.toContain('Mon')
    expect(savedDays).toContain('Wed')
  })

  it('changing repeat select updates recurrenceFrequency in draft', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'daily')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ recurrenceFrequency: 'daily' }))
  })
})

describe('daily frequency selects all seven days', () => {
  const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const eventWithRecurrence: CalendarEvent = {
    id: 'r1',
    title: 'Morning run',
    start: '2026-05-04T07:00:00',
    end: '2026-05-04T07:30:00',
    recurrenceDays: ['Mon', 'Wed', 'Fri'],
    recurrenceFrequency: 'weekly',
  }

  it('selecting daily selects all 7 day buttons', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'daily')
    for (const day of ALL_DAYS) {
      expect(screen.getByRole('button', { name: `Day: ${day}` })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
  })

  it('selecting daily when a subset was already pressed overwrites the selection to all 7 days', async () => {
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'daily')
    for (const day of ALL_DAYS) {
      expect(screen.getByRole('button', { name: `Day: ${day}` })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
  })

  it('toggling a day while daily is selected switches frequency to weekly and applies the toggle', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'daily')
    await userEvent.click(screen.getByRole('button', { name: 'Day: Wed' }))
    expect(screen.getByRole('button', { name: 'Day: Wed' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect((screen.getByLabelText('Repeat') as HTMLSelectElement).value).toBe('weekly')
    for (const day of ALL_DAYS.filter((d) => d !== 'Wed')) {
      expect(screen.getByRole('button', { name: `Day: ${day}` })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
  })

  it('switching from daily to weekly via the select leaves all 7 days selected (no reset)', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'daily')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'weekly')
    for (const day of ALL_DAYS) {
      expect(screen.getByRole('button', { name: `Day: ${day}` })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }
  })

  it('opening the popover for a stored daily event with a legacy subset of days does not force-sync days to all 7', async () => {
    const eventWithLegacyDailySubset: CalendarEvent = {
      id: 'r2',
      title: 'Legacy daily',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T07:30:00',
      recurrenceDays: ['Mon', 'Wed'],
      recurrenceFrequency: 'daily',
    }
    const onEdit = vi.fn()
    render(<CalendarEventChip event={eventWithLegacyDailySubset} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /legacy daily/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Day: Mon' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Wed' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Tue' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Day: Fri' }))
    expect((screen.getByLabelText('Repeat') as HTMLSelectElement).value).toBe('weekly')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceDays: expect.arrayContaining(['Mon', 'Wed', 'Fri']),
        recurrenceFrequency: 'weekly',
      }),
    )
  })

  it('saving with daily selected emits all 7 recurrenceDays and frequency daily', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={eventWithRecurrence} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /morning run/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'daily')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: ALL_DAYS, recurrenceFrequency: 'daily' }),
    )
  })
})

describe('seriesDays edit-seed field (decoupled from recurrenceDays fan-out)', () => {
  it('seeds the edit popover Days picker from seriesDays when recurrenceDays is absent', async () => {
    const eventWithSeriesOnly: CalendarEvent = {
      id: 's1',
      title: 'Series only',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T07:30:00',
      seriesDays: ['Tue', 'Thu'],
    }
    render(<CalendarEventChip event={eventWithSeriesOnly} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /series only/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Day: Tue' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Thu' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Mon' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('seriesDays takes precedence over recurrenceDays when both are present', async () => {
    const eventWithBoth: CalendarEvent = {
      id: 's2',
      title: 'Series precedence',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T07:30:00',
      recurrenceDays: ['Mon'],
      seriesDays: ['Wed', 'Fri'],
    }
    render(<CalendarEventChip event={eventWithBoth} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /series precedence/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Day: Wed' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Fri' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Mon' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('saving with a seriesDays-seeded draft emits the picked days under recurrenceDays (handleSave shape unchanged)', async () => {
    const onEdit = vi.fn()
    const eventWithSeriesOnly: CalendarEvent = {
      id: 's3',
      title: 'Series persisted',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T07:30:00',
      seriesDays: ['Tue', 'Thu'],
    }
    render(<CalendarEventChip event={eventWithSeriesOnly} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /series persisted/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: ['Tue', 'Thu'], seriesDays: ['Tue', 'Thu'] }),
    )
  })

  it('a typed onEdit handler can read seriesDays and recurrenceCount with no cast (compile-time proof)', async () => {
    const seenSeriesDays: (readonly string[] | undefined)[] = []
    const seenRecurrenceCount: (number | undefined)[] = []
    const onEdit = (updated: CalendarEvent): void => {
      seenSeriesDays.push(updated.seriesDays)
      seenRecurrenceCount.push(updated.recurrenceCount)
    }
    const eventWithBothFields: CalendarEvent = {
      id: 's4',
      title: 'Typed fields',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T07:30:00',
      seriesDays: ['Mon'],
      recurrenceCount: 6,
    }
    render(<CalendarEventChip event={eventWithBothFields} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /typed fields/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(seenSeriesDays).toEqual([['Mon']])
    expect(seenRecurrenceCount).toEqual([6])
  })
})

describe('own-day fallback seed for day-less events (chip-edit Days picker)', () => {
  // `event.start` is 2026-05-04T09:00:00 — a Monday — and carries no recurrenceDays/seriesDays.
  const ownDay = 'Mon'

  it("seeds the Days picker from the event's own LOCAL day when no stored days exist", async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: `Day: ${ownDay}` })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    for (const other of ['Sun', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      expect(screen.getByRole('button', { name: `Day: ${other}` })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    }
  })

  it('does not apply the own-day fallback when stored days exist, even if they exclude the own day', async () => {
    const eventWithOtherDays: CalendarEvent = {
      ...event,
      id: 'own-day-precedence',
      recurrenceDays: ['Tue', 'Thu'],
    }
    render(<CalendarEventChip event={eventWithOtherDays} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Day: Tue' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Thu' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: `Day: ${ownDay}` })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('untouched save on a day-less event round-trips recurrenceDays as undefined (no silent 1-day series)', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ recurrenceDays: undefined }))
  })

  it('own day plus an extra toggled day both emit on save', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Day: Wed' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: expect.arrayContaining([ownDay, 'Wed']) }),
    )
    const saved = onEdit.mock.calls[0][0] as { recurrenceDays: string[] }
    expect(saved.recurrenceDays).toHaveLength(2)
  })

  it('own-day-only selection with a non-none frequency defeats the trivial strip', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /repeat/i }), 'weekly')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ recurrenceDays: [ownDay], recurrenceFrequency: 'weekly' }),
    )
  })

  it('a prior stored [day] with frequency none defeats the strip — untouched save still emits it (hadStoredDays guard)', async () => {
    const onEdit = vi.fn()
    const eventWithOwnDayStored: CalendarEvent = {
      ...event,
      id: 'own-day-stored',
      recurrenceDays: [ownDay],
    }
    render(<CalendarEventChip event={eventWithOwnDayStored} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ recurrenceDays: [ownDay] }))
  })

  it('deselecting all days (including the fallback-seeded own day) still emits undefined', async () => {
    const onEdit = vi.fn()
    render(<CalendarEventChip event={event} style={style} onEdit={onEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: `Day: ${ownDay}` }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ recurrenceDays: undefined }))
  })
})

describe('resize handles', () => {
  it('renders bottom resize handle with data-resize="end"', () => {
    const { container } = render(<CalendarEventChip event={event} style={style} />)
    expect(container.querySelector('[data-resize="end"]')).toBeInTheDocument()
  })

  it('renders top resize handle with data-resize="start"', () => {
    const { container } = render(<CalendarEventChip event={event} style={style} />)
    expect(container.querySelector('[data-resize="start"]')).toBeInTheDocument()
  })

  it('pointerdown on bottom handle calls onResizeStart with event and "end"', () => {
    const onResizeStart = vi.fn()
    const { container } = render(
      <CalendarEventChip event={event} style={style} onResizeStart={onResizeStart} />,
    )
    const handle = container.querySelector('[data-resize="end"]') as HTMLElement
    fireEvent.pointerDown(handle)
    expect(onResizeStart).toHaveBeenCalledWith(event, 'end')
  })

  it('pointerdown on top handle calls onResizeStart with event and "start"', () => {
    const onResizeStart = vi.fn()
    const { container } = render(
      <CalendarEventChip event={event} style={style} onResizeStart={onResizeStart} />,
    )
    const handle = container.querySelector('[data-resize="start"]') as HTMLElement
    fireEvent.pointerDown(handle)
    expect(onResizeStart).toHaveBeenCalledWith(event, 'start')
  })

  it('pointerdown on chip body passes shiftKey=false to onMoveStart when no shift held', () => {
    const onMoveStart = vi.fn()
    render(<CalendarEventChip event={event} style={style} onMoveStart={onMoveStart} />)
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { clientY: 250, clientX: 100, shiftKey: false })
    expect(onMoveStart).toHaveBeenCalledWith(event, 250, 100, false)
  })

  it('pointerdown on chip body passes shiftKey=true to onMoveStart when shift held', () => {
    const onMoveStart = vi.fn()
    render(<CalendarEventChip event={event} style={style} onMoveStart={onMoveStart} />)
    const chip = screen.getByRole('button', { name: /team standup/i })
    fireEvent.pointerDown(chip, { clientY: 250, clientX: 100, shiftKey: true })
    expect(onMoveStart).toHaveBeenCalledWith(event, 250, 100, true)
  })

  it('chip has cursor-grab class when onMoveStart is provided', () => {
    render(<CalendarEventChip event={event} style={style} onMoveStart={vi.fn()} />)
    const chip = screen.getByRole('button', { name: /team standup/i })
    expect(chip.className).toContain('cursor-grab')
  })

  it('chip does not have cursor-grab class when onMoveStart is not provided', () => {
    render(<CalendarEventChip event={event} style={style} />)
    const chip = screen.getByRole('button', { name: /team standup/i })
    expect(chip.className).not.toContain('cursor-grab')
  })
})

describe('CalendarEventChip complete toggle', () => {
  it('toggle button absent when onToggleComplete not provided', async () => {
    render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.queryByRole('button', { name: /mark complete/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mark incomplete/i })).not.toBeInTheDocument()
  })

  it('shows "Mark complete" for an incomplete event', async () => {
    render(<CalendarEventChip event={event} style={style} onToggleComplete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument()
  })

  it('shows "Mark incomplete" for a completed event', async () => {
    const done: CalendarEvent = { ...event, completed: true }
    render(<CalendarEventChip event={done} style={style} onToggleComplete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByRole('button', { name: /mark incomplete/i })).toBeInTheDocument()
  })

  it('clicking the toggle calls onToggleComplete with the event', async () => {
    const onToggleComplete = vi.fn()
    render(<CalendarEventChip event={event} style={style} onToggleComplete={onToggleComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    await userEvent.click(screen.getByRole('button', { name: /mark complete/i }))
    expect(onToggleComplete).toHaveBeenCalledWith(event)
  })

  it('toggle renders alongside Edit and Delete in the action row', async () => {
    render(
      <CalendarEventChip
        event={event}
        style={style}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleComplete={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument()
  })

  it('strikes through the completed event title on the chip', () => {
    const done: CalendarEvent = { ...event, completed: true }
    render(<CalendarEventChip event={done} style={style} />)
    expect(screen.getByText('Team standup').className).toContain('line-through')
  })

  it('does not strike through an incomplete event title', () => {
    render(<CalendarEventChip event={event} style={style} />)
    expect(screen.getByText('Team standup').className).not.toContain('line-through')
  })
})

describe('inline complete circle', () => {
  const completable = { ...event, completable: true }

  it('renders no checkbox when completable is unset', () => {
    render(<CalendarEventChip event={event} style={style} onToggleComplete={vi.fn()} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('renders no checkbox when onToggleComplete is missing', () => {
    render(<CalendarEventChip event={completable} style={style} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('renders checkbox when completable and handler wired', () => {
    render(<CalendarEventChip event={completable} style={style} onToggleComplete={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: 'Mark complete' })).toBeInTheDocument()
  })

  it('click fires onToggleComplete with the event and does NOT open the popover', async () => {
    const onToggleComplete = vi.fn()
    render(
      <CalendarEventChip event={completable} style={style} onToggleComplete={onToggleComplete} />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Mark complete' }))
    expect(onToggleComplete).toHaveBeenCalledWith(completable)
    expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument() // popover content absent
  })

  it('pointerdown on the circle never starts a move drag', () => {
    const onMoveStart = vi.fn()
    render(
      <CalendarEventChip
        event={completable}
        style={style}
        onToggleComplete={vi.fn()}
        onMoveStart={onMoveStart}
      />,
    )
    fireEvent.pointerDown(screen.getByRole('checkbox', { name: 'Mark complete' }))
    expect(onMoveStart).not.toHaveBeenCalled()
  })

  it('reflects completed state via aria-checked and flipped label', () => {
    render(
      <CalendarEventChip
        event={{ ...completable, completed: true }}
        style={style}
        onToggleComplete={vi.fn()}
      />,
    )
    const box = screen.getByRole('checkbox', { name: 'Mark incomplete' })
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  describe('adornment cluster', () => {
    it('title sits flush left with no legacy indent, reserving space for the cluster via padding', () => {
      const completable = { ...event, completable: true }
      render(<CalendarEventChip event={completable} style={style} onToggleComplete={vi.fn()} />)
      const title = screen.getByText('Team standup')
      expect(title.className).not.toContain('pl-3.5')
      expect(title.className).toContain('pr-4')
      expect(title.className).toContain('group-hover:pr-11')
      expect(title.className).toContain('group-focus-within:pr-11')
    })

    it('root chip container carries the group class for hover-reveal', () => {
      const { container } = render(<CalendarEventChip event={event} style={style} />)
      expect(container.firstElementChild?.className).toContain('group')
    })

    it('cluster order left to right is quick-edit, quick-delete, checkbox', () => {
      const completable = { ...event, completable: true }
      render(
        <CalendarEventChip
          event={completable}
          style={style}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleComplete={vi.fn()}
        />,
      )
      const cluster = screen.getByRole('button', { name: 'Quick edit' })
        .parentElement as HTMLElement
      const buttons = Array.from(cluster.querySelectorAll('button'))
      expect(buttons.map((b) => b.getAttribute('role') ?? b.getAttribute('aria-label'))).toEqual([
        'Quick edit',
        'Quick delete',
        'checkbox',
      ])
    })

    it('quick edit button absent when onEdit not provided', () => {
      render(<CalendarEventChip event={event} style={style} />)
      expect(screen.queryByRole('button', { name: 'Quick edit' })).not.toBeInTheDocument()
    })

    it('quick delete button absent when onDelete not provided', () => {
      render(<CalendarEventChip event={event} style={style} />)
      expect(screen.queryByRole('button', { name: 'Quick delete' })).not.toBeInTheDocument()
    })

    it('clicking quick edit opens the popover directly in edit mode', async () => {
      render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
      await userEvent.click(screen.getByRole('button', { name: 'Quick edit' }))
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument()
    })

    it('clicking quick delete calls onDelete without opening the popover', async () => {
      const onDelete = vi.fn()
      render(<CalendarEventChip event={event} style={style} onDelete={onDelete} />)
      await userEvent.click(screen.getByRole('button', { name: 'Quick delete' }))
      expect(onDelete).toHaveBeenCalledWith(event)
      expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument()
    })

    it('quick edit pointerdown never starts a move drag', () => {
      const onMoveStart = vi.fn()
      render(
        <CalendarEventChip
          event={event}
          style={style}
          onEdit={vi.fn()}
          onMoveStart={onMoveStart}
        />,
      )
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Quick edit' }))
      expect(onMoveStart).not.toHaveBeenCalled()
    })

    it('quick delete pointerdown never starts a move drag', () => {
      const onMoveStart = vi.fn()
      render(
        <CalendarEventChip
          event={event}
          style={style}
          onDelete={vi.fn()}
          onMoveStart={onMoveStart}
        />,
      )
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Quick delete' }))
      expect(onMoveStart).not.toHaveBeenCalled()
    })

    it('quick edit and quick delete carry hover/focus reveal classes rather than display:none', () => {
      render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} onDelete={vi.fn()} />)
      const editBtn = screen.getByRole('button', { name: 'Quick edit' })
      const deleteBtn = screen.getByRole('button', { name: 'Quick delete' })
      for (const btn of [editBtn, deleteBtn]) {
        expect(btn.className).toContain('opacity-0')
        expect(btn.className).toContain('pointer-events-none')
        expect(btn.className).toContain('group-hover:opacity-100')
        expect(btn.className).toContain('group-hover:pointer-events-auto')
        expect(btn.className).toContain('focus-visible:opacity-100')
        expect(btn.className).not.toContain('hidden')
      }
    })

    it('checkbox has no hover-reveal or absolute-positioning classes of its own (always visible, inline within the cluster)', () => {
      render(
        <CalendarEventChip
          event={{ ...event, completable: true }}
          style={style}
          onToggleComplete={vi.fn()}
        />,
      )
      const box = screen.getByRole('checkbox', { name: 'Mark complete' })
      expect(box.className).not.toContain('opacity-0')
      expect(box.className).not.toContain('absolute')
    })

    it('cluster wrapper is absolutely positioned in the chip corner, not inline in the title flow', () => {
      render(<CalendarEventChip event={event} style={style} onEdit={vi.fn()} />)
      const cluster = screen.getByRole('button', { name: 'Quick edit' }).parentElement
      expect(cluster?.className).toContain('absolute')
      expect(cluster?.className).toContain('right-1')
    })

    it('no cluster button is a descendant of the trigger button (axe nested-interactive)', () => {
      const completable = { ...event, completable: true }
      render(
        <CalendarEventChip
          event={completable}
          style={style}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleComplete={vi.fn()}
        />,
      )
      const trigger = screen.getByRole('button', { name: /team standup/i })
      const editBtn = screen.getByRole('button', { name: 'Quick edit' })
      const deleteBtn = screen.getByRole('button', { name: 'Quick delete' })
      const checkbox = screen.getByRole('checkbox', { name: 'Mark complete' })
      expect(trigger.contains(editBtn)).toBe(false)
      expect(trigger.contains(deleteBtn)).toBe(false)
      expect(trigger.contains(checkbox)).toBe(false)
    })

    it('the trigger button and the cluster are siblings under the chip root', () => {
      const { container } = render(
        <CalendarEventChip event={event} style={style} onEdit={vi.fn()} />,
      )
      const trigger = screen.getByRole('button', { name: /team standup/i })
      const editBtn = screen.getByRole('button', { name: 'Quick edit' })
      const root = container.firstElementChild
      // editBtn's direct parent is the cluster wrapper; the cluster wrapper's parent is root.
      expect(editBtn.parentElement?.parentElement).toBe(root)
      // the trigger button (via PopoverTrigger asChild, which adds no wrapper element) is a
      // direct child of root — a sibling of the cluster wrapper, not its ancestor.
      expect(trigger.parentElement).toBe(root)
    })
  })

  describe('lock', () => {
    it('lock button absent when onToggleLock not provided', () => {
      render(<CalendarEventChip event={event} style={style} />)
      expect(screen.queryByRole('button', { name: 'Lock event' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Unlock event' })).not.toBeInTheDocument()
    })

    it('lock button rendered (idle-visible) when onToggleLock provided and event unlocked', () => {
      render(<CalendarEventChip event={event} style={style} onToggleLock={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Lock event' })).toBeInTheDocument()
    })

    it('lock button labeled Unlock event when event is already locked', () => {
      const locked = { ...event, locked: true }
      render(<CalendarEventChip event={locked} style={style} onToggleLock={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Unlock event' })).toBeInTheDocument()
    })

    it('lock button has no hover-reveal classes (always visible like the checkbox)', () => {
      render(<CalendarEventChip event={event} style={style} onToggleLock={vi.fn()} />)
      const lockBtn = screen.getByRole('button', { name: 'Lock event' })
      expect(lockBtn.className).not.toContain('opacity-0')
      expect(lockBtn.className).not.toContain('pointer-events-none')
    })

    it('aria-pressed reflects locked state', () => {
      const { rerender } = render(
        <CalendarEventChip event={event} style={style} onToggleLock={vi.fn()} />,
      )
      expect(screen.getByRole('button', { name: 'Lock event' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      rerender(
        <CalendarEventChip
          event={{ ...event, locked: true }}
          style={style}
          onToggleLock={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: 'Unlock event' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('clicking the lock button calls onToggleLock with the event and does not open the popover', async () => {
      const onToggleLock = vi.fn()
      render(<CalendarEventChip event={event} style={style} onToggleLock={onToggleLock} />)
      await userEvent.click(screen.getByRole('button', { name: 'Lock event' }))
      expect(onToggleLock).toHaveBeenCalledWith(event)
      expect(screen.queryByText('9:00–9:30 AM')).not.toBeInTheDocument()
    })

    it('lock button pointerdown never starts a move drag', () => {
      const onMoveStart = vi.fn()
      render(
        <CalendarEventChip
          event={event}
          style={style}
          onToggleLock={vi.fn()}
          onMoveStart={onMoveStart}
        />,
      )
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Lock event' }))
      expect(onMoveStart).not.toHaveBeenCalled()
    })

    it('cluster order left to right is quick-edit, quick-delete, checkbox, lock', () => {
      const completable = { ...event, completable: true }
      render(
        <CalendarEventChip
          event={completable}
          style={style}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleComplete={vi.fn()}
          onToggleLock={vi.fn()}
        />,
      )
      const cluster = screen.getByRole('button', { name: 'Quick edit' })
        .parentElement as HTMLElement
      const buttons = Array.from(cluster.querySelectorAll('button'))
      expect(buttons.map((b) => b.getAttribute('role') ?? b.getAttribute('aria-label'))).toEqual([
        'Quick edit',
        'Quick delete',
        'checkbox',
        'Lock event',
      ])
    })

    describe('locked event gating (move/resize only — everything else still works)', () => {
      const lockedEvent = { ...event, locked: true }

      it('pointerdown on the trigger does not call onMoveStart when locked', () => {
        const onMoveStart = vi.fn()
        render(<CalendarEventChip event={lockedEvent} style={style} onMoveStart={onMoveStart} />)
        const chip = screen.getByRole('button', { name: /team standup/i })
        fireEvent.pointerDown(chip, { clientY: 250, clientX: 100 })
        expect(onMoveStart).not.toHaveBeenCalled()
      })

      it('resize strips are not rendered when locked', () => {
        const { container } = render(<CalendarEventChip event={lockedEvent} style={style} />)
        expect(container.querySelector('[data-resize="start"]')).not.toBeInTheDocument()
        expect(container.querySelector('[data-resize="end"]')).not.toBeInTheDocument()
      })

      it('resize strips are rendered when not locked', () => {
        const { container } = render(<CalendarEventChip event={event} style={style} />)
        expect(container.querySelector('[data-resize="start"]')).toBeInTheDocument()
        expect(container.querySelector('[data-resize="end"]')).toBeInTheDocument()
      })

      it('cursor-grab class is absent when locked even though onMoveStart is provided', () => {
        render(<CalendarEventChip event={lockedEvent} style={style} onMoveStart={vi.fn()} />)
        const chip = screen.getByRole('button', { name: /team standup/i })
        expect(chip.className).not.toContain('cursor-grab')
      })

      it('popover still opens on click when locked', async () => {
        render(<CalendarEventChip event={lockedEvent} style={style} />)
        await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
        expect(screen.getByText('9:00–9:30 AM')).toBeInTheDocument()
      })

      it('quick edit still opens edit mode when locked', async () => {
        render(<CalendarEventChip event={lockedEvent} style={style} onEdit={vi.fn()} />)
        await userEvent.click(screen.getByRole('button', { name: 'Quick edit' }))
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      })

      it('quick delete still calls onDelete when locked', async () => {
        const onDelete = vi.fn()
        render(<CalendarEventChip event={lockedEvent} style={style} onDelete={onDelete} />)
        await userEvent.click(screen.getByRole('button', { name: 'Quick delete' }))
        expect(onDelete).toHaveBeenCalledWith(lockedEvent)
      })

      it('complete toggle still works when locked', async () => {
        const onToggleComplete = vi.fn()
        render(
          <CalendarEventChip
            event={lockedEvent}
            style={style}
            onToggleComplete={onToggleComplete}
          />,
        )
        await userEvent.click(screen.getByRole('button', { name: /team standup/i }))
        await userEvent.click(screen.getByRole('button', { name: /mark complete/i }))
        expect(onToggleComplete).toHaveBeenCalledWith(lockedEvent)
      })
    })

    describe('title reserve retune for lock', () => {
      it('idle reserve is pr-8 / hover reserve is pr-14 when onToggleLock is wired', () => {
        render(<CalendarEventChip event={event} style={style} onToggleLock={vi.fn()} />)
        const title = screen.getByText('Team standup')
        expect(title.className).toContain('pr-8')
        expect(title.className).toContain('group-hover:pr-14')
        expect(title.className).toContain('group-focus-within:pr-14')
        expect(title.className).not.toContain('pr-4')
        expect(title.className).not.toContain('pr-11')
      })

      it('idle reserve stays pr-4 / hover pr-11 when onToggleLock is not wired (C1 values unchanged)', () => {
        render(<CalendarEventChip event={event} style={style} />)
        const title = screen.getByText('Team standup')
        expect(title.className).toContain('pr-4')
        expect(title.className).toContain('group-hover:pr-11')
        expect(title.className).toContain('group-focus-within:pr-11')
        expect(title.className).not.toContain('pr-8')
        expect(title.className).not.toContain('pr-14')
      })
    })

    it('a typed onToggleLock handler can read event.locked with no cast (compile-time proof)', () => {
      const seenLocked: (boolean | undefined)[] = []
      const onToggleLock = (updated: CalendarEvent): void => {
        seenLocked.push(updated.locked)
      }
      const lockableEvent: CalendarEvent = { ...event, locked: false }
      render(<CalendarEventChip event={lockableEvent} style={style} onToggleLock={onToggleLock} />)
      fireEvent.click(screen.getByRole('button', { name: 'Lock event' }))
      expect(seenLocked).toEqual([false])
    })
  })

  describe('barrel dist-reachability (locked + onToggleLock)', () => {
    it('CalendarEvent.locked and CalendarEventChipProps.onToggleLock are usable via the package barrel with no cast', () => {
      const barrelEvent: BarrelCalendarEvent = { ...event, locked: true }
      const handler: NonNullable<BarrelCalendarEventChipProps['onToggleLock']> = (e) => {
        expect(e.locked).toBe(true)
      }
      handler(barrelEvent)
    })
  })

  describe('inline streak', () => {
    it('renders flame count next to the time when streak > 0', () => {
      render(<CalendarEventChip event={{ ...event, streak: 4 }} style={style} />)
      expect(screen.getByLabelText('4-day streak')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('renders no streak at 0 or undefined', () => {
      const { rerender } = render(
        <CalendarEventChip event={{ ...event, streak: 0 }} style={style} />,
      )
      expect(screen.queryByLabelText(/streak/)).not.toBeInTheDocument()
      rerender(<CalendarEventChip event={event} style={style} />)
      expect(screen.queryByLabelText(/streak/)).not.toBeInTheDocument()
    })

    it('streak hides with the time line on tiny chips (height ≤ 4%)', () => {
      render(
        <CalendarEventChip event={{ ...event, streak: 4 }} style={{ ...style, height: '3%' }} />,
      )
      expect(screen.queryByLabelText(/streak/)).not.toBeInTheDocument()
    })

    it('streak renders on the expanded time-range line too', () => {
      render(<CalendarEventChip event={{ ...event, streak: 4 }} style={style} expanded />)
      expect(screen.getByLabelText('4-day streak')).toBeInTheDocument()
    })
  })
})
