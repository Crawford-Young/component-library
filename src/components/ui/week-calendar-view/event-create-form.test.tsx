import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  EventCreateForm,
  type EventCreateSubmitPayload,
  type CreateActivityOption,
} from './event-create-form'

const DAYS = [
  new Date('2026-05-03T00:00:00'), // Sun
  new Date('2026-05-04T00:00:00'), // Mon
  new Date('2026-05-05T00:00:00'), // Tue
  new Date('2026-05-06T00:00:00'), // Wed
  new Date('2026-05-07T00:00:00'), // Thu
  new Date('2026-05-08T00:00:00'), // Fri
  new Date('2026-05-09T00:00:00'), // Sat
]

const baseProps = {
  startSlot: 36, // 9:00
  endSlot: 40, // 10:00
  date: '2026-05-04',
  dayCount: 1,
  days: DAYS,
  startDayIdx: 1,
  currentDayIdx: 1,
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
}

const ACTIVITY_OPTIONS: readonly CreateActivityOption[] = [
  { id: 'act-1', label: 'Deep work', color: 'blue', defaultDurationMin: 90 },
  { id: 'act-2', label: 'Reading' },
]

describe('EventCreateForm', () => {
  it('renders title input with autofocus', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByLabelText('Event title')).toBeInTheDocument()
  })

  it('title input is autofocused', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByLabelText('Event title')).toHaveFocus()
  })

  it('renders color picker group', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByRole('group', { name: 'Color' })).toBeInTheDocument()
  })

  it('renders location input', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
  })

  it('renders description textarea', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('renders start and end time inputs pre-filled from slots', () => {
    render(<EventCreateForm {...baseProps} />)
    expect((screen.getByRole('spinbutton', { name: 'Start hour' }) as HTMLInputElement).value).toBe(
      '9',
    )
    expect(
      (screen.getByRole('spinbutton', { name: 'Start minute' }) as HTMLInputElement).value,
    ).toBe('00')
    expect((screen.getByRole('spinbutton', { name: 'End hour' }) as HTMLInputElement).value).toBe(
      '10',
    )
    expect((screen.getByRole('spinbutton', { name: 'End minute' }) as HTMLInputElement).value).toBe(
      '00',
    )
  })

  it('renders all day checkbox', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByRole('checkbox', { name: /all day/i })).toBeInTheDocument()
  })

  it('hides time inputs when all day is checked', async () => {
    render(<EventCreateForm {...baseProps} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /all day/i }))
    expect(screen.queryByLabelText('Start')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('End')).not.toBeInTheDocument()
  })

  it('renders no Repeat select (recurrence UI removed)', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.queryByRole('combobox', { name: 'Repeat' })).not.toBeInTheDocument()
  })

  it('renders no recurrence days group (recurrence UI removed)', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.queryByRole('group', { name: 'Recurrence days' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Day: Mon' })).not.toBeInTheDocument()
  })

  it('renders no repeat count input (recurrence UI removed)', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.queryByLabelText('Repeat count')).not.toBeInTheDocument()
  })

  it('renders Create and Cancel buttons', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('does not show day count preview when dayCount is 1', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.queryByText(/creates \d events/i)).not.toBeInTheDocument()
  })

  it('shows day count preview when dayCount > 1', () => {
    render(<EventCreateForm {...baseProps} dayCount={3} startDayIdx={1} currentDayIdx={3} />)
    expect(screen.getByText(/creates 3 events/i)).toBeInTheDocument()
  })

  it('submit calls onSubmit with title and correct start/end', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'My event')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit).toHaveBeenCalledOnce()
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.title).toBe('My event')
    expect(arg.start).toBe('2026-05-04T09:00:00')
    expect(arg.end).toBe('2026-05-04T10:00:00')
  })

  it('submit payload carries no recurrence keys', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'My event')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    const serialized = JSON.stringify(onSubmit.mock.calls[0][0])
    expect(serialized).not.toContain('recurrenceDays')
    expect(serialized).not.toContain('recurrenceFrequency')
    expect(serialized).not.toContain('recurrenceCount')
    expect(serialized).not.toContain('seriesDays')
  })

  it('cancel calls onCancel', async () => {
    const onCancel = vi.fn()
    render(<EventCreateForm {...baseProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('submit includes location when filled', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    await userEvent.type(screen.getByLabelText('Location'), 'Room A')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].location).toBe('Room A')
  })

  it('submit omits location when empty', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].location).toBeUndefined()
  })

  it('color pill selection updates on click', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Color: blue' }))
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].color).toBe('blue')
  })

  it('submit includes description when filled', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    await userEvent.type(screen.getByLabelText('Description'), 'My description')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].description).toBe('My description')
  })

  it('submit omits description when empty', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].description).toBeUndefined()
  })

  it('submit includes allDay when checkbox is checked', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    await userEvent.click(screen.getByRole('checkbox', { name: /all day/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].allDay).toBe(true)
  })

  it('changing start time input updates the submitted start value', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    const startHour = screen.getByRole('spinbutton', { name: 'Start hour' })
    const startMin = screen.getByRole('spinbutton', { name: 'Start minute' })
    fireEvent.change(startHour, { target: { value: '10' } })
    fireEvent.blur(startHour)
    fireEvent.change(startMin, { target: { value: '30' } })
    fireEvent.blur(startMin)
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].start).toContain('10:30')
  })

  it('changing end time input updates the submitted end value', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Test')
    const endHour = screen.getByRole('spinbutton', { name: 'End hour' })
    const endMin = screen.getByRole('spinbutton', { name: 'End minute' })
    fireEvent.change(endHour, { target: { value: '11' } })
    fireEvent.blur(endHour)
    fireEvent.change(endMin, { target: { value: '0' } })
    fireEvent.blur(endMin)
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].end).toContain('11:00')
  })

  it('overnight: end < start sets end date to next day', async () => {
    const onSubmit = vi.fn()
    // baseProps: date='2026-05-04', startSlot=36 (09:00), endSlot=40 (10:00)
    // Manually set end to 01:00 which is < start 09:00 → next day
    render(<EventCreateForm {...baseProps} startSlot={92} endSlot={4} onSubmit={onSubmit} />)
    // startSlot=92 → 23:00, endSlot=4 → 01:00
    await userEvent.type(screen.getByLabelText('Event title'), 'Night shift')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.start).toBe('2026-05-04T23:00:00')
    expect(arg.end).toBe('2026-05-05T01:00:00')
  })

  it('overnight: shows +1 day label when end < start', () => {
    // startSlot=92 (23:00), endSlot=4 (01:00) — end < start
    render(<EventCreateForm {...baseProps} startSlot={92} endSlot={4} />)
    expect(screen.getByText('+1 day')).toBeInTheDocument()
  })

  it('no +1 day label when end > start', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.queryByText('+1 day')).not.toBeInTheDocument()
  })

  it('shows AM/PM toggle by default', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getAllByRole('button', { name: 'AM' }).length).toBeGreaterThan(0)
  })

  it('hides AM/PM toggle on both time inputs when use24h is set', () => {
    render(<EventCreateForm {...baseProps} use24h />)
    expect(screen.queryAllByRole('button', { name: 'AM' })).toHaveLength(0)
    expect(screen.queryAllByRole('button', { name: 'PM' })).toHaveLength(0)
  })

  it('a typed onSubmit handler receives the explicit EventCreateSubmitPayload shape (compile-time proof)', async () => {
    const received: string[] = []
    const onSubmit = (draft: EventCreateSubmitPayload): void => {
      received.push(draft.title)
    }
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Typed')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(received).toEqual(['Typed'])
  })
})

