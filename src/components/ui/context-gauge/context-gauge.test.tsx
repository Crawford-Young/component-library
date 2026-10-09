import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContextGauge, contextGaugeTone } from './context-gauge'

describe('contextGaugeTone', () => {
  it('is ok below the nudge threshold', () => {
    expect(contextGaugeTone(79)).toBe('ok')
  })
  it('is warn from the nudge threshold up to the hard stop', () => {
    expect(contextGaugeTone(80)).toBe('warn')
    expect(contextGaugeTone(94)).toBe('warn')
  })
  it('is danger at and above the hard stop', () => {
    expect(contextGaugeTone(95)).toBe('danger')
    expect(contextGaugeTone(100)).toBe('danger')
  })
  it('honours custom thresholds', () => {
    expect(contextGaugeTone(50, 40, 60)).toBe('warn')
    expect(contextGaugeTone(60, 40, 60)).toBe('danger')
  })
})

describe('ContextGauge', () => {
  it('exposes a named meter with 0-100 bounds', () => {
    render(<ContextGauge value={62} />)
    const meter = screen.getByRole('meter', { name: 'Context used' })
    expect(meter).toHaveAttribute('aria-valuenow', '62')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps out-of-range values', () => {
    const { rerender } = render(<ContextGauge value={140} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100')
    rerender(<ContextGauge value={-5} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0')
  })

  it('treats NaN as 0', () => {
    render(<ContextGauge value={Number.NaN} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0')
  })

  it('sizes the fill to the value and colours it by tone', () => {
    const { rerender } = render(<ContextGauge value={62} />)
    const fill = () => screen.getByRole('meter').firstChild as HTMLElement
    expect(fill().style.width).toBe('62%')
    expect(fill()).toHaveClass('bg-success')
    rerender(<ContextGauge value={85} />)
    expect(fill()).toHaveClass('bg-warning')
    rerender(<ContextGauge value={97} />)
    expect(fill()).toHaveClass('bg-destructive')
  })

  it('passes custom thresholds to the tone', () => {
    render(<ContextGauge value={50} nudgeAt={40} hardStopAt={60} />)
    expect(screen.getByRole('meter').firstChild).toHaveClass('bg-warning')
  })

  it('shows the label after the bar', () => {
    render(<ContextGauge value={62} label="62%" />)
    expect(screen.getByText('62%')).toBeInTheDocument()
  })

  it('omits the label when absent', () => {
    const { container } = render(<ContextGauge value={62} />)
    expect(container.firstElementChild?.children).toHaveLength(1)
  })

  it('supports sizes, a custom name and className', () => {
    const { container } = render(
      <ContextGauge value={10} size="md" aria-label="Window" className="extra" />,
    )
    expect(screen.getByRole('meter', { name: 'Window' })).toHaveClass('h-1', 'w-24')
    expect(container.firstElementChild).toHaveClass('extra')
  })

  it('forwards ref and remaining props to the wrapper', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(<ContextGauge ref={ref} value={10} data-x="1" />)
    expect(ref.current).toBe(container.firstElementChild)
    expect(ref.current).toHaveAttribute('data-x', '1')
    expect(ContextGauge.displayName).toBe('ContextGauge')
  })
})
