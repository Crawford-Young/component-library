import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TokenChip } from './token-chip'

describe('TokenChip', () => {
  it('renders the balance with accessible label', () => {
    render(<TokenChip balance={142} />)
    expect(screen.getByText('142')).toBeInTheDocument()
    expect(screen.getByLabelText('Token balance: 142')).toBeInTheDocument()
  })

  it('uses normal styling at or above the low threshold', () => {
    render(<TokenChip balance={25} />)
    expect(screen.getByLabelText('Token balance: 25')).toHaveAttribute('data-state', 'normal')
  })

  it('uses low styling below the low threshold', () => {
    render(<TokenChip balance={24} />)
    expect(screen.getByLabelText('Token balance: 24')).toHaveAttribute('data-state', 'low')
  })

  it('uses zero styling at zero balance', () => {
    render(<TokenChip balance={0} />)
    expect(screen.getByLabelText('Token balance: 0')).toHaveAttribute('data-state', 'zero')
  })

  it('respects a custom low threshold', () => {
    render(<TokenChip balance={40} lowThreshold={50} />)
    expect(screen.getByLabelText('Token balance: 40')).toHaveAttribute('data-state', 'low')
  })

  it('merges custom className', () => {
    render(<TokenChip balance={1} className="custom" />)
    expect(screen.getByLabelText('Token balance: 1')).toHaveClass('custom')
  })
})
