import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as barrel from './index'
import { Sparkbars } from './sparkbars'

const bars = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-spark]'))

describe('Sparkbars', () => {
  it('draws one bar per value, heights scaled to the row max', () => {
    const { container } = render(<Sparkbars values={[10, 5, 20]} />)
    expect(bars(container).map((b) => b.style.height)).toEqual(['50%', '25%', '100%'])
  })

  it('fills non-zero bars from the chart-1 token', () => {
    const { container } = render(<Sparkbars values={[1, 2]} />)
    for (const bar of bars(container)) expect(bar).toHaveClass('bg-chart-1')
  })

  it('draws a zero value as a muted stub, not a chart-1 bar', () => {
    const { container } = render(<Sparkbars values={[0, 4]} />)
    const [zero, full] = bars(container)
    expect(zero).toHaveAttribute('data-zero', 'true')
    expect(zero).toHaveClass('bg-muted-foreground/30', 'h-0.5')
    expect(zero).not.toHaveClass('bg-chart-1')
    expect(zero.style.height).toBe('')
    expect(full).not.toHaveAttribute('data-zero')
  })

  it('draws every value as a stub when the whole row is zero', () => {
    const { container } = render(<Sparkbars values={[0, 0, 0]} />)
    expect(bars(container).every((b) => b.dataset.zero === 'true')).toBe(true)
  })

  it('treats negative and non-finite values as zero', () => {
    const { container } = render(<Sparkbars values={[-3, Number.NaN, 2]} />)
    expect(bars(container).map((b) => b.dataset.zero)).toEqual(['true', 'true', undefined])
  })

  it('renders an empty container for no values', () => {
    const { container } = render(<Sparkbars values={[]} name="Daily spend" />)
    expect(bars(container)).toHaveLength(0)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Daily spend: no values')
  })

  it('fits a table row: about 20px high, inline', () => {
    render(<Sparkbars values={[1]} />)
    expect(screen.getByRole('img')).toHaveClass('inline-flex', 'h-5', 'items-end')
  })

  it('exposes an img role with a label listing each value, default name and formatter', () => {
    render(<Sparkbars values={[0, 18.3]} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Values: 0, 18.3')
  })

  it('lists labelled, formatted values in aria-label and in the hover title', () => {
    const fmt = (n: number): string => `$${n.toFixed(2)}`
    render(
      <Sparkbars name="Spend by day" values={[0, 18.3]} labels={['Oct 8', 'Oct 9']} format={fmt} />,
    )
    const el = screen.getByRole('img', { name: 'Spend by day: Oct 8 $0.00, Oct 9 $18.30' })
    expect(el).toHaveAttribute('title', 'Oct 8: $0.00\nOct 9: $18.30')
  })

  it('falls back to unlabelled entries when labels are shorter than values', () => {
    render(<Sparkbars values={[1, 2]} labels={['a']} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Values: a 1, 2')
    expect(screen.getByRole('img')).toHaveAttribute('title', 'a: 1\n2')
  })

  it('hides the bars from assistive tech', () => {
    const { container } = render(<Sparkbars values={[1]} />)
    expect(bars(container)[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('merges className and passes through props', () => {
    render(<Sparkbars values={[1]} className="extra" data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveClass('extra', 'inline-flex')
  })

  it('forwards the ref to the element', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<Sparkbars ref={ref} values={[1]} />)
    expect(ref.current).toBe(screen.getByRole('img'))
  })

  it('gives a tiny non-zero value a taller, chart-coloured bar than the zero stub', () => {
    const { container } = render(<Sparkbars values={[0, 0.001, 1000]} />)
    const [zero, tiny] = bars(container)
    expect(tiny).toHaveClass('bg-chart-1', 'min-h-[3px]')
    expect(zero).toHaveClass('h-0.5')
    expect(tiny).not.toHaveAttribute('data-zero')
  })

  it('reports negative and non-finite values as no data, not the raw value', () => {
    render(
      <Sparkbars
        values={[-3, Number.NaN, Number.POSITIVE_INFINITY, 2]}
        labels={['a', 'b', 'c', 'd']}
      />,
    )
    const el = screen.getByRole('img')
    expect(el).toHaveAttribute('aria-label', 'Values: a no data, b no data, c no data, d 2')
    expect(el).toHaveAttribute('title', 'a: no data\nb: no data\nc: no data\nd: 2')
  })

  it('does not let a consumer spread override the computed role, label or title', () => {
    render(<Sparkbars values={[1]} role="presentation" aria-label="x" title="y" />)
    const el = screen.getByRole('img')
    expect(el).toHaveAttribute('aria-label', 'Values: 1')
    expect(el).toHaveAttribute('title', '1')
  })

  it('has a displayName and is exported from the barrel', () => {
    expect(Sparkbars.displayName).toBe('Sparkbars')
    expect(barrel.Sparkbars).toBe(Sparkbars)
  })
})
