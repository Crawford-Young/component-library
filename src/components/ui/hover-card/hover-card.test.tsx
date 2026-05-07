import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

function TestHoverCard() {
  return (
    <HoverCard>
      <HoverCardTrigger>Hover me</HoverCardTrigger>
      <HoverCardContent>
        <p>Card content</p>
      </HoverCardContent>
    </HoverCard>
  )
}

describe('HoverCard', () => {
  it('renders trigger', () => {
    render(<TestHoverCard />)
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('is closed by default', () => {
    render(<TestHoverCard />)
    expect(screen.queryByText('Card content')).not.toBeInTheDocument()
  })

  it('opens on hover', async () => {
    const user = userEvent.setup()
    render(<TestHoverCard />)
    await user.hover(screen.getByText('Hover me'))
    await waitFor(() => expect(screen.getByText('Card content')).toBeInTheDocument(), {
      timeout: 2000,
    })
  })

  it('closes when pointer leaves', async () => {
    const user = userEvent.setup()
    render(<TestHoverCard />)
    await user.hover(screen.getByText('Hover me'))
    await waitFor(() => screen.getByText('Card content'))
    await user.unhover(screen.getByText('Hover me'))
    await waitFor(() => expect(screen.queryByText('Card content')).not.toBeInTheDocument(), {
      timeout: 2000,
    })
  })

  it('HoverCardContent applies popover styling', async () => {
    const user = userEvent.setup()
    render(<TestHoverCard />)
    await user.hover(screen.getByText('Hover me'))
    await waitFor(() => screen.getByText('Card content'))
    const content = screen.getByText('Card content').closest('[data-radix-popper-content-wrapper]')
      ?.firstChild as HTMLElement
    expect(content?.className).toContain('bg-popover')
    expect(content?.className).toContain('border-border')
    expect(content?.className).toContain('shadow-md')
  })

  it('HoverCardContent accepts custom className', async () => {
    const user = userEvent.setup()
    render(
      <HoverCard>
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent className="w-96">
          <p>Content</p>
        </HoverCardContent>
      </HoverCard>,
    )
    await user.hover(screen.getByText('Hover'))
    await waitFor(() => screen.getByText('Content'))
    const content = screen.getByText('Content').closest('[data-radix-popper-content-wrapper]')
      ?.firstChild as HTMLElement
    expect(content?.className).toContain('w-96')
  })
})
