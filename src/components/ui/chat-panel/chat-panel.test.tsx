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

  it('calls onOpenChange(false) when backdrop clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <ChatPanel open onOpenChange={onOpenChange} title="AI Assistant">
        <p>content</p>
      </ChatPanel>,
    )
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement
    await user.click(backdrop)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders a header slot in place of the title text', () => {
    render(
      <ChatPanel open onOpenChange={vi.fn()} title="Panel" header={<h2>Custom</h2>}>
        body
      </ChatPanel>,
    )
    expect(screen.getByRole('heading', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it('keeps title as the aside aria-label when header is provided', () => {
    render(
      <ChatPanel open onOpenChange={vi.fn()} title="Panel" header={<h2>Custom</h2>}>
        body
      </ChatPanel>,
    )
    expect(screen.getByLabelText('Panel')).toBeInTheDocument()
  })

  it('renders actions between the header and the close button', () => {
    render(
      <ChatPanel open onOpenChange={vi.fn()} title="Panel" actions={<button>Act</button>}>
        body
      </ChatPanel>,
    )
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument()
  })

  it('renders no backdrop when modal={false}', () => {
    const { container } = render(
      <ChatPanel open onOpenChange={vi.fn()} title="Panel" modal={false}>
        body
      </ChatPanel>,
    )
    expect(container.querySelector('.backdrop-blur-sm')).not.toBeInTheDocument()
  })

  it('spreads rest props (style, data-testid, role) onto the aside', () => {
    render(
      <ChatPanel
        open
        onOpenChange={vi.fn()}
        title="Panel"
        role="dialog"
        data-testid="popup"
        style={{ top: '10px' }}
      >
        body
      </ChatPanel>,
    )
    const aside = screen.getByTestId('popup')
    expect(aside).toHaveAttribute('role', 'dialog')
    expect(aside).toHaveStyle({ top: '10px' })
  })
})
