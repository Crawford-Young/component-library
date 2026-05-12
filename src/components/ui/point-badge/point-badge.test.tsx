import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PointBadge } from './point-badge'

describe('PointBadge', () => {
  it('renders points value with + prefix', () => {
    render(<PointBadge points={10} />)
    expect(screen.getByText('+10 pts')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<PointBadge points={50} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
