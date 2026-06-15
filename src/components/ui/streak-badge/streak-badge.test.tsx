import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StreakBadge } from './streak-badge'

describe('StreakBadge', () => {
  it('renders nothing when streak is 0', () => {
    const { container } = render(<StreakBadge streak={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders streak count when streak > 0', () => {
    render(<StreakBadge streak={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders flame icon when streak > 0', () => {
    const { container } = render(<StreakBadge streak={5} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders correct streak count for large values', () => {
    render(<StreakBadge streak={30} />)
    expect(screen.getByText('30')).toBeInTheDocument()
  })
})
