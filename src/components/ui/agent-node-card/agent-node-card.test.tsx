import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AgentNodeCard, AgentNodeCharge } from './agent-node-card'

describe('AgentNodeCard', () => {
  it('renders a button with name, detail and default state label', () => {
    render(<AgentNodeCard name="planner" detail="reading files" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn).toHaveTextContent('planner')
    expect(btn).toHaveTextContent('reading files')
    expect(screen.getByText('working')).toBeInTheDocument()
  })

  it.each([
    ['working', 'working', 'text-success', 'bg-success'],
    ['needs-you', 'needs you', 'text-warning', 'bg-warning'],
    ['idle', 'idle', 'text-muted-foreground', 'bg-muted-foreground'],
    ['done', 'done', 'text-muted-foreground', 'bg-muted-foreground'],
  ] as const)('state %s labels and colours', (state, label, text, dot) => {
    const { container } = render(<AgentNodeCard name="a" state={state} />)
    expect(screen.getByText(label)).toHaveClass(text)
    expect(container.querySelector('[data-slot="dot"]')).toHaveClass(dot)
  })

  it('overrides the state label via stateLabel', () => {
    render(<AgentNodeCard name="a" stateLabel={<em>blocked</em>} />)
    expect(screen.getByText('blocked')).toBeInTheDocument()
    expect(screen.queryByText('working')).not.toBeInTheDocument()
  })

  it('reflects selected via aria-pressed and a ring', () => {
    const { rerender } = render(<AgentNodeCard name="a" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    rerender(<AgentNodeCard name="a" selected />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button')).toHaveClass('ring-2', 'ring-accent')
  })

  it('de-emphasises without opacity on text when dimmed', () => {
    const { container } = render(<AgentNodeCard name="planner" dimmed context={50} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('border-border-subtle')
    expect(btn).not.toHaveClass('opacity-50')
    expect(screen.getByText('planner')).toHaveClass('text-muted-foreground')
    expect(screen.getByText('working')).toHaveClass('text-muted-foreground')
    expect(container.querySelector('[data-slot="dot"]')).toHaveClass('opacity-50')
  })

  it('omits the gauge without context and renders it with context', () => {
    const { rerender } = render(<AgentNodeCard name="a" />)
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()
    rerender(<AgentNodeCard name="a" context={85} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '85')
  })

  it('passes thresholds and context label to the gauge', () => {
    render(<AgentNodeCard name="a" context={50} nudgeAt={40} hardStopAt={60} contextLabel="50%" />)
    expect(screen.getByRole('meter').firstChild).toHaveClass('bg-warning')
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('omits the detail row without detail', () => {
    const { container } = render(<AgentNodeCard name="a" />)
    expect(container.querySelector('[data-slot="detail"]')).toBeNull()
  })

  it('forwards ref, className and props', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<AgentNodeCard ref={ref} name="a" className="w-44" data-x="1" />)
    expect(ref.current).toBe(screen.getByRole('button'))
    expect(ref.current).toHaveClass('w-44')
    expect(ref.current).toHaveAttribute('data-x', '1')
  })
})

describe('AgentNodeCard slots', () => {
  it('shows lane and charge together on one row below the name', () => {
    const { container } = render(
      <AgentNodeCard name="a" lane="background" charge={<span>#109</span>} />,
    )
    const row = container.querySelector('[data-slot="meta"]')
    expect(row).toHaveTextContent('background')
    expect(row).toHaveTextContent('#109')
  })

  it('omits the meta row without lane or charge', () => {
    const { container } = render(<AgentNodeCard name="a" detail="x" />)
    expect(container.querySelector('[data-slot="meta"]')).toBeNull()
  })

  it('renders a lane alone, and a charge alone', () => {
    const { container, rerender } = render(<AgentNodeCard name="a" lane="interactive" />)
    expect(container.querySelector('[data-slot="meta"]')).toHaveTextContent('interactive')
    rerender(<AgentNodeCard name="a" charge="#7" />)
    expect(container.querySelector('[data-slot="meta"]')).toHaveTextContent('#7')
  })

  it('keeps detail working alongside the new slots', () => {
    render(<AgentNodeCard name="a" detail="reading" lane="subagent" />)
    expect(screen.getByRole('button')).toHaveTextContent('reading')
    expect(screen.getByRole('button')).toHaveTextContent('subagent')
  })

  it('puts cost before the state label, spoken as words in the accessible name', () => {
    render(<AgentNodeCard name="planner" state="needs-you" cost="$1.23" />)
    expect(screen.getByRole('button', { name: /planner.*\$1\.23 needs you/ })).toBeInTheDocument()
  })

  it('keeps cost with a custom stateLabel', () => {
    render(<AgentNodeCard name="a" cost="$2.00" stateLabel="blocked" />)
    expect(screen.getByRole('button')).toHaveTextContent('$2.00 blocked')
  })

  it('contains no block elements, so it is valid inside the button', () => {
    render(
      <AgentNodeCard
        name="a"
        lane="x"
        cost="$1"
        charge={<AgentNodeCharge chargeKey="k" source="branch" />}
        context={10}
      />,
    )
    expect(screen.getByRole('button').querySelector('div')).toBeNull()
  })
})

describe('AgentNodeCharge', () => {
  it('shows the charge key as the chip text', () => {
    render(<AgentNodeCharge chargeKey="strate#109" source="branch" />)
    expect(screen.getByText('strate#109')).toBeInTheDocument()
  })

  it('exposes the source to screen readers as text, not only a title', () => {
    render(
      <button type="button">
        <AgentNodeCharge chargeKey="strate#109" source="branch name" />
      </button>,
    )
    expect(screen.getByRole('button', { name: /charge from branch name/ })).toBeInTheDocument()
    expect(screen.getByText(/charge from branch name/)).toHaveClass('sr-only')
  })

  it('also sets a hover title carrying the source', () => {
    render(<AgentNodeCharge chargeKey="k" source="branch" data-testid="c" />)
    expect(screen.getByTestId('c')).toHaveAttribute('title', 'charge from branch')
  })

  it('says unlinked and no charge when there is no key', () => {
    render(<AgentNodeCharge chargeKey={null} data-testid="c" />)
    expect(screen.getByText('unlinked')).toBeInTheDocument()
    expect(screen.getByText(/no charge/)).toHaveClass('sr-only')
    expect(screen.getByTestId('c')).toHaveAttribute('title', 'no charge')
  })

  it('names a charge with no known source plainly', () => {
    render(<AgentNodeCharge chargeKey="k" />)
    expect(screen.getByText(/^, charge$/)).toHaveClass('sr-only')
  })

  it('truncates a long key inside the chip and keeps className/props', () => {
    render(<AgentNodeCharge chargeKey="very-long-key" className="extra" data-testid="c" />)
    expect(screen.getByTestId('c')).toHaveClass('extra', 'min-w-0', 'font-mono')
    expect(screen.getByText('very-long-key')).toHaveClass('truncate')
  })
})
