import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ActivityFormDialog } from './activity-form-dialog'
import type { ActivityFormDialogProps, ActivityFormValues } from './activity-form-dialog'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeProps(overrides: Partial<ActivityFormDialogProps> = {}): ActivityFormDialogProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  }
}

/** Open a Radix Select by its trigger aria-label and click an option by name. */
async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerLabel: string,
  optionName: RegExp,
): Promise<void> {
  const trigger = screen
    .getAllByRole('combobox')
    .find((c) => c.getAttribute('aria-label') === triggerLabel)!
  await user.click(trigger)
  await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
  await user.click(screen.getByRole('option', { name: optionName }))
}

// ═══════════════════════════════════════════════════════════════════════════════
// Open / close + header
// ═══════════════════════════════════════════════════════════════════════════════

describe('open / close + header', () => {
  it('renders the dialog when open=true', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render the dialog when open=false', () => {
    render(<ActivityFormDialog {...makeProps({ open: false })} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows "New task" heading when no initialValues', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('heading', { name: /new task/i })).toBeInTheDocument()
  })

  it('shows "Edit task" heading when initialValues are provided', () => {
    render(<ActivityFormDialog {...makeProps({ initialValues: { type: 'task', title: 'X' } })} />)
    expect(screen.getByRole('heading', { name: /edit task/i })).toBeInTheDocument()
  })

  it('shows "New goal" heading for goal type', () => {
    render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
    expect(screen.getByRole('heading', { name: /new goal/i })).toBeInTheDocument()
  })

  it('renders a DialogDescription for a11y', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByText(/create or edit an activity/i)).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Compact layout — scroll region + pinned footer
// ═══════════════════════════════════════════════════════════════════════════════

describe('compact layout', () => {
  it('constrains the dialog height and hides overflow on the content', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-h-[85vh]')
    expect(dialog.className).toContain('overflow-hidden')
  })

  it('makes the field region internally scrollable', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    const scroll = screen.getByTestId('activity-form-scroll')
    expect(scroll.className).toContain('overflow-y-auto')
  })

  it('pins Cancel/Save in a footer OUTSIDE the scroll region', () => {
    render(<ActivityFormDialog {...makeProps({ initialValues: { title: 'Seeded' } })} />)
    const scroll = screen.getByTestId('activity-form-scroll')
    const cancel = screen.getByRole('button', { name: /cancel/i })
    const save = screen.getByRole('button', { name: /save/i })
    // Neither footer button lives inside the scrollable form → always visible.
    expect(scroll.contains(cancel)).toBe(false)
    expect(scroll.contains(save)).toBe(false)
    // Save is wired to the form via the form attribute (it sits outside the form).
    expect(save.getAttribute('form')).toBe(scroll.id)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Type picker (task | goal only — no habit)
// ═══════════════════════════════════════════════════════════════════════════════

describe('type picker', () => {
  it('renders only task and goal radios (no habit)', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('radio', { name: 'Task' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Goal' })).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /habit/i })).not.toBeInTheDocument()
  })

  it('defaults to task', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('radio', { name: 'Task' })).toHaveAttribute('data-state', 'checked')
  })

  it('honours initialType', () => {
    render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
    expect(screen.getByRole('radio', { name: 'Goal' })).toHaveAttribute('data-state', 'checked')
  })

  it('shows two radiogroups (type + social) when unlocked', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getAllByRole('radiogroup')).toHaveLength(2)
  })

  it('hides the type picker when lockType=true, leaving only the social radiogroup', () => {
    render(<ActivityFormDialog {...makeProps({ lockType: true, initialType: 'goal' })} />)
    expect(screen.queryByRole('radio', { name: 'Task' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('radiogroup')).toHaveLength(1)
  })

  it('switches from goal to task when the task radio is clicked', async () => {
    const user = userEvent.setup()
    render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
    await user.click(screen.getByRole('radio', { name: 'Task' }))
    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Title
// ═══════════════════════════════════════════════════════════════════════════════

describe('title field', () => {
  it('renders the title input', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument()
  })

  it('seeds the title from initialValues', () => {
    render(<ActivityFormDialog {...makeProps({ initialValues: { title: 'My activity' } })} />)
    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('My activity')
  })

  it('updates the title as the user types', async () => {
    const user = userEvent.setup()
    render(<ActivityFormDialog {...makeProps()} />)
    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Run')
    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('Run')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Task field set (all-day + time + color + location + description)
// ═══════════════════════════════════════════════════════════════════════════════

describe('task field set', () => {
  it('shows the all-day switch and time fields by default', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pick a date/i })).toBeInTheDocument()
  })

  it('renders color select, location input and description textarea', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    const color = screen
      .getAllByRole('combobox')
      .find((c) => c.getAttribute('aria-label') === 'Color')
    expect(color).toBeDefined()
    expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
  })

  it('renders task times in 24-hour mode when use24h is set', () => {
    render(<ActivityFormDialog {...makeProps({ use24h: true })} />)
    expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'AM' })).not.toBeInTheDocument()
  })

  it('all-day switch hides the time fields', async () => {
    const user = userEvent.setup()
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
    await user.click(screen.getByRole('switch'))
    expect(screen.queryByRole('spinbutton', { name: 'Start time hour' })).not.toBeInTheDocument()
  })

  it('hydrates allDay=true and hides time fields', () => {
    render(<ActivityFormDialog {...makeProps({ initialValues: { allDay: true, title: 'X' } })} />)
    expect(screen.getByRole('switch')).toBeChecked()
    expect(screen.queryByRole('spinbutton', { name: 'Start time hour' })).not.toBeInTheDocument()
  })

  it('typing in location and description updates their values', async () => {
    const user = userEvent.setup()
    render(<ActivityFormDialog {...makeProps()} />)
    await user.type(screen.getByPlaceholderText(/location/i), 'Park')
    await user.type(screen.getByPlaceholderText(/description/i), 'Notes')
    expect(screen.getByPlaceholderText(/location/i)).toHaveValue('Park')
    expect(screen.getByPlaceholderText(/description/i)).toHaveValue('Notes')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Goal field set
// ═══════════════════════════════════════════════════════════════════════════════

describe('goal field set', () => {
  it('shows a target date picker and hides the time fields', () => {
    render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
    expect(screen.getByRole('button', { name: /pick a date/i })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Start time hour' })).not.toBeInTheDocument()
  })

  it('renders location and description for goals', () => {
    render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
    expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
  })

  it('typing in goal location and description updates their values', async () => {
    const user = userEvent.setup()
    render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
    await user.type(screen.getByPlaceholderText(/location/i), 'Trail')
    await user.type(screen.getByPlaceholderText(/description/i), 'Notes')
    expect(screen.getByPlaceholderText(/location/i)).toHaveValue('Trail')
    expect(screen.getByPlaceholderText(/description/i)).toHaveValue('Notes')
  })

  it('hydrates the goal date from a date-only targetDate', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialType: 'goal',
          initialValues: { type: 'goal', title: 'G', targetDate: '2025-12-31' },
        })}
      />,
    )
    // DatePicker button shows the seeded date (not the "Pick a date" placeholder).
    expect(screen.queryByRole('button', { name: /pick a date/i })).not.toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Social section
// ═══════════════════════════════════════════════════════════════════════════════

describe('social section', () => {
  it('renders solo/group radios and a visibility select for task', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    expect(screen.getByRole('radio', { name: 'Solo' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Group' })).toBeInTheDocument()
    const vis = screen
      .getAllByRole('combobox')
      .find((c) => c.getAttribute('aria-label') === 'Visibility')
    expect(vis).toBeDefined()
  })

  it('renders the social section for goal type', () => {
    render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
    expect(screen.getByRole('radio', { name: 'Solo' })).toBeInTheDocument()
  })

  it('hides joinability and max participants when solo', () => {
    render(<ActivityFormDialog {...makeProps()} />)
    const join = screen
      .queryAllByRole('combobox')
      .find((c) => c.getAttribute('aria-label') === 'Joinability')
    expect(join).toBeUndefined()
    expect(screen.queryByLabelText(/max participants/i)).not.toBeInTheDocument()
  })

  it('shows max participants when group is selected', async () => {
    const user = userEvent.setup()
    render(<ActivityFormDialog {...makeProps()} />)
    await user.click(screen.getByRole('radio', { name: 'Group' }))
    expect(screen.getByLabelText(/max participants/i)).toBeInTheDocument()
  })

  it('shows joinability when group + non-private visibility (everyone)', async () => {
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: { social: { activityType: 'group', visibility: 'everyone' } },
        })}
      />,
    )
    const join = screen
      .getAllByRole('combobox')
      .find((c) => c.getAttribute('aria-label') === 'Joinability')
    expect(join).toBeDefined()
    // switching visibility away is exercised elsewhere; sanity-open the joinability
    await user.click(join!)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
  })

  it('hides joinability when group + busy visibility', () => {
    render(
      <ActivityFormDialog
        {...makeProps({ initialValues: { social: { activityType: 'group', visibility: 'busy' } } })}
      />,
    )
    const join = screen
      .queryAllByRole('combobox')
      .find((c) => c.getAttribute('aria-label') === 'Joinability')
    expect(join).toBeUndefined()
    // max participants is still shown for group
    expect(screen.getByLabelText(/max participants/i)).toBeInTheDocument()
  })

  it('hides joinability when group + only_me visibility', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: { social: { activityType: 'group', visibility: 'only_me' } },
        })}
      />,
    )
    const join = screen
      .queryAllByRole('combobox')
      .find((c) => c.getAttribute('aria-label') === 'Joinability')
    expect(join).toBeUndefined()
  })

  it('updates max participants', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: { social: { activityType: 'group', visibility: 'everyone' } },
        })}
      />,
    )
    const input = screen.getByLabelText(/max participants/i)
    fireEvent.change(input, { target: { value: '7' } })
    expect(input).toHaveValue(7)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Submit — task payload
