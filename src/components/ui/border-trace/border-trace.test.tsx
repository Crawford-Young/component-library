import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BorderTrace } from './border-trace'

describe('BorderTrace', () => {
  it('has role="status" with default label', () => {
    render(<BorderTrace />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('uses a custom label', () => {
    render(<BorderTrace label="Saving" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Saving')
  })

  it('renders md (24px) square SVG by default', () => {
    const { container } = render(<BorderTrace />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(container.querySelector('rect')).toBeInTheDocument()
  })

  it('renders a circle when shape="circle"', () => {
    const { container } = render(<BorderTrace shape="circle" />)
    expect(container.querySelector('circle')).toBeInTheDocument()
    expect(container.querySelector('rect')).not.toBeInTheDocument()
  })

  it.each([
    ['sm', '16'],
    ['md', '24'],
    ['lg', '32'],
  ] as const)('renders %s size as %spx', (size, px) => {
    const { container } = render(<BorderTrace size={size} />)
    expect(container.querySelector('svg')).toHaveAttribute('width', px)
  })

  it('animates the trace segment with motion-safe class', () => {
    const { container } = render(<BorderTrace />)
    const paths = container.querySelectorAll('rect')
    expect(paths[1].getAttribute('class')).toContain('motion-safe:animate-trace')
  })

  it('renders pulse dot instead of trace at size xs', () => {
    const { container } = render(<BorderTrace size="xs" />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    const dot = container.querySelector('[data-trace-dot]')
    expect(dot).not.toBeNull()
    expect(dot?.getAttribute('class')).toContain('motion-safe:animate-trace-dot')
  })

  it('merges custom className', () => {
    render(<BorderTrace className="text-accent" />)
    expect(screen.getByRole('status').className).toContain('text-accent')
  })
})
