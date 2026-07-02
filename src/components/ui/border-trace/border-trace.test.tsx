import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MOTION } from '@/lib/motion'
import { BorderTrace, TraceBorder } from './border-trace'

describe('BorderTrace', () => {
  it('has role="status" with default label', () => {
    render(<BorderTrace appearDelayMs={0} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('uses a custom label', () => {
    render(<BorderTrace label="Saving" appearDelayMs={0} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Saving')
  })

  it('renders md (24px) square SVG by default', () => {
    const { container } = render(<BorderTrace appearDelayMs={0} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(container.querySelector('rect')).toBeInTheDocument()
  })

  it('renders a circle when shape="circle"', () => {
    const { container } = render(<BorderTrace shape="circle" appearDelayMs={0} />)
    expect(container.querySelector('circle')).toBeInTheDocument()
    expect(container.querySelector('rect')).not.toBeInTheDocument()
  })

  it.each([
    ['sm', '16'],
    ['md', '24'],
    ['lg', '32'],
  ] as const)('renders %s size as %spx', (size, px) => {
    const { container } = render(<BorderTrace size={size} appearDelayMs={0} />)
    expect(container.querySelector('svg')).toHaveAttribute('width', px)
  })

  it('animates the trace segment with motion-safe class', () => {
    const { container } = render(<BorderTrace appearDelayMs={0} />)
    const paths = container.querySelectorAll('rect')
    expect(paths[1].getAttribute('class')).toContain('motion-safe:animate-trace')
  })

  it('renders pulse dot instead of trace at size xs', () => {
    const { container } = render(<BorderTrace size="xs" appearDelayMs={0} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    const dot = container.querySelector('[data-trace-dot]')
    expect(dot).not.toBeNull()
    expect(dot?.getAttribute('class')).toContain('motion-safe:animate-trace-dot')
  })

  it('merges custom className', () => {
    render(<BorderTrace className="text-accent" appearDelayMs={0} />)
    expect(screen.getByRole('status').className).toContain('text-accent')
  })

  it('renders a full ring under reduced motion (dash removed via motion-reduce)', () => {
    const { container } = render(<BorderTrace appearDelayMs={0} />)
    const traceRect = container.querySelectorAll('rect')[1]
    expect(traceRect.getAttribute('class')).toContain('motion-reduce:[stroke-dasharray:none]')
  })

  it('removes the dash on the circle trace under reduced motion', () => {
    const { container } = render(<BorderTrace shape="circle" appearDelayMs={0} />)
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
      <TraceBorder active appearDelayMs={0}>
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
      <TraceBorder active label="Saving goal" appearDelayMs={0}>
        <button>Save</button>
      </TraceBorder>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saving goal')
  })

  it('overlay rect uses percentage geometry, not CSS calc (invalid in SVG)', () => {
    const { container } = render(
      <TraceBorder active appearDelayMs={0}>
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
      <TraceBorder active shape="circle" appearDelayMs={0}>
        <button>+</button>
      </TraceBorder>,
    )
    expect(container.querySelector('circle[stroke-dasharray]')).toBeInTheDocument()
  })
})

describe('appearance threshold', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing before the 150ms default threshold, then appears', () => {
    const { container } = render(<BorderTrace />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(150))
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders immediately when appearDelayMs is 0', () => {
    const { container } = render(<BorderTrace appearDelayMs={0} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('TraceBorder shows the overlay only after the threshold once active', () => {
    const { container } = render(
      <TraceBorder active>
        <button>Save</button>
      </TraceBorder>,
    )
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(150))
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('TraceBorder never shows if active clears before the threshold', () => {
    const { container, rerender } = render(
      <TraceBorder active>
        <button>Save</button>
      </TraceBorder>,
    )
    act(() => vi.advanceTimersByTime(100))
    rerender(
      <TraceBorder active={false}>
        <button>Save</button>
      </TraceBorder>,
    )
    act(() => vi.advanceTimersByTime(100))
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})

describe('resolve gesture', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.useFakeTimers({
      toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('expands, settles, departs, unmounts, and fires onResolveComplete once', () => {
    const onResolveComplete = vi.fn()
    const { container, rerender } = render(
      <BorderTrace appearDelayMs={0} onResolveComplete={onResolveComplete} />,
    )
    rerender(<BorderTrace appearDelayMs={0} resolved onResolveComplete={onResolveComplete} />)

    // expanding: ring snaps to a full segment, trace loop still running to sweep it closed
    const traceRect = container.querySelectorAll('rect')[1]
    expect(traceRect.style.strokeDasharray).toBe('100 0')
    expect(traceRect.getAttribute('class')).toContain('motion-safe:animate-trace')

    // settle reached: loop animation removed
    act(() => vi.advanceTimersByTime(MOTION.base))
    expect(container.querySelectorAll('rect')[1].getAttribute('class')).not.toContain(
      'motion-safe:animate-trace',
    )

    // departing: wrapper fades with the exit transition
    act(() => vi.advanceTimersByTime(MOTION.base))
    const status = screen.getByRole('status')
    expect(status.style.opacity).toBe('0')
    expect(status.style.transition).toContain('opacity')

    // done: trace unmounts, callback fires exactly once
    act(() => vi.advanceTimersByTime(MOTION.base))
    expect(screen.queryByRole('status')).toBeNull()
    expect(onResolveComplete).toHaveBeenCalledTimes(1)

    act(() => vi.advanceTimersByTime(2000))
    expect(onResolveComplete).toHaveBeenCalledTimes(1)
  })

  it('completes immediately without ever rendering when resolved before the appear threshold', () => {
    const onResolveComplete = vi.fn()
    const { container } = render(
      <BorderTrace resolved onResolveComplete={onResolveComplete} />, // default 150ms delay
    )
    expect(screen.queryByRole('status')).toBeNull()
    act(() => vi.advanceTimersByTime(2000))
    expect(container.querySelector('svg')).toBeNull()
    expect(onResolveComplete).toHaveBeenCalledTimes(1)
  })

  it('ignores resolved flipping back to false mid-gesture', () => {
    const onResolveComplete = vi.fn()
    const { rerender } = render(
      <BorderTrace appearDelayMs={0} onResolveComplete={onResolveComplete} />,
    )
    rerender(<BorderTrace appearDelayMs={0} resolved onResolveComplete={onResolveComplete} />)
    rerender(
      <BorderTrace appearDelayMs={0} resolved={false} onResolveComplete={onResolveComplete} />,
    )
    act(() => vi.advanceTimersByTime(MOTION.base)) // expanding → settled
    act(() => vi.advanceTimersByTime(MOTION.base)) // settled → departing
    act(() => vi.advanceTimersByTime(MOTION.base)) // departing → done
    expect(screen.queryByRole('status')).toBeNull()
    expect(onResolveComplete).toHaveBeenCalledTimes(1)
  })

  it('does not fire the callback when unmounted mid-resolve', () => {
    const onResolveComplete = vi.fn()
    const { rerender, unmount } = render(
      <BorderTrace appearDelayMs={0} onResolveComplete={onResolveComplete} />,
    )
    rerender(<BorderTrace appearDelayMs={0} resolved onResolveComplete={onResolveComplete} />)
    act(() => vi.advanceTimersByTime(MOTION.base)) // settled
    unmount()
    act(() => vi.advanceTimersByTime(MOTION.base * 3))
    expect(onResolveComplete).not.toHaveBeenCalled()
  })

  it('skips the expanding phase under reduced motion, holding the still-ring before departing', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    const onResolveComplete = vi.fn()
    const { container, rerender } = render(
      <BorderTrace appearDelayMs={0} onResolveComplete={onResolveComplete} />,
    )
    rerender(<BorderTrace appearDelayMs={0} resolved onResolveComplete={onResolveComplete} />)

    // straight to settled: full still-ring, no loop animation
    const traceRect = container.querySelectorAll('rect')[1]
    expect(traceRect.getAttribute('class')).not.toContain('motion-safe:animate-trace')
    expect(traceRect.style.strokeDasharray).toBe('100 0')

    // holds one beat, then departs
    act(() => vi.advanceTimersByTime(MOTION.base))
    expect(screen.getByRole('status').style.opacity).toBe('0')

    act(() => vi.advanceTimersByTime(MOTION.base))
    expect(screen.queryByRole('status')).toBeNull()
    expect(onResolveComplete).toHaveBeenCalledTimes(1)
  })

  it('resolves the xs dot: solid, then fades, then unmounts, callback once', () => {
    const onResolveComplete = vi.fn()
    const { container, rerender } = render(
      <BorderTrace size="xs" appearDelayMs={0} onResolveComplete={onResolveComplete} />,
    )
    rerender(
      <BorderTrace size="xs" appearDelayMs={0} resolved onResolveComplete={onResolveComplete} />,
    )

    const dot = container.querySelector('[data-trace-dot]')
    expect(dot?.getAttribute('class')).not.toContain('motion-safe:animate-trace-dot')
    expect(dot?.getAttribute('class')).toContain('opacity-100')

    act(() => vi.advanceTimersByTime(MOTION.base)) // settled
    act(() => vi.advanceTimersByTime(MOTION.base)) // departing
    expect(screen.getByRole('status').style.opacity).toBe('0')

    act(() => vi.advanceTimersByTime(MOTION.base)) // done
    expect(screen.queryByRole('status')).toBeNull()
    expect(onResolveComplete).toHaveBeenCalledTimes(1)
  })
})
