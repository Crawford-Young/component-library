import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as barrel from './index'
import { StatTile } from './stat-tile'

describe('StatTile', () => {
  it('renders a dl with the label as dt and the value as dd', () => {
    const { container } = render(<StatTile label="Issues closed" value="11" />)
    expect(container.querySelector('dl')).toBeInTheDocument()
    expect(container.querySelector('dt')).toHaveTextContent('Issues closed')
    expect(container.querySelector('dd')).toHaveTextContent('11')
  })

  it('accepts a node as the value', () => {
    render(<StatTile label="Spend" value={<b data-testid="v">$7.58</b>} />)
    expect(screen.getByTestId('v')).toHaveTextContent('$7.58')
  })

  it('renders no delta or hint rows when neither is given', () => {
    const { container } = render(<StatTile label="L" value="1" />)
    expect(container.querySelectorAll('dd')).toHaveLength(1)
  })

  it('renders the hint', () => {
    render(<StatTile label="L" value="1" hint="completed only" />)
    expect(screen.getByText('completed only')).toHaveClass('text-muted-foreground')
  })

  describe('delta', () => {
    it('shows a decrease that is good when down is good', () => {
      render(
        <StatTile
          label="L"
          value="1"
          delta={{ change: -0.12, goodWhen: 'down', label: 'vs $8.63' }}
        />,
      )
      const delta = screen.getByText(/12% vs \$8\.63/)
      expect(delta.closest('dd')).toHaveClass('text-success')
      expect(delta.closest('dd')).toHaveTextContent('▼')
      expect(delta.closest('dd')).toHaveTextContent('down')
    })

    it('shows an increase that is bad when down is good', () => {
      render(
        <StatTile
          label="L"
          value="1"
          delta={{ change: 0.35, goodWhen: 'down', label: 'vs 0.63 h' }}
        />,
      )
      const dd = screen.getByText(/35% vs 0\.63 h/).closest('dd')
      expect(dd).toHaveClass('text-warning')
      expect(dd).toHaveTextContent('▲')
      expect(dd).toHaveTextContent('up')
    })

    it('treats an increase as good when up is good', () => {
      render(
        <StatTile label="L" value="1" delta={{ change: 0.5, goodWhen: 'up', label: 'vs 2' }} />,
      )
      expect(screen.getByText(/50% vs 2/).closest('dd')).toHaveClass('text-success')
    })

    it('treats a decrease as bad when up is good', () => {
      render(
        <StatTile label="L" value="1" delta={{ change: -0.5, goodWhen: 'up', label: 'vs 2' }} />,
      )
      expect(screen.getByText(/50% vs 2/).closest('dd')).toHaveClass('text-warning')
    })

    it('is flat when the change is 0', () => {
      render(<StatTile label="L" value="1" delta={{ change: 0, goodWhen: 'up', label: 'vs 17' }} />)
      const dd = screen.getByText('vs 17').closest('dd')
      expect(dd).toHaveClass('text-muted-foreground')
      expect(dd).not.toHaveTextContent('▲')
    })

    it('is flat when the change rounds to 0%', () => {
      render(
        <StatTile label="L" value="1" delta={{ change: 0.002, goodWhen: 'up', label: 'vs 17' }} />,
      )
      const dd = screen.getByText('vs 17').closest('dd')
      expect(dd).toHaveClass('text-muted-foreground')
      expect(dd).not.toHaveTextContent('%')
    })

    it('is flat text when only a label is given', () => {
      render(<StatTile label="L" value="1" delta={{ label: '10 workstreams' }} />)
      const dd = screen.getByText('10 workstreams').closest('dd')
      expect(dd).toHaveClass('text-muted-foreground')
      expect(dd).not.toHaveTextContent('%')
    })

    it('is flat when a change has no goodWhen', () => {
      render(<StatTile label="L" value="1" delta={{ change: 0.2, label: 'vs 5' }} />)
      const dd = screen.getByText(/20% vs 5/).closest('dd')
      expect(dd).toHaveClass('text-muted-foreground')
      expect(dd).toHaveTextContent('▲')
    })

    it.each([
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
      ['-Infinity', Number.NEGATIVE_INFINITY],
    ])('is flat text for a non-finite change (%s)', (_name, change) => {
      render(<StatTile label="L" value="1" delta={{ change, goodWhen: 'up', label: 'vs 0' }} />)
      const dd = screen.getByText('vs 0').closest('dd')
      expect(dd).toHaveClass('text-muted-foreground')
      expect(dd).not.toHaveTextContent(/NaN|Infinity|%|▲|▼/)
    })

    it('says better or worse in text so tone is not color-only', () => {
      const { rerender } = render(
        <StatTile label="L" value="1" delta={{ change: -0.1, goodWhen: 'down', label: 'vs 5' }} />,
      )
      expect(screen.getByText(', better')).toHaveClass('sr-only')
      rerender(
        <StatTile label="L" value="1" delta={{ change: 0.1, goodWhen: 'down', label: 'vs 5' }} />,
      )
      expect(screen.getByText(', worse')).toHaveClass('sr-only')
      rerender(<StatTile label="L" value="1" delta={{ change: 0.1, label: 'vs 5' }} />)
      expect(screen.queryByText(/better|worse/)).not.toBeInTheDocument()
    })

    it('accepts a node as the comparison label', () => {
      render(<StatTile label="L" value="1" delta={{ label: <b data-testid="cmp">vs 17</b> }} />)
      expect(screen.getByTestId('cmp')).toBeInTheDocument()
    })

    it('hides the arrow glyph from assistive tech', () => {
      render(
        <StatTile label="L" value="1" delta={{ change: -0.1, goodWhen: 'down', label: 'vs 5' }} />,
      )
      expect(screen.getByText('▼')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('unavailable', () => {
    it('replaces the value with the reason, muted', () => {
      render(<StatTile label="Permission prompts" unavailable="Not recorded" />)
      expect(screen.getByText('Not recorded').closest('dd')).toHaveClass('text-muted-foreground')
    })

    it('suppresses the delta', () => {
      render(
        <StatTile
          label="L"
          unavailable="Not recorded"
          delta={{ change: 0.3, goodWhen: 'up', label: 'vs 5' }}
        />,
      )
      expect(screen.queryByText(/vs 5/)).not.toBeInTheDocument()
    })

    it('accepts a node as the reason', () => {
      render(<StatTile label="L" unavailable={<i data-testid="why">Off</i>} />)
      expect(screen.getByTestId('why')).toBeInTheDocument()
    })

    it('still shows the hint', () => {
      render(<StatTile label="L" unavailable="Not recorded" hint="hooks are off" />)
      expect(screen.getByText('hooks are off')).toBeInTheDocument()
    })
  })

  it('mutes the value of a real zero', () => {
    const { rerender } = render(<StatTile label="L" value="0" muted />)
    expect(screen.getByText('0').closest('dd')).toHaveClass('text-muted-foreground')
    rerender(<StatTile label="L" value="0" />)
    expect(screen.getByText('0').closest('dd')).not.toHaveClass('text-muted-foreground')
  })

  it('merges className and forwards ref and props', () => {
    const ref = React.createRef<HTMLDListElement>()
    render(<StatTile ref={ref} label="L" value="1" className="custom" data-testid="tile" />)
    expect(screen.getByTestId('tile')).toHaveClass('custom')
    expect(ref.current).toBe(screen.getByTestId('tile'))
  })

  it('exports only the component and its types from the barrel', () => {
    expect(Object.keys(barrel).sort()).toEqual(['StatTile'])
  })

  it('has a displayName', () => {
    expect(StatTile.displayName).toBe('StatTile')
  })
})