// ═══════════════════════════════════════════════════════════════════════════════

describe('submit — task', () => {
  it('assembles startAt / endAt ISO strings and default solo social', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Morning run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.type).toBe('task')
    expect(payload.title).toBe('Morning run')
    expect(payload.startAt).toBe('2025-06-15T09:00:00.000Z')
    expect(payload.endAt).toBe('2025-06-15T10:00:00.000Z')
    expect(payload.social).toEqual({ activityType: 'solo', visibility: 'only_me' })
    // task payload must not leak the goal-only field
    expect(payload).not.toHaveProperty('targetDate')
  })

  it('emits null recurrence/color and undefined recurrenceCount at defaults', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Plain task',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.recurrence).toBeNull()
    expect(payload.recurrenceCount).toBeUndefined()
    expect(payload.color).toBeNull()
    expect(payload.location).toBeNull()
    expect(payload.description).toBeNull()
    expect(payload.allDay).toBe(false)
  })

  it('carries seeded recurrence + recurrenceCount into the payload', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Weekly run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'weekly',
            recurrenceCount: 3,
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.recurrence).toBe('weekly')
    expect(payload.recurrenceCount).toBe(3)
  })

  it('carries a chosen color, trimmed location and description into the payload', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Coloured run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    await selectOption(user, 'Color', /^blue$/i)
    await user.type(screen.getByPlaceholderText(/location/i), '  Park  ')
    await user.type(screen.getByPlaceholderText(/description/i), '  Notes  ')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.color).toBe('blue')
    expect(payload.location).toBe('Park')
    expect(payload.description).toBe('Notes')
  })

  it('all-day task submits null startAt / endAt', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({ onSubmit, initialValues: { allDay: true, title: 'All day event' } })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.allDay).toBe(true)
    expect(payload.startAt).toBeNull()
    expect(payload.endAt).toBeNull()
  })

  it('does nothing when a timed task has no date (direct form submit)', () => {
    const onSubmit = vi.fn()
    render(<ActivityFormDialog {...makeProps({ onSubmit, initialValues: { title: 'Run' } })} />)
    fireEvent.submit(screen.getByTestId('activity-form-scroll'))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Timezone correctness — local wall-clock round-trip
// ═══════════════════════════════════════════════════════════════════════════════

// `taskDate` is seeded from `startAt` for edit mode by anchoring a UTC-midnight
// Date on `startAt`'s UTC day. `buildIso` now reads that anchor's LOCAL day —
// which lands one day earlier than the UTC day in any negative-offset zone,
// regardless of how close `startAt`'s own wall-clock time is to midnight.
// TZ is pinned so this fails deterministically regardless of the runner's
// ambient zone.
describe('timezone correctness — local wall-clock round-trip', () => {
  const ORIGINAL_TZ = process.env['TZ']

  afterEach(() => {
    if (ORIGINAL_TZ === undefined) {
      delete process.env['TZ']
    } else {
      process.env['TZ'] = ORIGINAL_TZ
    }
  })

  it('resubmits an unmodified edit with the exact original startAt/endAt (TZ=America/New_York, UTC-4)', async () => {
    process.env['TZ'] = 'America/New_York'
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Mid-morning run',
            // 14:00 UTC = 10:00 local in America/New_York (UTC-4) — nowhere near a
            // midnight boundary in local wall-clock terms, but a UTC-midnight taskDate
            // anchor still reads back one LOCAL day earlier than the true local day.
            startAt: '2025-06-15T14:00:00.000Z',
            endAt: '2025-06-15T14:30:00.000Z',
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.startAt).toBe('2025-06-15T14:00:00.000Z')
    expect(payload.endAt).toBe('2025-06-15T14:30:00.000Z')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Submit — goal payload (date-only)
// ═══════════════════════════════════════════════════════════════════════════════

describe('submit — goal', () => {
  it('emits a date-only YYYY-MM-DD targetDate and omits task-only fields', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialType: 'goal',
          initialValues: { type: 'goal', title: 'Run a marathon', targetDate: '2025-12-31' },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.type).toBe('goal')
    expect(payload.title).toBe('Run a marathon')
    expect(payload.targetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(payload.targetDate).toBe('2025-12-31')
    expect(payload).not.toHaveProperty('startAt')
    expect(payload).not.toHaveProperty('endAt')
    expect(payload).not.toHaveProperty('recurrence')
    expect(payload.social).toEqual({ activityType: 'solo', visibility: 'only_me' })
  })

  it('trims goal location/description to null when blank', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialType: 'goal',
          initialValues: { type: 'goal', title: 'G', targetDate: '2025-12-31' },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.location).toBeNull()
    expect(payload.description).toBeNull()
  })

  it('does nothing when a goal has no date (direct form submit)', () => {
    const onSubmit = vi.fn()
    render(
      <ActivityFormDialog
        {...makeProps({ onSubmit, initialType: 'goal', initialValues: { title: 'Empty goal' } })}
      />,
    )
    fireEvent.submit(screen.getByTestId('activity-form-scroll'))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Submit — social payload assembly
// ═══════════════════════════════════════════════════════════════════════════════

describe('submit — social', () => {
  it('includes joinability + maxParticipants in group mode with a discoverable visibility', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Group run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            social: {
              activityType: 'group',
              visibility: 'friends',
              joinability: 'request',
              maxParticipants: 10,
            },
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.social).toEqual({
      activityType: 'group',
      visibility: 'friends',
      joinability: 'request',
      maxParticipants: 10,
    })
  })

  it('emits the displayed default joinability of "open" when untouched', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Group run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            social: { activityType: 'group', visibility: 'everyone' },
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.social.joinability).toBe('open')
    expect(payload.social.maxParticipants).toBe(2)
  })

  it('omits joinability from the payload when group + busy visibility', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Group run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            social: { activityType: 'group', visibility: 'busy', maxParticipants: 8 },
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.social.activityType).toBe('group')
    expect(payload.social.visibility).toBe('busy')
    expect(payload.social.joinability).toBeUndefined()
    expect(payload.social.maxParticipants).toBe(8)
  })

  it('reflects a changed joinability value in the payload', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Group run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            social: { activityType: 'group', visibility: 'everyone', joinability: 'open' },
          },
        })}
      />,
    )
    await selectOption(user, 'Joinability', /^closed$/i)
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.social.joinability).toBe('closed')
  })

  it('reflects a changed visibility value in the payload', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    await selectOption(user, 'Visibility', /^friends$/i)
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.social.visibility).toBe('friends')
  })

  it('switches solo → group via the radio and emits a group payload', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    await user.click(screen.getByRole('radio', { name: 'Group' }))
    const maxInput = screen.getByLabelText(/max participants/i)
    fireEvent.change(maxInput, { target: { value: '4' } })
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.social.activityType).toBe('group')
    expect(payload.social.maxParticipants).toBe(4)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Weekday recurrence picker
