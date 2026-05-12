import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatChip } from './stat-chip'

describe('StatChip', () => {
  it('renders label and value', () => {
    render(<StatChip label="Tasks due" value="3" />)
    expect(screen.getByText('Tasks due')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<StatChip label="L" value="V" className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
