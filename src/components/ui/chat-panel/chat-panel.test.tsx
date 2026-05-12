import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatPanel } from './chat-panel'

describe('ChatPanel', () => {
  it('renders children when open', () => {
    render(
      <ChatPanel open onOpenChange={vi.fn()} title="AI Assistant">
        <p>chat content</p>
      </ChatPanel>,
    )
    expect(screen.getByText('chat content')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    render(
      <ChatPanel open={false} onOpenChange={vi.fn()} title="AI Assistant">
        <p>chat content</p>
      </ChatPanel>,
    )
    expect(screen.queryByText('chat content')).not.toBeInTheDocument()
  })

  it('calls onOpenChange(false) when close button clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <ChatPanel open onOpenChange={onOpenChange} title="AI Assistant">
        <p>content</p>
      </ChatPanel>,
    )
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders title in panel header', () => {
    render(
      <ChatPanel open onOpenChange={vi.fn()} title="Schedule Advisor">
        <p>content</p>
      </ChatPanel>,
    )
    expect(screen.getByText('Schedule Advisor')).toBeInTheDocument()
  })
})