// ═══════════════════════════════════════════════════════════════════════════════

describe('weekday recurrence', () => {
  it('does not render the weekday picker for non-weekly recurrence', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'daily',
          },
        })}
      />,
    )
    expect(screen.queryByRole('group', { name: 'Recurrence days' })).not.toBeInTheDocument()
  })

  it('renders the weekday picker when recurrence is weekly', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'weekly',
          },
        })}
      />,
    )
    expect(screen.getByRole('group', { name: 'Recurrence days' })).toBeInTheDocument()
  })

  it('seeds recurrenceDays from initialValues, pre-selecting matching toggles', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'weekly',
            recurrenceDays: ['Mon', 'Wed'],
          },
        })}
      />,
    )
    expect(screen.getByRole('button', { name: 'Day: Mon' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Wed' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Day: Tue' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('includes selected recurrenceDays in the submit payload', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Weekly run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'weekly',
            recurrenceCount: 3,
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Day: Mon' }))
    await user.click(screen.getByRole('button', { name: 'Day: Wed' }))
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.recurrenceDays).toEqual(['Mon', 'Wed'])
  })

  it('omits recurrenceDays (undefined) from the submit payload when no days are selected', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Weekly run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'weekly',
            recurrenceCount: 3,
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.recurrenceDays).toBeUndefined()
  })

  it('omits recurrenceDays when seeded days exist but frequency is switched away from weekly', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'weekly',
            recurrenceDays: ['Mon'],
          },
        })}
      />,
    )
    await selectOption(user, 'Recurrence', /^daily$/i)
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.recurrenceDays).toBeUndefined()
  })

  it('back-compat: submitting a non-weekly task with no days interaction omits recurrenceDays', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <ActivityFormDialog
        {...makeProps({
          onSubmit,
          initialValues: {
            title: 'Plain task',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
    expect(payload.recurrenceDays).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Save enable/disable + isPending + Cancel
// ═══════════════════════════════════════════════════════════════════════════════

describe('save button + cancel', () => {
  it('disables save when the title is empty', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: { startAt: '2025-06-15T09:00:00.000Z', endAt: '2025-06-15T10:00:00.000Z' },
        })}
      />,
    )
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('disables save when a timed task has no date', () => {
    render(<ActivityFormDialog {...makeProps({ initialValues: { title: 'Run' } })} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('disables save when a goal has no date', () => {
    render(
      <ActivityFormDialog
        {...makeProps({ initialType: 'goal', initialValues: { title: 'Run a marathon' } })}
      />,
    )
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('enables save when title + date are present', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('shows "Saving…" and disables save when isPending', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          isPending: true,
          initialValues: {
            title: 'Run',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
          },
        })}
      />,
    )
    const save = screen.getByRole('button', { name: /saving/i })
    expect(save).toBeDisabled()
  })

  it('fires onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<ActivityFormDialog {...makeProps({ onOpenChange })} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// initialValues hydration (seed every field)
// ═══════════════════════════════════════════════════════════════════════════════

describe('initialValues hydration', () => {
  it('seeds task fields, color, location, description and group social', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: {
            type: 'task',
            title: 'Seeded task',
            startAt: '2025-06-15T09:00:00.000Z',
            endAt: '2025-06-15T10:00:00.000Z',
            recurrence: 'weekly',
            recurrenceCount: 4,
            color: 'violet',
            location: 'Gym',
            description: 'Leg day',
            allDay: false,
            social: {
              activityType: 'group',
              visibility: 'friends',
              joinability: 'request',
              maxParticipants: 12,
            },
          },
        })}
      />,
    )
    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('Seeded task')
    expect(screen.getByPlaceholderText(/location/i)).toHaveValue('Gym')
    expect(screen.getByPlaceholderText(/description/i)).toHaveValue('Leg day')
    expect(screen.getByLabelText(/max participants/i)).toHaveValue(12)
    // group + friends → joinability visible
    const join = screen
      .getAllByRole('combobox')
      .find((c) => c.getAttribute('aria-label') === 'Joinability')
    expect(join).toBeDefined()
  })

  it('seeds the group radio as checked from initialValues.social', () => {
    render(
      <ActivityFormDialog
        {...makeProps({
          initialValues: { social: { activityType: 'group', visibility: 'everyone' } },
        })}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Group' })).toHaveAttribute('data-state', 'checked')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// displayName
// ═══════════════════════════════════════════════════════════════════════════════

describe('displayName', () => {
  it('has the correct displayName', () => {
    expect(ActivityFormDialog.displayName).toBe('ActivityFormDialog')
  })
})
