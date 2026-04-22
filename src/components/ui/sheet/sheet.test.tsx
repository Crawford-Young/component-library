import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

function TestSheet({ side }: { side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <Sheet>
      <SheetTrigger>Open {side ?? 'right'}</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Dismiss</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

describe('Sheet', () => {
  it('renders trigger', () => {
    render(<TestSheet />)
    expect(screen.getByText('Open right')).toBeInTheDocument()
  })

  it('is closed by default', () => {
    render(<TestSheet />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestSheet />)
    await user.click(screen.getByText('Open right'))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })

  it('shows title and description when open', async () => {
    const user = userEvent.setup()
    render(<TestSheet />)
    await user.click(screen.getByText('Open right'))
    await waitFor(() => {
      expect(screen.getByText('Sheet title')).toBeInTheDocument()
      expect(screen.getByText('Sheet description')).toBeInTheDocument()
    })
  })

  it('closes when SheetClose is clicked', async () => {
    const user = userEvent.setup()
    render(<TestSheet />)
    await user.click(screen.getByText('Open right'))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByText('Dismiss'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'applies correct dimension classes for side=%s',
    async (side) => {
      const user = userEvent.setup()
      render(<TestSheet side={side} />)
      await user.click(screen.getByText(`Open ${side}`))
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        if (side === 'right' || side === 'left') {
          expect(dialog.className).toContain('max-w-sm')
          expect(dialog.className).toContain('h-full')
        } else {
          expect(dialog.className).toContain('inset-x-0')
          expect(dialog.className).toContain('h-1/3')
        }
      })
    },
  )
})

describe('SheetHeader', () => {
  it('renders children', () => {
    render(<SheetHeader>header</SheetHeader>)
    expect(screen.getByText('header')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<SheetHeader ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('SheetFooter', () => {
  it('renders children', () => {
    render(<SheetFooter>footer</SheetFooter>)
    expect(screen.getByText('footer')).toBeInTheDocument()
  })
})
