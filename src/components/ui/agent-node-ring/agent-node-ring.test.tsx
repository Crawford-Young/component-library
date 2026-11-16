import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { AgentNodeState } from '../agent-node-card'
import { AgentNodeRing, agentNodeRingVariants, type AgentNodeRingSize } from '.'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  interface Assertion<T = any> {
    toHaveNoViolations(): void
  }
}

expect.extend(toHaveNoViolations)

const SIZES: readonly AgentNodeRingSize[] = ['root', 'default', 'dense']
const STATES: readonly AgentNodeState[] = ['working', 'needs-you', 'idle', 'done']
const ROUND: readonly AgentNodeRingSize[] = ['root', 'default']

const slot = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLElement>(`[data-slot="${name}"]`)

const classesOf = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe('AgentNodeRing - button contract', () => {
  it.each(SIZES)('renders one type=button with data-size/data-state (%s)', (size) => {
    render(<AgentNodeRing name="implementer" size={size} state="idle" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn).toHaveAttribute('data-size', size)
    expect(btn).toHaveAttribute('data-state', 'idle')
  })

  it('defaults to size default and state working', () => {
    render(<AgentNodeRing name="implementer" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('data-size', 'default')
    expect(btn).toHaveAttribute('data-state', 'working')
  })

  it.each(SIZES)('is positioned (relative) so sr-only children stay inside (%s)', (size) => {
    render(<AgentNodeRing name="implementer" size={size} />)
    expect(screen.getByRole('button')).toHaveClass('relative')
  })

  it.each(SIZES)('has a visible focus-visible indicator (%s)', (size) => {
    render(<AgentNodeRing name="implementer" size={size} />)
    const classes = classesOf(screen.getByRole('button'))
    expect(classes.some((c) => c.startsWith('focus-visible:'))).toBe(true)
  })

  it.each(SIZES)('reflects selected through aria-pressed (%s)', (size) => {
    const { rerender } = render(<AgentNodeRing name="implementer" size={size} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    rerender(<AgentNodeRing name="implementer" size={size} selected />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it.each(SIZES)('forwards the ref to the button (%s)', (size) => {
    const ref = createRef<HTMLButtonElement>()
    render(<AgentNodeRing ref={ref} name="implementer" size={size} />)
    expect(ref.current).toBe(screen.getByRole('button'))
  })

  it.each(SIZES)('passes onClick and other props through (%s)', (size) => {
    const onClick = vi.fn()
    render(<AgentNodeRing name="implementer" size={size} onClick={onClick} data-x="1" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('data-x', '1')
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it.each(SIZES)('merges className onto the button (%s)', (size) => {
    render(<AgentNodeRing name="implementer" size={size} className="extra-class" />)
    expect(screen.getByRole('button')).toHaveClass('extra-class')
  })

  it('lets a consumer className override the dense default size', () => {
    render(<AgentNodeRing name="implementer" size="dense" className="size-12" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('size-12')
    expect(btn).not.toHaveClass('size-3')
  })
})

describe('AgentNodeRing - round layout (root/default)', () => {
  it.each([
    ['root', 'size-[120px]'],
    ['default', 'size-24'],
  ] as const)('%s disc is a round %s element', (size, cls) => {
    const { container } = render(<AgentNodeRing name="implementer" size={size} context={10} />)
    const disc = slot(container, 'ring')!
    expect(disc).toHaveClass('rounded-full', cls)
  })

  it.each(ROUND)('orders disc, role label, then detail (%s)', (size) => {
    const { container } = render(
      <AgentNodeRing name="implementer" size={size} charge="strate#62" cost="$7.10" />,
    )
    const disc = slot(container, 'ring')!
    const name = slot(container, 'name')!
    const detail = slot(container, 'detail')!
    expect(disc.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(name.compareDocumentPosition(detail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it.each(ROUND)('styles the role label and the detail line (%s)', (size) => {
    const { container } = render(<AgentNodeRing name="implementer" size={size} />)
    const name = slot(container, 'name')!
    expect(name).toHaveTextContent('implementer')
    expect(name).toHaveClass('text-[22px]', 'font-semibold', 'text-foreground')
    expect(slot(container, 'detail')).toHaveClass('text-[18px]', 'text-muted-foreground')
  })

  it.each(ROUND)('draws a decorative 100x100 SVG with a muted track (%s)', (size) => {
    const { container } = render(<AgentNodeRing name="implementer" size={size} context={30} />)
    const svg = slot(container, 'ring')!.querySelector('svg')!
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    const track = slot(container, 'ring-track')!
    expect(svg).toContainElement(track)
    expect(classesOf(track).some((c) => /^stroke-(muted|surface-raised)/.test(c))).toBe(true)
  })

  it.each(ROUND)('keeps calc() out of every SVG geometry attribute (%s)', (size) => {
    const { container } = render(<AgentNodeRing name="implementer" size={size} context={30} />)
    const svg = container.querySelector('svg')!
    const all = [svg, ...Array.from(svg.querySelectorAll('*'))]
    expect(all.length).toBeGreaterThan(2)
    for (const el of all) {
      for (const attr of Array.from(el.attributes)) {
        expect(attr.value, `${el.tagName}[${attr.name}]`).not.toContain('calc(')
      }
    }
  })

  it.each(ROUND)('has no hex or rgb literal in any class or inline style (%s)', (size) => {
    const { container } = render(
      <AgentNodeRing
        name="implementer"
        size={size}
        state="needs-you"
        context={97}
        selected
        charge="strate#62"
        cost="$7.10"
      />,
    )
    for (const el of [container, ...Array.from(container.querySelectorAll('*'))]) {
      const cls = el.getAttribute('class') ?? ''
      const style = el.getAttribute('style') ?? ''
      expect(cls).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
      expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
    }
  })
})

describe('AgentNodeRing - context ring', () => {
  it('keeps a decorative 0-100 meter, a numeric dasharray and a rounded centre value', () => {
    const { container } = render(<AgentNodeRing name="implementer" context={62} />)
    const meter = screen.getByRole('meter', { hidden: true })
    expect(meter).toHaveAttribute('aria-valuenow', '62')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
    const fill = slot(container, 'ring-fill')!
    expect(fill).toHaveAttribute('pathLength', '100')
    expect(fill).toHaveAttribute('stroke-dasharray', '62 100')
    const value = slot(container, 'value')!
    expect(value).toHaveTextContent('62%')
    expect(value).toHaveClass('font-mono', 'tabular-nums')
  })

  it('rounds the displayed percent but keeps the exact fill', () => {
    const { container } = render(<AgentNodeRing name="implementer" context={61.6} />)
    expect(slot(container, 'value')).toHaveTextContent('62%')
    expect(slot(container, 'ring-fill')).toHaveAttribute('stroke-dasharray', '61.6 100')
  })

  it('clamps context above 100', () => {
    const { container } = render(<AgentNodeRing name="implementer" context={140} />)
    expect(screen.getByRole('meter', { hidden: true })).toHaveAttribute('aria-valuenow', '100')
    expect(slot(container, 'ring-fill')).toHaveAttribute('stroke-dasharray', '100 100')
    expect(slot(container, 'value')).toHaveTextContent('100%')
  })

  it('clamps context below 0', () => {
    const { container } = render(<AgentNodeRing name="implementer" context={-5} />)
    expect(screen.getByRole('meter', { hidden: true })).toHaveAttribute('aria-valuenow', '0')
    expect(slot(container, 'ring-fill')).toHaveAttribute('stroke-dasharray', '0 100')
    expect(slot(container, 'value')).toHaveTextContent('0%')
  })

  it('treats NaN as 0', () => {
    const { container } = render(<AgentNodeRing name="implementer" context={Number.NaN} />)
    expect(screen.getByRole('meter', { hidden: true })).toHaveAttribute('aria-valuenow', '0')
    expect(slot(container, 'ring-fill')).toHaveAttribute('stroke-dasharray', '0 100')
    expect(slot(container, 'value')).toHaveTextContent('0%')
  })

  it('shows only the track when context is undefined', () => {
    const { container } = render(<AgentNodeRing name="implementer" />)
    expect(slot(container, 'ring-track')).toBeInTheDocument()
    expect(slot(container, 'ring-fill')).toBeNull()
    expect(slot(container, 'value')).toBeNull()
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()
  })

  it.each([
    [0, 'ok', 'stroke-success'],
    [79, 'ok', 'stroke-success'],
    [80, 'warn', 'stroke-warning'],
    [94, 'warn', 'stroke-warning'],
    [95, 'danger', 'stroke-destructive'],
    [100, 'danger', 'stroke-destructive'],
  ] as const)('context %s has tone %s with %s by default thresholds', (ctx, tone, cls) => {
    const { container } = render(<AgentNodeRing name="implementer" context={ctx} />)
    const fill = slot(container, 'ring-fill')!
    expect(fill).toHaveAttribute('data-tone', tone)
    expect(fill).toHaveClass(cls)
  })

  it('honours custom nudgeAt and hardStopAt', () => {
    const { container, rerender } = render(
      <AgentNodeRing name="implementer" context={50} nudgeAt={40} hardStopAt={60} />,
    )
    expect(slot(container, 'ring-fill')).toHaveAttribute('data-tone', 'warn')
    expect(slot(container, 'ring-fill')).toHaveClass('stroke-warning')
    rerender(<AgentNodeRing name="implementer" context={60} nudgeAt={40} hardStopAt={60} />)
    expect(slot(container, 'ring-fill')).toHaveAttribute('data-tone', 'danger')
    expect(slot(container, 'ring-fill')).toHaveClass('stroke-destructive')
    rerender(<AgentNodeRing name="implementer" context={39} nudgeAt={40} hardStopAt={60} />)
    expect(slot(container, 'ring-fill')).toHaveAttribute('data-tone', 'ok')
  })

  it('judges the tone on the clamped value', () => {
    const { container } = render(<AgentNodeRing name="implementer" context={250} />)
    expect(slot(container, 'ring-fill')).toHaveAttribute('data-tone', 'danger')
  })
})

describe('AgentNodeRing - detail line', () => {
  const partsText = (detail: HTMLElement) => detail.textContent ?? ''
  const separators = (detail: HTMLElement) =>
    Array.from(detail.querySelectorAll('[aria-hidden="true"]')).filter((e) =>
      (e.textContent ?? '').includes('·'),
    )

  it.each(ROUND)('orders charge, state label, cost with aria-hidden separators (%s)', (size) => {
    const { container } = render(
      <AgentNodeRing name="implementer" size={size} charge="strate#62" cost="$7.10" />,
    )
    const detail = slot(container, 'detail')!
    const text = partsText(detail)
    const a = text.indexOf('strate#62')
    const b = text.indexOf('working')
    const c = text.indexOf('$7.10')
    expect(a).toBeGreaterThanOrEqual(0)
    expect(b).toBeGreaterThan(a)
    expect(c).toBeGreaterThan(b)
    expect(separators(detail)).toHaveLength(2)
  })

  it('drops the charge and its separator when omitted', () => {
    const { container } = render(<AgentNodeRing name="implementer" cost="$7.10" />)
    const detail = slot(container, 'detail')!
    expect(partsText(detail)).not.toContain('strate')
    expect(partsText(detail).indexOf('$7.10')).toBeGreaterThan(partsText(detail).indexOf('working'))
    expect(separators(detail)).toHaveLength(1)
  })

  it('drops the cost and its separator when omitted', () => {
    const { container } = render(<AgentNodeRing name="implementer" charge="strate#62" />)
    const detail = slot(container, 'detail')!
    expect(partsText(detail)).not.toContain('$')
    expect(partsText(detail).indexOf('strate#62')).toBeLessThan(
      partsText(detail).indexOf('working'),
    )
    expect(separators(detail)).toHaveLength(1)
  })

  it('holds only the state label, with no separator, when charge and cost are omitted', () => {
    const { container } = render(<AgentNodeRing name="implementer" />)
    const detail = slot(container, 'detail')!
    expect(partsText(detail).trim()).toBe('working')
    expect(separators(detail)).toHaveLength(0)
  })

  it.each([
    ['working', 'working'],
    ['needs-you', 'needs you'],
    ['idle', 'idle'],
    ['done', 'done'],
  ] as const)('labels state %s as "%s" by default', (state, label) => {
    const { container } = render(<AgentNodeRing name="implementer" state={state} />)
    expect(slot(container, 'state')).toHaveTextContent(label)
  })

  it('overrides the state label via stateLabel', () => {
    const { container } = render(<AgentNodeRing name="implementer" stateLabel={<em>blocked</em>} />)
    expect(slot(container, 'state')).toHaveTextContent('blocked')
    expect(screen.queryByText('working')).not.toBeInTheDocument()
  })

  it.each([
    ['working', ['text-foreground', 'dark:text-success']],
    ['needs-you', ['text-foreground', 'dark:text-warning']],
    ['idle', ['text-muted-foreground']],
    ['done', ['text-muted-foreground']],
  ] as const)('state %s carries tone classes %j', (state, expected) => {
    const { container } = render(<AgentNodeRing name="implementer" state={state} />)
    const classes = classesOf(slot(container, 'state')!)
    for (const cls of expected) expect(classes).toContain(cls)
    expect(classes).not.toContain('text-success')
    expect(classes).not.toContain('text-warning')
  })
})

describe('AgentNodeRing - needs-you emphasis and selection (round)', () => {
  const hasWarningEmphasis = (el: Element) =>
    classesOf(el).some((c) => /^(ring-warning|outline-warning|border-warning)/.test(c))

  it.each(ROUND)('puts a warning outline on the disc only for needs-you (%s)', (size) => {
    for (const state of STATES) {
      const { container, unmount } = render(
        <AgentNodeRing name="implementer" size={size} state={state} context={10} />,
      )
      const disc = slot(container, 'ring')!
      expect(hasWarningEmphasis(disc), state).toBe(state === 'needs-you')
      unmount()
    }
  })

  it.each(ROUND)('puts a ring-accent selection ring on the disc when selected (%s)', (size) => {
    const { container, rerender } = render(<AgentNodeRing name="implementer" size={size} />)
    expect(slot(container, 'ring')).not.toHaveClass('ring-accent')
    rerender(<AgentNodeRing name="implementer" size={size} selected />)
    expect(slot(container, 'ring')).toHaveClass('ring-2', 'ring-accent')
  })

  it.each(ROUND)('keeps both the warning outline and the selection ring (%s)', (size) => {
    const { container } = render(
      <AgentNodeRing name="implementer" size={size} state="needs-you" selected />,
    )
    const disc = slot(container, 'ring')!
    expect(disc).toHaveClass('ring-2', 'ring-accent')
    expect(hasWarningEmphasis(disc)).toBe(true)
  })
})

describe('AgentNodeRing - decorative meter', () => {
  it('hides the meter from the accessibility tree so the percent is announced once', () => {
    render(<AgentNodeRing name="implementer" context={42.4} />)
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()
    expect(screen.getByRole('meter', { hidden: true })).toHaveAttribute('aria-hidden', 'true')
  })

  it('rounds aria-valuenow like the visible value', () => {
    render(<AgentNodeRing name="implementer" context={42.4} />)
    expect(screen.getByRole('meter', { hidden: true })).toHaveAttribute('aria-valuenow', '42')
  })
})

describe('AgentNodeRing - dense focus and selection', () => {
  it('keeps the selection outline when a selected dot is keyboard-focused', () => {
    render(<AgentNodeRing name="implementer" size="dense" selected />)
    const classes = classesOf(screen.getByRole('button'))
    expect(classes).toContain('outline-accent')
    expect(classes).not.toContain('focus-visible:outline-none')
  })

  it('still drops the browser outline on an unselected dot and on round nodes', () => {
    for (const size of SIZES) {
      const { unmount } = render(<AgentNodeRing name="implementer" size={size} />)
      expect(classesOf(screen.getByRole('button')), size).toContain('focus-visible:outline-none')
      unmount()
    }
  })
})

describe('AgentNodeRing - variants export', () => {
  it('exports agentNodeRingVariants for the size classes', () => {
    expect(agentNodeRingVariants({ size: 'dense' })).toContain('size-3')
    expect(agentNodeRingVariants({ size: 'root' })).toContain('flex-col')
  })
})

describe('AgentNodeRing - dense dot', () => {
  it('is a small round button the consumer can resize', () => {
    render(<AgentNodeRing name="implementer" size="dense" />)
    expect(screen.getByRole('button')).toHaveClass('rounded-full', 'size-3')
  })

  it.each([
    ['working', ['bg-success']],
    ['needs-you', ['bg-warning']],
    ['idle', ['bg-muted-foreground']],
    ['done', ['bg-muted-foreground', 'opacity-60']],
  ] as const)('colours the %s dot', (state, classes) => {
    const { container } = render(<AgentNodeRing name="implementer" size="dense" state={state} />)
    const dot = slot(container, 'dot')!
    expect(screen.getByRole('button')).toContainElement(dot)
    expect(dot).toHaveClass(...classes)
  })

  it('renders no ring, meter, value, name or detail', () => {
    const { container } = render(
      <AgentNodeRing
        name="implementer"
        size="dense"
        context={62}
        charge="strate#62"
        cost="$7.10"
      />,
    )
    for (const s of ['ring', 'ring-track', 'ring-fill', 'value', 'name', 'detail']) {
      expect(slot(container, s), s).toBeNull()
    }
    expect(container.querySelector('svg')).toBeNull()
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()
  })

  it('holds name, state, context, charge and cost in one sr-only span', () => {
    const { container } = render(
      <AgentNodeRing
        name="implementer"
        size="dense"
        context={62}
        charge="strate#62"
        cost="$7.10"
      />,
    )
    const spans = container.querySelectorAll('.sr-only')
    expect(spans).toHaveLength(1)
    const text = spans[0]!.textContent ?? ''
    expect(text).toContain('implementer')
    expect(text).toContain('working')
    expect(text).toMatch(/context 62%/i)
    expect(text).toContain('strate#62')
    expect(text).toContain('$7.10')
  })

  it('omits the context phrase and absent parts from the sr-only text', () => {
    const { container } = render(<AgentNodeRing name="implementer" size="dense" state="done" />)
    const text = container.querySelector('.sr-only')!.textContent ?? ''
    expect(text).toContain('implementer')
    expect(text).toContain('done')
    expect(text).not.toMatch(/context/i)
  })

  it('uses stateLabel in the sr-only text', () => {
    const { container } = render(
      <AgentNodeRing name="implementer" size="dense" stateLabel="blocked" />,
    )
    expect(container.querySelector('.sr-only')!.textContent).toContain('blocked')
  })

  it('puts a warning halo on the button only for needs-you', () => {
    for (const state of STATES) {
      const { unmount } = render(<AgentNodeRing name="implementer" size="dense" state={state} />)
      const classes = classesOf(screen.getByRole('button'))
      const halo = classes.some((c) => /^(ring-warning|shadow-.*warning)/.test(c))
      expect(halo, state).toBe(state === 'needs-you')
      unmount()
    }
  })
})

describe('AgentNodeRing - accessible name', () => {
  it.each(SIZES)('names the button by role label, state label and rounded percent (%s)', (size) => {
    render(<AgentNodeRing name="implementer" size={size} state="needs-you" context={61.6} />)
    const named = (re: RegExp) => screen.getByRole('button', { name: re })
    expect(named(/implementer/i)).toBeInTheDocument()
    expect(named(/needs you/i)).toBeInTheDocument()
    expect(named(/62%/)).toBeInTheDocument()
  })

  it.each(SIZES)('uses a custom stateLabel in the name (%s)', (size) => {
    render(<AgentNodeRing name="implementer" size={size} stateLabel="blocked" />)
    expect(screen.getByRole('button', { name: /blocked/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /working/i })).not.toBeInTheDocument()
  })

  it.each(SIZES)('leaves any percent out of the name without context (%s)', (size) => {
    render(<AgentNodeRing name="implementer" size={size} />)
    expect(screen.getByRole('button', { name: /implementer/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /%/ })).not.toBeInTheDocument()
  })
})

describe('AgentNodeRing - axe', () => {
  const combos = SIZES.flatMap((size) => STATES.map((state) => [size, state] as const))

  it.each(combos)('has no axe violations (%s, %s)', async (size, state) => {
    const { container } = render(
      <AgentNodeRing
        name="implementer"
        size={size}
        state={state}
        context={62}
        charge="strate#62"
        cost="$7.10"
        selected={state === 'needs-you'}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations without context or detail', async () => {
    const { container } = render(<AgentNodeRing name="implementer" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
