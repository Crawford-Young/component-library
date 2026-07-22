import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="No goals yet" />)
    expect(screen.getByText('No goals yet')).toBeInTheDocument()
  })

  it('renders CTA button when provided', () => {
    render(<EmptyState message="No goals" ctaLabel="Add goal" onCtaClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add goal' })).toBeInTheDocument()
  })

  it('calls onCtaClick when CTA clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<EmptyState message="No goals" ctaLabel="Add" onCtaClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders icon when provided', () => {
    render(<EmptyState message="No goals" icon={<span data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders the renderCta slot in place of the built-in button', () => {
    render(
      <EmptyState
        message="Nothing here"
        ctaLabel="Old"
        onCtaClick={vi.fn()}
        renderCta={() => <a href="/new">Custom CTA</a>}
      />,
    )
    expect(screen.getByRole('link', { name: 'Custom CTA' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Old' })).not.toBeInTheDocument()
  })
})
