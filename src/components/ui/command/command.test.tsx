import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command'

describe('Command', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders CommandInput', () => {
    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument()
  })

  it('renders items in a group', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Fruits">
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Fruits')).toBeInTheDocument()
  })

  it('filters items on type', async () => {
    const user = userEvent.setup()
    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="banana">Banana</CommandItem>
            <CommandItem value="cherry">Cherry</CommandItem>
          </CommandGroup>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    await user.type(screen.getByPlaceholderText('Search…'), 'ban')
    // cmdk v1 removes non-matching items from the DOM
    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument()
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })
  })

  it('shows empty state when no match', async () => {
    const user = userEvent.setup()
    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    await user.type(screen.getByPlaceholderText('Search…'), 'xyz')
    await waitFor(() => expect(screen.getByText('No results.')).toBeInTheDocument())
  })

  it('renders CommandSeparator', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandSeparator />
        </CommandList>
      </Command>,
    )
    expect(container.querySelector('[cmdk-separator]')).toBeTruthy()
  })

  it('hides CommandSeparator during search', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem value="banana">Banana</CommandItem>
          </CommandGroup>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    await user.type(screen.getByPlaceholderText('Search…'), 'app')
    await waitFor(() => {
      expect(container.querySelector('[cmdk-separator]')).not.toBeInTheDocument()
    })
  })

  it('keeps CommandSeparator visible during search when alwaysRender is true', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup>
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
          <CommandSeparator alwaysRender />
          <CommandGroup>
            <CommandItem value="banana">Banana</CommandItem>
          </CommandGroup>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    await user.type(screen.getByPlaceholderText('Search…'), 'app')
    await waitFor(() => {
      expect(container.querySelector('[cmdk-separator]')).toBeInTheDocument()
    })
  })

  it('renders CommandShortcut', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>
              Open
              <CommandShortcut>⌘O</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    expect(screen.getByText('⌘O')).toBeInTheDocument()
  })
})

describe('CommandDialog', () => {
  it('is closed by default', () => {
    render(
      <CommandDialog open={false} onOpenChange={() => {}}>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </CommandDialog>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when open', () => {
    render(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </CommandDialog>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders input inside dialog when open', () => {
    render(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandInput placeholder="Type a command…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
        </CommandList>
      </CommandDialog>,
    )
    expect(screen.getByPlaceholderText('Type a command…')).toBeInTheDocument()
  })
})
