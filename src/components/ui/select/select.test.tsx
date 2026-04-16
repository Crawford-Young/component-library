import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

function TestSelect({ disabled }: { disabled?: boolean }) {
  return (
    <Select>
      <SelectTrigger aria-label="Pick a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry" disabled={disabled}>
            Cherry
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('Select', () => {
  it('renders trigger', () => {
    render(<TestSelect />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows placeholder by default', () => {
    render(<TestSelect />)
    expect(screen.getByText('Select a fruit')).toBeInTheDocument()
  })

  it('opens content when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestSelect />)
    await user.click(screen.getByRole('combobox'))
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  it('shows items when open', async () => {
    const user = userEvent.setup()
    render(<TestSelect />)
    await user.click(screen.getByRole('combobox'))
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })
  })

  it('selects an item on click', async () => {
    const user = userEvent.setup()
    render(<TestSelect />)
    await user.click(screen.getByRole('combobox'))
    await waitFor(() => screen.getByText('Apple'))
    await user.click(screen.getByText('Apple'))
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Apple')
    })
  })

  it('trigger applies border class', () => {
    render(<TestSelect />)
    expect(screen.getByRole('combobox').className).toContain('border')
  })

  it('trigger applies h-10 class', () => {
    render(<TestSelect />)
    expect(screen.getByRole('combobox').className).toContain('h-10')
  })
})

describe('SelectTrigger', () => {
  it('has correct displayName', () => {
    expect(SelectTrigger.displayName).toBeDefined()
  })
})

describe('SelectContent', () => {
  it('has correct displayName', () => {
    expect(SelectContent.displayName).toBeDefined()
  })
})

describe('SelectItem', () => {
  it('has correct displayName', () => {
    expect(SelectItem.displayName).toBeDefined()
  })
})
