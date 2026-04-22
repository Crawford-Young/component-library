import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

function TestDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem disabled>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Show toolbar</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="pedro">
          <DropdownMenuRadioItem value="pedro">Pedro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="colm">Colm</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              New tab
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('renders trigger', () => {
    render(<TestDropdown />)
    expect(screen.getByText('Options')).toBeInTheDocument()
  })

  it('is closed by default', () => {
    render(<TestDropdown />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestDropdown />)
    await user.click(screen.getByText('Options'))
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
  })

  it('shows label, separator, and items when open', async () => {
    const user = userEvent.setup()
    render(<TestDropdown />)
    await user.click(screen.getByText('Options'))
    await waitFor(() => {
      expect(screen.getByText('My Account')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })
  })

  it('renders disabled item with disabled state', async () => {
    const user = userEvent.setup()
    render(<TestDropdown />)
    await user.click(screen.getByText('Options'))
    await waitFor(() => {
      const billingItem = screen.getByText('Billing').closest('[data-disabled]')
      expect(billingItem).toBeInTheDocument()
    })
  })

  it('calls onClick when item is clicked and menu closes', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => screen.getByRole('menu'))
    await user.click(screen.getByText('Action'))
    expect(onClick).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('toggles checkbox item', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Toggle me
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => screen.getByRole('menu'))
    await user.click(screen.getByText('Toggle me'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('selects radio item', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => screen.getByRole('menu'))
    await user.click(screen.getByText('Option B'))
    expect(onValueChange).toHaveBeenCalledWith('b')
  })

  it('renders shortcut text', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => expect(screen.getByText('⌘C')).toBeInTheDocument())
  })

  it('applies pl-8 to inset SubTrigger, MenuItem, and Label', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>Inset Sub</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => {
      expect(screen.getByText('Inset Label').className).toContain('pl-8')
      expect(screen.getByText('Inset Item').className).toContain('pl-8')
      expect(screen.getByText('Inset Sub').className).toContain('pl-8')
    })
  })
})
