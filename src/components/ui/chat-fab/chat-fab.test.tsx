import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatFab } from './chat-fab'

describe('ChatFab', () => {
  it('renders button with accessible label', () => {
    render(<ChatFab onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /open ai assistant/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ChatFab onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('merges custom className', () => {
    render(<ChatFab onClick={vi.fn()} className="custom" />)
    expect(screen.getByRole('button').className).toContain('custom')
  })

  it('renders a custom icon in place of the default', () => {
    render(<ChatFab onClick={vi.fn()} icon={<span data-testid="custom-icon" />} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(document.querySelector('svg')).not.toBeInTheDocument()
  })

  it('uses a custom aria-label', () => {
    render(<ChatFab onClick={vi.fn()} label="Open help" />)
    expect(screen.getByRole('button', { name: 'Open help' })).toBeInTheDocument()
  })

  it('drops fixed positioning when position="static"', () => {
    render(<ChatFab onClick={vi.fn()} position="static" />)
    const btn = screen.getByRole('button')
    expect(btn.className).not.toContain('fixed')
    expect(btn.className).toContain('static')
  })
})
