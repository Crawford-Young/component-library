import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskTimeFields } from './task-time-fields'
import type { TaskTimeFieldsProps } from './task-time-fields'

function makeProps(overrides: Partial<TaskTimeFieldsProps> = {}): TaskTimeFieldsProps {
  return {
    date: new Date(2025, 5, 15),
    onDateChange: vi.fn(),
    startTime: '09:00',
    onStartTimeChange: vi.fn(),
    endTime: '10:00',
    onEndTimeChange: vi.fn(),
    recurrence: 'none',
    onRecurrenceChange: vi.fn(),
    recurrenceCount: 1,
    onRecurrenceCountChange: vi.fn(),
    ...overrides,
  }
}

describe('TaskTimeFields', () => {
  describe('time selects', () => {
    it('renders 48 options in the start time select', async () => {
      const user = userEvent.setup()
      render(<TaskTimeFields {...makeProps()} />)
      const triggers = screen.getAllByRole('combobox')
      const startTrigger = triggers.find((t) => t.getAttribute('aria-label') === 'Start time')
      expect(startTrigger).toBeDefined()
      await user.click(startTrigger!)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(48)
    })

    it('renders 48 options in the end time select', async () => {
      const user = userEvent.setup()
      render(<TaskTimeFields {...makeProps()} />)
      const triggers = screen.getAllByRole('combobox')
      const endTrigger = triggers.find((t) => t.getAttribute('aria-label') === 'End time')
      expect(endTrigger).toBeDefined()
      await user.click(endTrigger!)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(48)
    })

    it('calls onStartTimeChange when a time slot is selected', async () => {
      const user = userEvent.setup()
      const onStartTimeChange = vi.fn()
      render(<TaskTimeFields {...makeProps({ startTime: '08:00', onStartTimeChange })} />)
      const startTrigger = screen
        .getAllByRole('combobox')
        .find((t) => t.getAttribute('aria-label') === 'Start time')!
      await user.click(startTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: '09:00' }))
      await waitFor(() => expect(onStartTimeChange).toHaveBeenCalledWith('09:00'))
    })

    it('calls onEndTimeChange when a time slot is selected', async () => {
      const user = userEvent.setup()
      const onEndTimeChange = vi.fn()
      render(<TaskTimeFields {...makeProps({ endTime: '09:00', onEndTimeChange })} />)
      const endTrigger = screen
        .getAllByRole('combobox')
        .find((t) => t.getAttribute('aria-label') === 'End time')!
      await user.click(endTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: '10:00' }))
      await waitFor(() => expect(onEndTimeChange).toHaveBeenCalledWith('10:00'))
    })
  })

  describe('recurrence field', () => {
    it('hides repeat count when recurrence is "none"', () => {
      render(<TaskTimeFields {...makeProps({ recurrence: 'none' })} />)
      expect(screen.queryByLabelText(/repeat count/i)).not.toBeInTheDocument()
    })

    it('shows repeat count when recurrence is "weekly"', () => {
      render(<TaskTimeFields {...makeProps({ recurrence: 'weekly', recurrenceCount: 2 })} />)
      expect(screen.getByLabelText(/repeat count/i)).toBeInTheDocument()
    })

    it('shows repeat count when recurrence is "daily"', () => {
      render(<TaskTimeFields {...makeProps({ recurrence: 'daily', recurrenceCount: 3 })} />)
      expect(screen.getByLabelText(/repeat count/i)).toBeInTheDocument()
    })

    it('shows repeat count when recurrence is "monthly"', () => {
      render(<TaskTimeFields {...makeProps({ recurrence: 'monthly', recurrenceCount: 1 })} />)
      expect(screen.getByLabelText(/repeat count/i)).toBeInTheDocument()
    })

    it('calls onRecurrenceChange when recurrence option is selected', async () => {
      const user = userEvent.setup()
      const onRecurrenceChange = vi.fn()
      render(<TaskTimeFields {...makeProps({ recurrence: 'none', onRecurrenceChange })} />)
      const recurrenceTrigger = screen
        .getAllByRole('combobox')
        .find((t) => t.getAttribute('aria-label') === 'Recurrence')!
      await user.click(recurrenceTrigger)
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
      await user.click(screen.getByRole('option', { name: 'Weekly' }))
      await waitFor(() => expect(onRecurrenceChange).toHaveBeenCalledWith('weekly'))
    })

    it('calls onRecurrenceCountChange when repeat count changes', async () => {
      const user = userEvent.setup()
      const onRecurrenceCountChange = vi.fn()
      render(
        <TaskTimeFields
          {...makeProps({ recurrence: 'daily', recurrenceCount: 1, onRecurrenceCountChange })}
        />,
      )
      const incrementBtn = screen.getByRole('button', { name: /increment/i })
      await user.click(incrementBtn)
      expect(onRecurrenceCountChange).toHaveBeenCalledWith(2)
    })
  })

  describe('showDate prop', () => {
    it('shows DatePicker by default', () => {
      render(<TaskTimeFields {...makeProps()} />)
      // The Date label and the DatePicker button are both present
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pick a date|june 15/i })).toBeInTheDocument()
    })

    it('hides DatePicker when showDate={false}', () => {
      render(<TaskTimeFields {...makeProps({ showDate: false, date: undefined })} />)
      expect(screen.queryByText('Date')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /pick a date/i })).not.toBeInTheDocument()
    })

    it('calls onDateChange when showDate is true — DatePicker button is reachable', () => {
      render(<TaskTimeFields {...makeProps()} />)
      expect(screen.getByText('Date')).toBeInTheDocument()
    })
  })

  describe('showRecurrence prop', () => {
    it('shows recurrence select by default', () => {
      render(<TaskTimeFields {...makeProps()} />)
      const recurrenceTrigger = screen
        .getAllByRole('combobox')
        .find((t) => t.getAttribute('aria-label') === 'Recurrence')
      expect(recurrenceTrigger).toBeDefined()
    })

    it('hides recurrence select when showRecurrence={false}', () => {
      render(<TaskTimeFields {...makeProps({ showRecurrence: false })} />)
      const recurrenceTrigger = screen
        .queryAllByRole('combobox')
        .find((t) => t.getAttribute('aria-label') === 'Recurrence')
      expect(recurrenceTrigger).toBeUndefined()
    })

    it('hides repeat count when showRecurrence={false} even if recurrence is "weekly"', () => {
      render(<TaskTimeFields {...makeProps({ showRecurrence: false, recurrence: 'weekly' })} />)
      expect(screen.queryByLabelText(/repeat count/i)).not.toBeInTheDocument()
    })
  })

  describe('labels', () => {
    it('renders Start time label', () => {
      render(<TaskTimeFields {...makeProps()} />)
      expect(screen.getByText('Start time')).toBeInTheDocument()
    })

    it('renders End time label', () => {
      render(<TaskTimeFields {...makeProps()} />)
      expect(screen.getByText('End time')).toBeInTheDocument()
    })

    it('renders Recurrence label when showRecurrence is true', () => {
      render(<TaskTimeFields {...makeProps()} />)
      expect(screen.getByText('Recurrence')).toBeInTheDocument()
    })

    it('renders Date label and DatePicker button when showDate is true', () => {
      render(<TaskTimeFields {...makeProps()} />)
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /june 15/i })).toBeInTheDocument()
    })
  })
})
