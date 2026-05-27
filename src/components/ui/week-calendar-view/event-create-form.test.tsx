import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EventCreateForm } from './event-create-form'

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
    expect((screen.getByLabelText('Start') as HTMLInputElement).value).toBe('09:00')
    expect((screen.getByLabelText('End') as HTMLInputElement).value).toBe('10:00')
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

  it('renders repeat select', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByRole('combobox', { name: 'Repeat' })).toBeInTheDocument()
  })

  it('renders recurrence days group', () => {
    render(<EventCreateForm {...baseProps} />)
    expect(screen.getByRole('group', { name: 'Recurrence days' })).toBeInTheDocument()
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
})
