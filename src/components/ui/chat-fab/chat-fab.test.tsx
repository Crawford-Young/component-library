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
})
