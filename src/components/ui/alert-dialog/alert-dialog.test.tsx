import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

function TestAlertDialog({ onAction }: { onAction?: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

describe('AlertDialog', () => {
  it('renders trigger', () => {
    render(<TestAlertDialog />)
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('is closed by default', () => {
    render(<TestAlertDialog />)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<TestAlertDialog />)
    await user.click(screen.getByText('Delete'))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument())
  })

  it('shows title and description when open', async () => {
    const user = userEvent.setup()
    render(<TestAlertDialog />)
    await user.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })
  })

  it('closes when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<TestAlertDialog />)
    await user.click(screen.getByText('Delete'))
    await waitFor(() => screen.getByRole('alertdialog'))
    await user.click(screen.getByText('Cancel'))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })

  it('calls onAction and closes when action is clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<TestAlertDialog onAction={onAction} />)
    await user.click(screen.getByText('Delete'))
    await waitFor(() => screen.getByRole('alertdialog'))
    await user.click(screen.getByText('Confirm'))
    expect(onAction).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })

  it('does not close when clicking outside (non-dismissable)', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<TestAlertDialog />)
    await user.click(screen.getByText('Delete'))
    await waitFor(() => screen.getByRole('alertdialog'))
    await user.click(document.body)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})

describe('AlertDialogHeader', () => {
  it('renders children', () => {
    render(<AlertDialogHeader>header content</AlertDialogHeader>)
    expect(screen.getByText('header content')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<AlertDialogHeader ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('AlertDialogFooter', () => {
  it('renders children', () => {
    render(<AlertDialogFooter>footer content</AlertDialogFooter>)
    expect(screen.getByText('footer content')).toBeInTheDocument()
  })
})
