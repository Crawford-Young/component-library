import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu'

function TestContextMenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger data-testid="trigger-area">Right-click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem disabled>Paste</ContextMenuItem>
        <ContextMenuCheckboxItem checked>Show grid</ContextMenuCheckboxItem>
        <ContextMenuRadioGroup value="a">
          <ContextMenuRadioItem value="a">Option A</ContextMenuRadioItem>
          <ContextMenuRadioItem value="b">Option B</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>
              New tab
              <ContextMenuShortcut>⌘T</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}

describe('ContextMenu', () => {
  it('renders trigger area', () => {
    render(<TestContextMenu />)
    expect(screen.getByText('Right-click here')).toBeInTheDocument()
  })

  it('is closed by default', () => {
    render(<TestContextMenu />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens on right-click', async () => {
    const user = userEvent.setup()
    render(<TestContextMenu />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger-area') })
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
  })

  it('shows label and items after opening', async () => {
    const user = userEvent.setup()
    render(<TestContextMenu />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger-area') })
    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })
  })

  it('calls onClick when item is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="area">area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onClick}>Do action</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('area') })
    await waitFor(() => screen.getByRole('menu'))
    await user.click(screen.getByText('Do action'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('toggles checkbox item', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="area">area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Toggle
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('area') })
    await waitFor(() => screen.getByRole('menu'))
    await user.click(screen.getByText('Toggle'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('selects radio item', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="area">area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="x" onValueChange={onValueChange}>
            <ContextMenuRadioItem value="x">X</ContextMenuRadioItem>
            <ContextMenuRadioItem value="y">Y</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('area') })
    await waitFor(() => screen.getByRole('menu'))
    await user.click(screen.getByText('Y'))
    expect(onValueChange).toHaveBeenCalledWith('y')
  })

  it('renders shortcut text', async () => {
    const user = userEvent.setup()
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="area">area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('area') })
    await waitFor(() => expect(screen.getByText('⌘C')).toBeInTheDocument())
  })

  it('applies pl-8 to inset SubTrigger, MenuItem, and Label', async () => {
    const user = userEvent.setup()
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="area">area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel inset>Inset Label</ContextMenuLabel>
          <ContextMenuItem inset>Inset Item</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Inset Sub</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Sub item</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('area') })
    await waitFor(() => {
      expect(screen.getByText('Inset Label').className).toContain('pl-8')
      expect(screen.getByText('Inset Item').className).toContain('pl-8')
      expect(screen.getByText('Inset Sub').className).toContain('pl-8')
    })
  })
})
