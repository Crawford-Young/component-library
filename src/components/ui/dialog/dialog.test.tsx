import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

function TestDialog({ size }: { size?: 'sm' | 'default' | 'lg' | 'full' }) {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('renders trigger', () => {
    render(<TestDialog />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('is closed by default', () => {
    render(<TestDialog />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestDialog />)
    await user.click(screen.getByText('Open'))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })

  it('shows title and description when open', async () => {
    const user = userEvent.setup()
    render(<TestDialog />)
    await user.click(screen.getByText('Open'))
    await waitFor(() => {
      expect(screen.getByText('Dialog title')).toBeInTheDocument()
      expect(screen.getByText('Dialog description')).toBeInTheDocument()
    })
  })

  it('closes when DialogClose is clicked', async () => {
    const user = userEvent.setup()
    render(<TestDialog />)
    await user.click(screen.getByText('Open'))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByText('Close'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it.each(['sm', 'default', 'lg', 'full'] as const)('renders %s size', async (size) => {
    const user = userEvent.setup()
    render(<TestDialog size={size} />)
    await user.click(screen.getByText('Open'))
    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      const expectedClass = {
        sm: 'max-w-sm',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        full: 'max-w-[calc(100vw-2rem)]',
      }[size]
      expect(dialog.className).toContain(expectedClass)
    })
  })
})

describe('DialogHeader', () => {
  it('renders children', () => {
    render(<DialogHeader>header</DialogHeader>)
    expect(screen.getByText('header')).toBeInTheDocument()
  })

  it('applies flex-col class', () => {
    const { container } = render(<DialogHeader />)
    expect((container.firstChild as HTMLElement).className).toContain('flex-col')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<DialogHeader ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('DialogFooter', () => {
  it('renders children', () => {
    render(<DialogFooter>footer</DialogFooter>)
    expect(screen.getByText('footer')).toBeInTheDocument()
  })
})

describe('DialogTitle', () => {
  it('renders children', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>My title</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => expect(screen.getByText('My title')).toBeInTheDocument())
  })

  it('applies font-semibold class', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => {
      expect(screen.getByText('T').className).toContain('font-semibold')
    })
  })

  it('has correct displayName', () => {
    expect(DialogTitle.displayName).toBeDefined()
  })
})

describe('DialogDescription', () => {
  it('renders children', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>My description</DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => expect(screen.getByText('My description')).toBeInTheDocument())
  })

  it('applies text-sm class', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>D</DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    await user.click(screen.getByText('Open'))
    await waitFor(() => {
      expect(screen.getByText('D').className).toContain('text-sm')
    })
  })

  it('has correct displayName', () => {
    expect(DialogDescription.displayName).toBeDefined()
  })
})
