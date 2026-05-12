import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoreHistory } from './score-history'

const weeks = [
  { week: 'Apr 28', points: 120 },
  { week: 'May 5', points: 340 },
]

describe('ScoreHistory', () => {
  it('renders chart container', () => {
    const { container } = render(<ScoreHistory weeks={weeks} />)
    expect(container.querySelector('[data-testid="score-history"]')).toBeInTheDocument()
  })

  it('renders with empty data without crashing', () => {
    expect(() => render(<ScoreHistory weeks={[]} />)).not.toThrow()
  })

  it('merges custom className', () => {
    const { container } = render(<ScoreHistory weeks={weeks} className="custom" />)
    expect(container.querySelector('[data-testid="score-history"]')).toHaveClass('custom')
  })
})
