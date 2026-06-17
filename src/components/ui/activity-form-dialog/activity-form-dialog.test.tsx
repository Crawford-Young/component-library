import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ActivityFormDialog', () => {
  describe('open / close', () => {
    it('renders the dialog when open=true', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render the dialog when open=false', () => {
      render(<ActivityFormDialog {...makeProps({ open: false })} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('shows the dialog title', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      expect(screen.getByRole('heading', { name: /activity/i })).toBeInTheDocument()
    })
  })

  describe('type picker', () => {
    it('renders type picker with all three options by default', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      expect(screen.getByRole('radio', { name: /task/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /goal/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /habit/i })).toBeInTheDocument()
    })

    it('defaults to task type', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      const taskRadio = screen.getByRole('radio', { name: /task/i })
      expect(taskRadio).toHaveAttribute('data-state', 'checked')
    })

    it('defaults to initialType when provided', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
      const goalRadio = screen.getByRole('radio', { name: /goal/i })
      expect(goalRadio).toHaveAttribute('data-state', 'checked')
    })

    it('hides type picker when lockType=true', () => {
      render(<ActivityFormDialog {...makeProps({ lockType: true })} />)
      expect(screen.queryByRole('radio', { name: /task/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio', { name: /goal/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio', { name: /habit/i })).not.toBeInTheDocument()
    })
  })

  describe('title field', () => {
    it('renders the title input', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument()
    })

    it('seeds title from initialValues', () => {
      render(<ActivityFormDialog {...makeProps({ initialValues: { title: 'My activity' } })} />)
      expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('My activity')
    })
  })

  describe('task type fields', () => {
    it('shows time fields when type is task', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'task' })} />)
      // TaskTimeFields renders start/end TimeInput hour/minute spinbuttons
      expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
      expect(screen.getByRole('spinbutton', { name: 'End time hour' })).toBeInTheDocument()
    })

    it('shows date picker when type is task', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'task' })} />)
      expect(screen.getByRole('button', { name: /pick a date/i })).toBeInTheDocument()
    })

    it('renders task times in 24-hour mode when use24h is set', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'task', use24h: true })} />)
      expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'AM' })).not.toBeInTheDocument()
    })

    it('switches to task fields when task radio clicked', async () => {
      const user = userEvent.setup()
      render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
      await user.click(screen.getByRole('radio', { name: /task/i }))
      await waitFor(() => {
        expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
      })
    })
  })

  describe('goal type fields', () => {
    it('shows target date picker when type is goal', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
      expect(screen.getByRole('button', { name: /target date|pick a date/i })).toBeInTheDocument()
    })

    it('does NOT show start/end time selects when type is goal', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
      const combos = screen.queryAllByRole('combobox')
      const startTime = combos.find((c) => c.getAttribute('aria-label') === 'Start time')
      const endTime = combos.find((c) => c.getAttribute('aria-label') === 'End time')
      expect(startTime).toBeUndefined()
      expect(endTime).toBeUndefined()
    })

    it('switches to goal fields when goal radio clicked', async () => {
      const user = userEvent.setup()
      render(<ActivityFormDialog {...makeProps({ initialType: 'task' })} />)
      await user.click(screen.getByRole('radio', { name: /goal/i }))
      await waitFor(() => {
        // Start/end time combos should be gone
        const combos = screen.queryAllByRole('combobox')
        const startTime = combos.find((c) => c.getAttribute('aria-label') === 'Start time')
        expect(startTime).toBeUndefined()
      })
    })
  })

  describe('habit type fields', () => {
    it('does NOT show a date picker when type is habit', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'habit' })} />)
      // No date picker for specific date
      expect(screen.queryByRole('button', { name: /pick a date/i })).not.toBeInTheDocument()
    })

    it('does NOT show start/end time selects when type is habit', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'habit' })} />)
      const combos = screen.queryAllByRole('combobox')
      const startTime = combos.find((c) => c.getAttribute('aria-label') === 'Start time')
      const endTime = combos.find((c) => c.getAttribute('aria-label') === 'End time')
      expect(startTime).toBeUndefined()
      expect(endTime).toBeUndefined()
    })

    it('shows recurrence select when type is habit', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'habit' })} />)
      const combos = screen.getAllByRole('combobox')
      const recurrence = combos.find((c) => c.getAttribute('aria-label') === 'Recurrence')
      expect(recurrence).toBeDefined()
    })

    it('switches to habit fields when habit radio clicked', async () => {
      const user = userEvent.setup()
      render(<ActivityFormDialog {...makeProps({ initialType: 'task' })} />)
      await user.click(screen.getByRole('radio', { name: /habit/i }))
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /pick a date/i })).not.toBeInTheDocument()
        const combos = screen.queryAllByRole('combobox')
        const startTime = combos.find((c) => c.getAttribute('aria-label') === 'Start time')
        expect(startTime).toBeUndefined()
      })
    })
  })

  describe('social section', () => {
    it('renders social section for task type', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'task' })} />)
      const combos = screen.getAllByRole('combobox')
      const activityType = combos.find((c) => c.getAttribute('aria-label') === 'Activity type')
      expect(activityType).toBeDefined()
    })

    it('renders social section for goal type', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'goal' })} />)
      const combos = screen.getAllByRole('combobox')
      const activityType = combos.find((c) => c.getAttribute('aria-label') === 'Activity type')
      expect(activityType).toBeDefined()
    })

    it('renders social section for habit type', () => {
      render(<ActivityFormDialog {...makeProps({ initialType: 'habit' })} />)
      const combos = screen.getAllByRole('combobox')
      const activityType = combos.find((c) => c.getAttribute('aria-label') === 'Activity type')
      expect(activityType).toBeDefined()
    })

    it('renders visibility select', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      const combos = screen.getAllByRole('combobox')
      const visibility = combos.find((c) => c.getAttribute('aria-label') === 'Visibility')
      expect(visibility).toBeDefined()
    })

    it('hides joinability when solo', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      // Default is solo
      const combos = screen.queryAllByRole('combobox')
      const joinability = combos.find((c) => c.getAttribute('aria-label') === 'Joinability')
      expect(joinability).toBeUndefined()
    })

    it('hides max participants when solo', () => {
      render(<ActivityFormDialog {...makeProps()} />)
      // Max participants only shown for group
      expect(screen.queryByLabelText(/max participants/i)).not.toBeInTheDocument()
    })

    it('shows joinability when group is selected and visibility is everyone', async () => {
      const user = userEvent.setup()
      render(<ActivityFormDialog {...makeProps()} />)
      // Switch to group
      const combos = screen.getAllByRole('combobox')
      const activityTypeTrigger = combos.find(
        (c) => c.getAttribute('aria-label') === 'Activity type',
      )!
      await user.click(activityTypeTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: /group/i }))
      await waitFor(() => {
        const updatedCombos = screen.getAllByRole('combobox')
        const joinability = updatedCombos.find(
          (c) => c.getAttribute('aria-label') === 'Joinability',
        )
        expect(joinability).toBeDefined()
      })
    })

    it('shows max participants when group is selected', async () => {
      const user = userEvent.setup()
      render(<ActivityFormDialog {...makeProps()} />)
      const combos = screen.getAllByRole('combobox')
      const activityTypeTrigger = combos.find(
        (c) => c.getAttribute('aria-label') === 'Activity type',
      )!
      await user.click(activityTypeTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: /group/i }))
      await waitFor(() => {
        expect(screen.getByLabelText(/max participants/i)).toBeInTheDocument()
      })
    })

    it('hides joinability when group + visibility is busy', async () => {
      const user = userEvent.setup()
      render(<ActivityFormDialog {...makeProps()} />)
      // Switch to group
      const combos = screen.getAllByRole('combobox')
      const activityTypeTrigger = combos.find(
        (c) => c.getAttribute('aria-label') === 'Activity type',
      )!
      await user.click(activityTypeTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: /group/i }))
      // Now switch visibility to busy
      await waitFor(() => {
        const updatedCombos = screen.getAllByRole('combobox')
        const visibilityTrigger = updatedCombos.find(
          (c) => c.getAttribute('aria-label') === 'Visibility',
        )
        expect(visibilityTrigger).toBeDefined()
      })
      const updatedCombos = screen.getAllByRole('combobox')
      const visibilityTrigger = updatedCombos.find(
        (c) => c.getAttribute('aria-label') === 'Visibility',
      )!
      await user.click(visibilityTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: /busy/i }))
      await waitFor(() => {
        const finalCombos = screen.queryAllByRole('combobox')
        const joinability = finalCombos.find((c) => c.getAttribute('aria-label') === 'Joinability')
        expect(joinability).toBeUndefined()
      })
    })

    it('hides joinability when group + visibility is only_me', async () => {
      const user = userEvent.setup()
      render(<ActivityFormDialog {...makeProps()} />)
      const combos = screen.getAllByRole('combobox')
      const activityTypeTrigger = combos.find(
        (c) => c.getAttribute('aria-label') === 'Activity type',
      )!
      await user.click(activityTypeTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: /group/i }))
      await waitFor(() => {
        const updatedCombos = screen.getAllByRole('combobox')
        const vis = updatedCombos.find((c) => c.getAttribute('aria-label') === 'Visibility')
        expect(vis).toBeDefined()
      })
      const updatedCombos2 = screen.getAllByRole('combobox')
      const visibilityTrigger = updatedCombos2.find(
        (c) => c.getAttribute('aria-label') === 'Visibility',
      )!
      await user.click(visibilityTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: /only me/i }))
      await waitFor(() => {
        const finalCombos = screen.queryAllByRole('combobox')
        const joinability = finalCombos.find((c) => c.getAttribute('aria-label') === 'Joinability')
        expect(joinability).toBeUndefined()
      })
    })
  })

  describe('submit payload — task', () => {
    it('assembles correct startAt / endAt ISO strings for task', async () => {
      const onSubmit = vi.fn()
      const user = userEvent.setup()
      // Use a fixed date for the test. The DatePicker in TaskTimeFields is hard to drive
      // via DOM in happy-dom, so we use initialValues to seed the date fields.
      // We assert that when a date is provided and times remain at defaults, buildIso is
      // called correctly. Seed via initialValues with startAt/endAt pre-built ISOs.
      const expectedStart = '2025-06-15T09:00:00.000Z'
      const expectedEnd = '2025-06-15T10:00:00.000Z'
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="task"
          initialValues={{
            type: 'task',
            startAt: expectedStart,
            endAt: expectedEnd,
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      // Fill in title so submit is meaningful
      const titleInput = screen.getByRole('textbox', { name: /title/i })
      await user.clear(titleInput)
      await user.type(titleInput, 'Morning run')
      await user.click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.type).toBe('task')
      expect(payload.title).toBe('Morning run')
      // startAt and endAt are built from seedDate + time using buildIso
      // The seeded date is 2025-06-15 UTC and times default to 09:00/10:00
      expect(payload.startAt).toBe(expectedStart)
      expect(payload.endAt).toBe(expectedEnd)
      expect(payload.social).toBeDefined()
      expect(payload.social.activityType).toBe('solo')
    })

    it('task submit includes recurrence fields', async () => {
      const onSubmit = vi.fn()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="task"
          initialValues={{
            recurrence: 'weekly',
            recurrenceCount: 3,
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.recurrence).toBe('weekly')
      expect(payload.recurrenceCount).toBe(3)
    })
  })

  describe('submit payload — goal', () => {
    it('assembles correct targetDate (YYYY-MM-DD) for goal', async () => {
      const onSubmit = vi.fn()
      // Seed via initialValues — goal uses targetDate string
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="goal"
          initialValues={{
            type: 'goal',
            title: 'Run a marathon',
            targetDate: '2025-12-31',
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.type).toBe('goal')
      expect(payload.title).toBe('Run a marathon')
      // targetDate must be a YYYY-MM-DD string
      expect(payload.targetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(payload.targetDate).toBe('2025-12-31')
      // startAt / endAt should NOT be on a goal payload
      expect(payload.startAt).toBeUndefined()
      expect(payload.endAt).toBeUndefined()
    })
  })

  describe('submit payload — habit', () => {
    it('assembles habit payload with recurrence but no dates', async () => {
      const onSubmit = vi.fn()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="habit"
          initialValues={{
            type: 'habit',
            title: 'Morning meditation',
            recurrence: 'daily',
            recurrenceCount: 5,
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.type).toBe('habit')
      expect(payload.title).toBe('Morning meditation')
      expect(payload.recurrence).toBe('daily')
      expect(payload.recurrenceCount).toBe(5)
      // Habit has no dates
      expect(payload.startAt).toBeUndefined()
      expect(payload.endAt).toBeUndefined()
      expect(payload.targetDate).toBeUndefined()
    })
  })

  describe('submit payload — social fields', () => {
    it('includes all social fields in group mode with joinability', async () => {
      const onSubmit = vi.fn()
      const user = userEvent.setup()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="task"
          initialValues={{
            social: {
              activityType: 'group',
              visibility: 'friends',
              joinability: 'request',
              maxParticipants: 10,
            },
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await user.click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.social.activityType).toBe('group')
      expect(payload.social.visibility).toBe('friends')
      expect(payload.social.joinability).toBe('request')
      expect(payload.social.maxParticipants).toBe(10)
    })

    it('omits joinability and maxParticipants when solo', async () => {
      const onSubmit = vi.fn()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="task"
          initialValues={{
            social: {
              activityType: 'solo',
              visibility: 'everyone',
            },
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.social.activityType).toBe('solo')
      expect(payload.social.joinability).toBeUndefined()
      expect(payload.social.maxParticipants).toBeUndefined()
    })
  })

  describe('isPending', () => {
    it('disables submit button when isPending=true', () => {
      render(<ActivityFormDialog {...makeProps({ isPending: true })} />)
      const submitBtn = screen.getByRole('button', { name: /saving|save/i })
      expect(submitBtn).toBeDisabled()
    })

    it('shows pending text when isPending=true', () => {
      render(<ActivityFormDialog {...makeProps({ isPending: true })} />)
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    })

    it('submit button is enabled when isPending=false', () => {
      render(<ActivityFormDialog {...makeProps({ isPending: false })} />)
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
    })
  })

  describe('lockType', () => {
    it('uses initialType when lockType=true', () => {
      render(<ActivityFormDialog {...makeProps({ lockType: true, initialType: 'goal' })} />)
      // No type picker visible
      expect(screen.queryByRole('radio')).not.toBeInTheDocument()
      // But goal fields should be shown (no start/end time selects, has target date)
      const combos = screen.queryAllByRole('combobox')
      const startTime = combos.find((c) => c.getAttribute('aria-label') === 'Start time')
      expect(startTime).toBeUndefined()
    })

    it('defaults to task when lockType=true and no initialType', () => {
      render(<ActivityFormDialog {...makeProps({ lockType: true })} />)
      // task fields should be visible — TimeInput start hour spinbutton present
      expect(screen.getByRole('spinbutton', { name: 'Start time hour' })).toBeInTheDocument()
    })
  })

  describe('joinability change', () => {
    it('calls onSubmit with changed joinability value', async () => {
      const onSubmit = vi.fn()
      const user = userEvent.setup()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="task"
          initialValues={{
            social: {
              activityType: 'group',
              visibility: 'everyone',
              joinability: 'open',
              maxParticipants: 5,
            },
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      // Change joinability from 'open' to 'closed'
      const combos = screen.getAllByRole('combobox')
      const joinabilityTrigger = combos.find((c) => c.getAttribute('aria-label') === 'Joinability')!
      await user.click(joinabilityTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: /closed/i }))
      await waitFor(() => {
        const updatedCombos = screen.queryAllByRole('combobox')
        const jTrigger = updatedCombos.find((c) => c.getAttribute('aria-label') === 'Joinability')
        expect(jTrigger).toBeDefined()
      })
      await user.click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.social.joinability).toBe('closed')
    })
  })

  describe('goal submit — no date selected', () => {
    it('emits targetDate: undefined when no goal date is chosen', async () => {
      const onSubmit = vi.fn()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="goal"
          initialValues={{ title: 'Empty goal' }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.type).toBe('goal')
      expect(payload.targetDate).toBeUndefined()
    })
  })

  describe('habit submit — no recurrence', () => {
    it('emits undefined recurrence/recurrenceCount when habit has no recurrence', async () => {
      const onSubmit = vi.fn()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="habit"
          initialValues={{ title: 'Plain habit' }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.type).toBe('habit')
      expect(payload.recurrence).toBeUndefined()
      expect(payload.recurrenceCount).toBeUndefined()
    })
  })

  describe('social submit — group with busy visibility omits joinability', () => {
    it('omits joinability in payload when group + busy visibility', async () => {
      const onSubmit = vi.fn()
      render(
        <ActivityFormDialog
          open
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
          initialType="task"
          initialValues={{
            social: {
              activityType: 'group',
              visibility: 'busy',
              maxParticipants: 8,
            },
          }}
        />,
      )
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      const payload = onSubmit.mock.calls[0][0] as ActivityFormValues
      expect(payload.social.activityType).toBe('group')
      expect(payload.social.visibility).toBe('busy')
      expect(payload.social.joinability).toBeUndefined()
      expect(payload.social.maxParticipants).toBe(8)
    })
  })

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(ActivityFormDialog.displayName).toBe('ActivityFormDialog')
    })
  })
})
