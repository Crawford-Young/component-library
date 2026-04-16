import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

function TestPopover() {
  return (
    <Popover>
      <PopoverTrigger>Toggle</PopoverTrigger>
      <PopoverContent>
        <p>Popover body</p>
      </PopoverContent>
    </Popover>
  )
}

describe('Popover', () => {
  it('renders trigger', () => {
    render(<TestPopover />)
    expect(screen.getByText('Toggle')).toBeInTheDocument()
  })

  it('is closed by default', () => {
    render(<TestPopover />)
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument()
  })

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestPopover />)
    await user.click(screen.getByText('Toggle'))
    await waitFor(() => expect(screen.getByText('Popover body')).toBeInTheDocument())
  })

  it('closes when trigger is clicked again', async () => {
    const user = userEvent.setup()
    render(<TestPopover />)
    await user.click(screen.getByText('Toggle'))
    await waitFor(() => screen.getByText('Popover body'))
    await user.click(screen.getByText('Toggle'))
    await waitFor(() => expect(screen.queryByText('Popover body')).not.toBeInTheDocument())
  })
})

describe('PopoverContent', () => {
  it('has correct displayName', () => {
    expect(PopoverContent.displayName).toBe('PopoverContent')
  })

  it('applies min-w class when open', async () => {
    const user = userEvent.setup()
    render(<TestPopover />)
    await user.click(screen.getByText('Toggle'))
    await waitFor(() => {
      const content = screen
        .getByText('Popover body')
        .closest('[data-radix-popper-content-wrapper]')?.firstChild as HTMLElement | null
      expect(content).not.toBeNull()
      expect(content!.className).toContain('min-w-')
    })
  })
})
