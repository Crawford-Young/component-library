import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as barrel from './index'
import { InlineStackedBar } from './inline-stacked-bar'

const segs = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-segment]'))

const SEGMENTS = [
  { key: 'impl', label: 'implementer', value: 30, color: 1 },
  { key: 'recon', label: 'recon', value: 10, color: 2 },
] as const

describe('InlineStackedBar', () => {
  it('splits the bar into segments by share', () => {
    const { container } = render(<InlineStackedBar segments={SEGMENTS} />)
    expect(segs(container).map((s) => s.style.width)).toEqual(['75%', '25%'])
  })

  it('colours each segment from the token the caller picked', () => {
    const { container } = render(
      <InlineStackedBar
        segments={[
          { key: 'a', label: 'a', value: 1, color: 6 },
          { key: 'b', label: 'b', value: 1, color: 3 },
        ]}
      />,
    )
    const [a, b] = segs(container)
    expect(a).toHaveClass('bg-chart-6')
    expect(b).toHaveClass('bg-chart-3')
  })

  it('omits zero, negative and non-finite segments', () => {
    const { container } = render(
      <InlineStackedBar
        segments={[
          { key: 'a', label: 'a', value: 0, color: 1 },
          { key: 'b', label: 'b', value: -2, color: 2 },
          { key: 'c', label: 'c', value: Number.NaN, color: 3 },
          { key: 'd', label: 'd', value: 5, color: 4 },
        ]}
      />,
    )
    expect(segs(container)).toHaveLength(1)
    expect(segs(container)[0].style.width).toBe('100%')
  })

  it('is a thin rounded track', () => {
    render(<InlineStackedBar segments={SEGMENTS} />)
    expect(screen.getByRole('img')).toHaveClass('h-2', 'rounded-full', 'bg-muted', 'flex')
  })

  it('renders an empty track and says so for no segments', () => {
    const { container } = render(<InlineStackedBar segments={[]} name="By model" />)
    expect(segs(container)).toHaveLength(0)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'By model: no values')
  })

  it('lists each segment with value and share in aria-label, default name and formatter', () => {
    render(<InlineStackedBar segments={SEGMENTS} />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Breakdown: implementer 30 (75%), recon 10 (25%)',
    )
  })

  it('uses the formatter and shows exact values in the hover title', () => {
    const { container } = render(
      <InlineStackedBar name="By agent type" segments={SEGMENTS} format={(n) => `${n}h`} />,
    )
    expect(container.firstElementChild).toHaveAttribute(
      'title',
      'implementer: 30h (75%)\nrecon: 10h (25%)',
    )
  })

  it('shows the optional label line under the bar', () => {
    render(<InlineStackedBar segments={SEGMENTS} label="implementer 75%" />)
    expect(screen.getByText('implementer 75%')).toHaveClass('text-muted-foreground')
  })

  it('renders no label line when none is given', () => {
    const { container } = render(<InlineStackedBar segments={SEGMENTS} />)
    expect(container.firstElementChild?.children).toHaveLength(1)
  })

  it('merges className and passes through props on the wrapper', () => {
    render(<InlineStackedBar segments={SEGMENTS} className="extra" data-testid="w" />)
    expect(screen.getByTestId('w')).toHaveClass('extra', 'inline-grid')
  })

  it('forwards the ref to the wrapper', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<InlineStackedBar ref={ref} segments={SEGMENTS} />)
    expect(ref.current).toBe(container.firstElementChild)
  })

  it.each([7, 0, Number.NaN, 1.5, -1])(
    'falls back to a neutral fill for the out-of-range colour %s',
    (color) => {
      const { container } = render(
        <InlineStackedBar
          segments={[{ key: 'a', label: 'a', value: 1, color: color as unknown as 1 }]}
        />,
      )
      const [seg] = segs(container)
      expect(seg).toHaveClass('bg-muted-foreground')
      expect(seg.className).not.toMatch(/bg-chart/)
    },
  )

  it('rounds shares by largest remainder so they sum to 100', () => {
    render(
      <InlineStackedBar
        segments={[
          { key: 'a', label: 'a', value: 1, color: 1 },
          { key: 'b', label: 'b', value: 1, color: 2 },
          { key: 'c', label: 'c', value: 1, color: 3 },
        ]}
      />,
    )
    const label = screen.getByRole('img').getAttribute('aria-label') ?? ''
    const shares = Array.from(label.matchAll(/\((\d+)%\)/g)).map((m) => Number(m[1]))
    expect(shares).toHaveLength(3)
    expect(shares.reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('says <1% for a non-zero segment too small to earn a percent', () => {
    render(
      <InlineStackedBar
        segments={[
          { key: 'a', label: 'a', value: 1000, color: 1 },
          { key: 'b', label: 'b', value: 1, color: 2 },
        ]}
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Breakdown: a 1000 (100%), b 1 (<1%)',
    )
  })

  it('does not let a consumer spread override the computed title or the img role', () => {
    const { container } = render(
      <InlineStackedBar segments={SEGMENTS} title="x" role="presentation" aria-label="x" />,
    )
    expect(container.firstElementChild).toHaveAttribute(
      'title',
      expect.stringContaining('implementer'),
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('implementer'),
    )
  })

  it('has a displayName and is exported from the barrel', () => {
    expect(InlineStackedBar.displayName).toBe('InlineStackedBar')
    expect(barrel.InlineStackedBar).toBe(InlineStackedBar)
  })
})
