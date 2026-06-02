import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterChip } from './filter-chip'

describe('FilterChip', () => {
  it('renders label', () => {
    render(<FilterChip label="Active" isSelected={false} onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument()
  })

  it('applies selected styles when isSelected=true', () => {
    render(<FilterChip label="Active" isSelected onClick={vi.fn()} />)
    expect(screen.getByRole('button').className).toContain('bg-accent')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<FilterChip label="Active" isSelected={false} onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('sets aria-pressed based on isSelected', () => {
    render(<FilterChip label="Active" isSelected onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
