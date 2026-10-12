import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusDot, statusDotVariants } from './status-dot'

describe('StatusDot', () => {
  it('defaults to the working state and is decorative without a label', () => {
    const { container } = render(<StatusDot />)
    const dot = container.firstElementChild as HTMLElement
    expect(dot.className).toContain('bg-success')
    expect(dot).toHaveAttribute('aria-hidden', 'true')
    expect(dot).not.toHaveAttribute('role')
    expect(dot).not.toHaveAttribute('aria-label')
  })

  it.each([
    ['working', 'bg-success'],
    ['needs-you', 'bg-warning'],
    ['idle', 'bg-muted-foreground'],
    ['done', 'opacity-60'],
  ] as const)('renders %s state with key class', (state, expectedClass) => {
    const { container } = render(<StatusDot state={state} />)
    expect((container.firstElementChild as HTMLElement).className).toContain(expectedClass)
  })

  it('exposes an image role with the label when label is given', () => {
    render(<StatusDot state="needs-you" label="Needs you" />)
    const dot = screen.getByRole('img', { name: 'Needs you' })
    expect(dot).not.toHaveAttribute('aria-hidden')
  })

  it('merges custom className and passes through attributes', () => {
    render(<StatusDot className="custom-class" data-testid="dot" />)
    expect(screen.getByTestId('dot').className).toContain('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<StatusDot ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('exposes variants function and displayName', () => {
    expect(statusDotVariants({ state: 'idle' })).toContain('bg-muted-foreground')
    expect(StatusDot.displayName).toBe('StatusDot')
  })
})
