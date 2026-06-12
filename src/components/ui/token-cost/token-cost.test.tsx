import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TokenCost } from './token-cost'

describe('TokenCost', () => {
  it('renders approximate cost with accessible label', () => {
    render(<TokenCost estimate={4} />)
    expect(screen.getByText('~4')).toBeInTheDocument()
    expect(screen.getByLabelText('Estimated cost: about 4 tokens')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<TokenCost estimate={2} className="custom" />)
    expect(screen.getByLabelText('Estimated cost: about 2 tokens')).toHaveClass('custom')
  })
})
