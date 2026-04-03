import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('has role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('applies animate-spin class', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').className).toContain('animate-spin')
  })

  it('renders md size by default', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').className).toContain('h-6')
    expect(screen.getByRole('status').className).toContain('w-6')
  })

  it('renders sm size', () => {
    render(<Spinner size="sm" />)
    expect(screen.getByRole('status').className).toContain('h-4')
    expect(screen.getByRole('status').className).toContain('w-4')
  })

  it('renders lg size', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByRole('status').className).toContain('h-8')
    expect(screen.getByRole('status').className).toContain('w-8')
  })

  it('merges custom className', () => {
    render(<Spinner className="text-primary" />)
    expect(screen.getByRole('status').className).toContain('text-primary')
  })
})
