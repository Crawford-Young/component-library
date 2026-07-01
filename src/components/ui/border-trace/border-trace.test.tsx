import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BorderTrace, TraceBorder } from './border-trace'

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

  it('renders a full ring under reduced motion (dash removed via motion-reduce)', () => {
    const { container } = render(<BorderTrace />)
    const traceRect = container.querySelectorAll('rect')[1]
    expect(traceRect.getAttribute('class')).toContain('motion-reduce:[stroke-dasharray:none]')
  })

  it('removes the dash on the circle trace under reduced motion', () => {
    const { container } = render(<BorderTrace shape="circle" />)
    const traceCircle = container.querySelectorAll('circle')[1]
    expect(traceCircle.getAttribute('class')).toContain('motion-reduce:[stroke-dasharray:none]')
  })
})

describe('TraceBorder', () => {
  it('renders only the child when inactive', () => {
    const { container } = render(
      <TraceBorder active={false}>
        <button>Save</button>
      </TraceBorder>,
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('overlays a tracing rect and announces when active', () => {
    const { container } = render(
      <TraceBorder active>
        <button>Save</button>
      </TraceBorder>,
    )
    const overlay = container.querySelector('svg')
    expect(overlay).toBeInTheDocument()
    expect(container.querySelector('rect[stroke-dasharray]')).toBeInTheDocument()
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Loading')
  })

  it('announces a custom label', () => {
    render(
      <TraceBorder active label="Saving goal">
        <button>Save</button>
      </TraceBorder>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saving goal')
  })

  it('overlay rect uses percentage geometry, not CSS calc (invalid in SVG)', () => {
    const { container } = render(
      <TraceBorder active>
        <button>Save</button>
      </TraceBorder>,
    )
    const rect = container.querySelector('rect[stroke-dasharray]')
    expect(rect?.getAttribute('width')).toBe('100%')
    expect(rect?.getAttribute('height')).toBe('100%')
    expect(rect?.getAttribute('width')).not.toContain('calc')
  })

  it('uses a circle overlay when shape="circle"', () => {
    const { container } = render(
      <TraceBorder active shape="circle">
        <button>+</button>
      </TraceBorder>,
    )
    expect(container.querySelector('circle[stroke-dasharray]')).toBeInTheDocument()
  })
})
