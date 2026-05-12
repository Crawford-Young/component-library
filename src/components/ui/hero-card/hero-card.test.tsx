import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HeroCard } from './hero-card'

describe('HeroCard', () => {
  it('renders headline and subtitle', () => {
    render(
      <HeroCard
        headline="Ready to plan?"
        subtitle="3 hours free today"
        onCtaClick={vi.fn()}
        ctaLabel="Plan now"
      />,
    )
    expect(screen.getByText('Ready to plan?')).toBeInTheDocument()
    expect(screen.getByText('3 hours free today')).toBeInTheDocument()
  })

  it('renders CTA button with correct label', () => {
    render(<HeroCard headline="H" subtitle="S" onCtaClick={vi.fn()} ctaLabel="Start planning" />)
    expect(screen.getByRole('button', { name: 'Start planning' })).toBeInTheDocument()
  })

  it('calls onCtaClick when CTA clicked', async () => {
    const user = userEvent.setup()
    const onCtaClick = vi.fn()
    render(<HeroCard headline="H" subtitle="S" onCtaClick={onCtaClick} ctaLabel="Go" />)
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onCtaClick).toHaveBeenCalledOnce()
  })

  it('merges custom className', () => {
    const { container } = render(
      <HeroCard headline="H" subtitle="S" onCtaClick={vi.fn()} ctaLabel="Go" className="custom" />,
    )
    expect(container.firstChild).toHaveClass('custom')
  })
})