/**
 * Radix `Select` also renders a visually-hidden native `<select>` with matching
 * `<option>` text for form-autofill support, which collides with `getByText`
 * queries against the visible listbox item. Scope selection to the open
 * `listbox` (the native fallback does not carry that role) to disambiguate.
 */
async function selectActivityOption(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
): Promise<void> {
  await user.click(screen.getByRole('combobox', { name: 'Activity' }))
  const listbox = await screen.findByRole('listbox')
  await waitFor(() => within(listbox).getByText(label))
  await user.click(within(listbox).getByText(label))
}

describe('EventCreateForm activity picker', () => {
  it('renders no activity picker when createActivityOptions is not provided', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.queryByRole('combobox', { name: 'Activity' })).not.toBeInTheDocument()
  })

  it('renders the activity picker when createActivityOptions is provided', () => {
    render(<EventCreateForm {...baseProps} createActivityOptions={ACTIVITY_OPTIONS} />)
    expect(screen.getByRole('combobox', { name: 'Activity' })).toBeInTheDocument()
  })

  it('selecting an activity seeds title and color', async () => {
    const user = userEvent.setup()
    render(<EventCreateForm {...baseProps} createActivityOptions={ACTIVITY_OPTIONS} />)
    await selectActivityOption(user, 'Deep work')
    await waitFor(() => {
      expect((screen.getByLabelText('Event title') as HTMLInputElement).value).toBe('Deep work')
    })
    expect(screen.getByRole('button', { name: 'Color: blue' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('user-edited title survives re-render after seed (seed happens only on selection change)', async () => {
    const user = userEvent.setup()
    render(<EventCreateForm {...baseProps} createActivityOptions={ACTIVITY_OPTIONS} />)
    await selectActivityOption(user, 'Deep work')
    await waitFor(() => {
      expect((screen.getByLabelText('Event title') as HTMLInputElement).value).toBe('Deep work')
    })
    const titleInput = screen.getByLabelText('Event title') as HTMLInputElement
    await user.clear(titleInput)
    await user.type(titleInput, 'My custom title')
    // Force a re-render by toggling all-day and back — seed must not re-fire.
    await user.click(screen.getByRole('checkbox', { name: /all day/i }))
    await user.click(screen.getByRole('checkbox', { name: /all day/i }))
    expect((screen.getByLabelText('Event title') as HTMLInputElement).value).toBe('My custom title')
  })

  it('re-selecting a different activity re-seeds title and color', async () => {
    const user = userEvent.setup()
    render(<EventCreateForm {...baseProps} createActivityOptions={ACTIVITY_OPTIONS} />)
    await selectActivityOption(user, 'Deep work')
    await waitFor(() => {
      expect((screen.getByLabelText('Event title') as HTMLInputElement).value).toBe('Deep work')
    })
    const titleInput = screen.getByLabelText('Event title') as HTMLInputElement
    await user.clear(titleInput)
    await user.type(titleInput, 'Edited')
    await selectActivityOption(user, 'Reading')
    await waitFor(() => {
      expect((screen.getByLabelText('Event title') as HTMLInputElement).value).toBe('Reading')
    })
  })

  it('shows a snap button for the selected activity default duration and recomputes end time', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <EventCreateForm
        {...baseProps}
        createActivityOptions={ACTIVITY_OPTIONS}
        onSubmit={onSubmit}
      />,
    )
    expect(screen.queryByRole('button', { name: /use \d+ min/i })).not.toBeInTheDocument()
    await selectActivityOption(user, 'Deep work')
    const snapButton = await screen.findByRole('button', { name: 'Use 90 min' })
    await user.click(snapButton)
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].start).toBe('2026-05-04T09:00:00')
    expect(onSubmit.mock.calls[0][0].end).toBe('2026-05-04T10:30:00')
  })

  it('no snap button when selected activity has no defaultDurationMin', async () => {
    const user = userEvent.setup()
    render(<EventCreateForm {...baseProps} createActivityOptions={ACTIVITY_OPTIONS} />)
    await selectActivityOption(user, 'Reading')
    await waitFor(() => {
      expect((screen.getByLabelText('Event title') as HTMLInputElement).value).toBe('Reading')
    })
    expect(screen.queryByRole('button', { name: /use \d+ min/i })).not.toBeInTheDocument()
  })

  it('selecting "New activity…" fires onCreateActivityRequest with the drawn slot ISO bounds', async () => {
    const user = userEvent.setup()
    const onCreateActivityRequest = vi.fn()
    render(
      <EventCreateForm
        {...baseProps}
        createActivityOptions={ACTIVITY_OPTIONS}
        onCreateActivityRequest={onCreateActivityRequest}
      />,
    )
    await selectActivityOption(user, 'New activity…')
    expect(onCreateActivityRequest).toHaveBeenCalledOnce()
    expect(onCreateActivityRequest).toHaveBeenCalledWith({
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T10:00:00',
    })
  })

  it('submit payload carries activityId: null when "No activity" is selected (picker rendered)', async () => {
    const onSubmit = vi.fn()
    render(
      <EventCreateForm
        {...baseProps}
        createActivityOptions={ACTIVITY_OPTIONS}
        onSubmit={onSubmit}
      />,
    )
    await userEvent.type(screen.getByLabelText('Event title'), 'Plain event')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].activityId).toBeNull()
  })

  it('submit payload carries the selected activityId', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <EventCreateForm
        {...baseProps}
        createActivityOptions={ACTIVITY_OPTIONS}
        onSubmit={onSubmit}
      />,
    )
    await selectActivityOption(user, 'Reading')
    await waitFor(() => {
      expect((screen.getByLabelText('Event title') as HTMLInputElement).value).toBe('Reading')
    })
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit.mock.calls[0][0].activityId).toBe('act-2')
  })

  it('submit payload omits activityId entirely when the picker is not rendered', async () => {
    const onSubmit = vi.fn()
    render(<EventCreateForm {...baseProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Event title'), 'Plain event')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect('activityId' in onSubmit.mock.calls[0][0]).toBe(false)
  })
})
