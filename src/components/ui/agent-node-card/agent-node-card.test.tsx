import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AgentNodeCard } from './agent-node-card'

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
