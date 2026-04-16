import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress } from './progress'

describe('Progress', () => {
  it('renders with progressbar role', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('sets aria-valuenow from value prop', () => {
    render(<Progress value={75} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('renders with default size by default', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar').className).toContain('h-1')
  })

  it.each([
    ['sm', 'h-0.5'],
    ['default', 'h-1'],
    ['lg', 'h-2'],
  ] as const)('renders %s size with correct height class', (size, expectedClass) => {
    render(<Progress value={50} size={size} />)
    expect(screen.getByRole('progressbar').className).toContain(expectedClass)
  })

  it('indicator uses transition class for determinate', () => {
    const { container } = render(<Progress value={60} />)
    const indicator = container.querySelector('[data-radix-progress-indicator]') as HTMLElement
    expect(indicator.className).toContain('transition-all')
  })

  it('indicator uses indeterminate animation when no value', () => {
    const { container } = render(<Progress />)
    const indicator = container.querySelector('[data-radix-progress-indicator]') as HTMLElement
    expect(indicator.className).toContain('animate-progress-indeterminate')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Progress ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges custom className', () => {
    render(<Progress value={50} className="custom" />)
    expect(screen.getByRole('progressbar').className).toContain('custom')
  })

  it('has correct displayName', () => {
    expect(Progress.displayName).toBeDefined()
  })
})
