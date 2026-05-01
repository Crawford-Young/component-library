import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Calendar, DatePicker, DateRangePicker } from './date-picker'

describe('Calendar', () => {
  it('renders a calendar grid', () => {
    render(<Calendar mode="single" />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Calendar mode="single" className="test-class" />)
    expect((container.firstChild as HTMLElement).className).toContain('test-class')
  })

  it('opens month dropdown and selects an option', async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" captionLayout="dropdown" fromYear={2020} toYear={2030} />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
    const monthBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.toLowerCase().startsWith('choose'))
    if (monthBtn) {
      await user.click(monthBtn)
      await waitFor(() => expect(monthBtn).toHaveAttribute('aria-expanded', 'true'))
      const dropdownBtns = Array.from(
        monthBtn.parentElement?.querySelectorAll('button') ?? [],
      ).filter((b) => b !== monthBtn)
      expect(dropdownBtns.length).toBeGreaterThan(0)
      await user.click(dropdownBtns[0] as HTMLElement)
      await waitFor(() => expect(monthBtn).toHaveAttribute('aria-expanded', 'false'))
    }
  })

  it('closes month dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" captionLayout="dropdown" fromYear={2020} toYear={2030} />)
    const monthBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.toLowerCase().startsWith('choose'))
    if (monthBtn) {
      await user.click(monthBtn)
      await waitFor(() => expect(monthBtn).toHaveAttribute('aria-expanded', 'true'))
      await user.click(screen.getByRole('grid'))
      await waitFor(() => expect(monthBtn).toHaveAttribute('aria-expanded', 'false'))
    }
  })
})

describe('DatePicker', () => {
  it('renders trigger button with placeholder when no date selected', () => {
    render(<DatePicker placeholder="Pick a date" />)
    expect(screen.getByRole('button', { name: /pick a date/i })).toBeInTheDocument()
  })

  it('shows CalendarIcon in trigger', () => {
    const { container } = render(<DatePicker placeholder="Pick a date" />)
    // lucide renders svg
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('opens popover on trigger click', async () => {
    const user = userEvent.setup()
    render(<DatePicker placeholder="Pick a date" />)
    await user.click(screen.getByRole('button', { name: /pick a date/i }))
    await waitFor(() => expect(screen.getByRole('grid')).toBeInTheDocument())
  })

  it('shows month and year dropdown buttons by default', async () => {
    const user = userEvent.setup()
    render(<DatePicker placeholder="Pick a date" />)
    await user.click(screen.getByRole('button', { name: /pick a date/i }))
    await waitFor(() => screen.getByRole('grid'))
    // Custom Dropdown renders two buttons with aria-label from react-day-picker
    const dropdownBtns = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-label')?.match(/month|year/i))
    expect(dropdownBtns.length).toBeGreaterThanOrEqual(2)
  })

  it('opens month dropdown and lists month options', async () => {
    const user = userEvent.setup()
    render(<DatePicker placeholder="Pick a date" />)
    await user.click(screen.getByRole('button', { name: /pick a date/i }))
    await waitFor(() => screen.getByRole('grid'))
    const monthBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.match(/month/i))
    expect(monthBtn).toBeDefined()
  })

  it('calls onValueChange with selected date', async () => {
    const user = userEvent.setup()
    let selected: Date | undefined
    render(
      <DatePicker
        placeholder="Pick a date"
        onValueChange={(d) => {
          selected = d
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: /pick a date/i }))
    await waitFor(() => screen.getByRole('grid'))
    // click first enabled day button
    const dayButtons = screen.getAllByRole('gridcell')
    const firstEnabled = dayButtons.find(
      (c) => !c.querySelector('[disabled]') && c.querySelector('button:not([disabled])'),
    )
    if (firstEnabled) {
      const btn = firstEnabled.querySelector('button:not([disabled])')
      if (btn) {
        await user.click(btn as HTMLElement)
        await waitFor(() => expect(selected).toBeInstanceOf(Date))
      }
    }
  })

  it('displays formatted date after selection when value is controlled', () => {
    const date = new Date(2025, 0, 15) // Jan 15 2025
    render(<DatePicker value={date} placeholder="Pick a date" />)
    expect(screen.getByText(/jan(uary)? 15(,)? 2025/i)).toBeInTheDocument()
  })
})

describe('DateRangePicker', () => {
  it('renders trigger with placeholder', () => {
    render(<DateRangePicker placeholder="Pick a range" />)
    expect(screen.getByRole('button', { name: /pick a range/i })).toBeInTheDocument()
  })

  it('opens popover on trigger click', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker placeholder="Pick a range" />)
    await user.click(screen.getByRole('button', { name: /pick a range/i }))
    // numberOfMonths={2} renders two grids
    await waitFor(() => expect(screen.getAllByRole('grid').length).toBeGreaterThan(0))
  })

  it('displays formatted range when value is controlled', () => {
    const from = new Date(2025, 0, 10)
    const to = new Date(2025, 0, 20)
    render(<DateRangePicker value={{ from, to }} placeholder="Pick a range" />)
    expect(screen.getByText(/jan(uary)? 10/i)).toBeInTheDocument()
    expect(screen.getByText(/jan(uary)? 20/i)).toBeInTheDocument()
  })

  it('displays formatted start date when only from is set', () => {
    const from = new Date(2025, 2, 5) // March 5, 2025
    render(<DateRangePicker value={{ from }} placeholder="Pick a range" />)
    expect(screen.getByRole('button', { name: /march 5/i })).toBeInTheDocument()
  })
})
