import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MOTION } from '@/lib/motion'
import { BrandSplash } from './brand-splash'

beforeEach(() => {
  vi.useRealTimers()
  vi.useFakeTimers({
    toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
  })
})

afterEach(() => {
  vi.useRealTimers()
})

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('BrandSplash', () => {
  it('renders the whole wordmark with the possessive hidden in the initial phase', () => {
    const { container } = render(
      <BrandSplash wordmark="Cybond" splitIndex={2} onComplete={vi.fn()} />,
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading Cybond')
    expect(screen.getByText('Cy')).toBeInTheDocument()
    expect(screen.getByText('bond')).toBeInTheDocument()
    // possessive is always in the DOM (no content toggle → no reflow); faded out until signal
    expect(container.querySelector('[data-possessive]')).toHaveStyle({ opacity: '0' })
  })

  it('fades the possessive in during the signal phase (not the split phase)', () => {
    const { container } = render(
      <BrandSplash wordmark="Cybond" splitIndex={2} onComplete={vi.fn()} />,
    )
    advance(400) // split — possessive still hidden
    expect(container.querySelector('[data-possessive]')).toHaveStyle({ opacity: '0' })
    advance(600) // signal — possessive fades in
    expect(container.querySelector('[data-possessive]')).toHaveStyle({ opacity: '1' })
  })

  it('renders the possessive wordmark as "Cy\'sbond" (gap comes from the split translate)', () => {
    const { container } = render(
      <BrandSplash wordmark="Cybond" splitIndex={2} onComplete={vi.fn()} />,
    )
    expect(container.querySelector('[data-wordmark]')?.textContent).toBe("Cy'sbond")
  })

  it('omits the possessive when possessive={false}', () => {
    const { container } = render(
      <BrandSplash wordmark="Cybond" splitIndex={2} possessive={false} onComplete={vi.fn()} />,
    )
    advance(400)
    expect(container.querySelector('[data-possessive]')).toBeNull()
    expect(container.querySelector('[data-wordmark]')?.textContent).toBe('Cybond')
  })

  it('fades the quote in at the split phase', () => {
    const { container } = render(
      <BrandSplash
        wordmark="Cybond"
        splitIndex={2}
        quote={{ text: 'Bond to what matters.', attribution: null }}
        onComplete={vi.fn()}
      />,
    )
    expect(container.querySelector('[data-quote]')).toHaveStyle({ opacity: '0' })
    advance(400)
    expect(container.querySelector('[data-quote]')).toHaveStyle({ opacity: '1' })
  })

  it('fires onComplete once, fades out, then unmounts', () => {
    const onComplete = vi.fn()
    render(<BrandSplash wordmark="Cybond" splitIndex={2} onComplete={onComplete} />)
    advance(400 + 600 + 1000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    // overlay lingers at opacity-0 during the exit fade
    expect(screen.getByRole('status').className).toContain('opacity-0')
    advance(300)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    advance(2000)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('skips the signal phase when signal="none"', () => {
    const onComplete = vi.fn()
    render(<BrandSplash wordmark="Cybond" splitIndex={2} signal="none" onComplete={onComplete} />)
    advance(400 + 600)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('applies glow treatment to the right word during signal phase', () => {
    render(<BrandSplash wordmark="Cybond" splitIndex={2} signal="glow" onComplete={vi.fn()} />)
    advance(400 + 600)
    expect(screen.getByText('bond').className).toContain('text-accent')
  })

  it('applies dim treatment when signal="dim"', () => {
    render(<BrandSplash wordmark="Cybond" splitIndex={2} signal="dim" onComplete={vi.fn()} />)
    advance(400 + 600)
    expect(screen.getByText('bond').className).toContain('opacity-40')
  })

  it('renders the quote row when quote is provided', () => {
    render(
      <BrandSplash
        wordmark="Cybond"
        splitIndex={2}
        quote={{ text: 'Bond to what matters.', attribution: null }}
        onComplete={vi.fn()}
      />,
    )
    expect(screen.getByText('Bond to what matters.')).toBeInTheDocument()
  })

  it('renders quote attribution when present', () => {
    render(
      <BrandSplash
        wordmark="Cybond"
        splitIndex={2}
        quote={{ text: 'Q', attribution: 'CY' }}
        onComplete={vi.fn()}
      />,
    )
    expect(screen.getByText('— CY')).toBeInTheDocument()
  })

  it('respects custom durations', () => {
    const onComplete = vi.fn()
    render(
      <BrandSplash
        wordmark="Cytune"
        splitIndex={2}
        durations={{ initial: 100, split: 100, signal: 100 }}
        onComplete={onComplete}
      />,
    )
    advance(300)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('sources phase-dwell defaults from the MOTION token scale', () => {
    // initial=slow(400) split=hero(600) → split begins at 400, signal at 1000
    const onComplete = vi.fn()
    render(<BrandSplash wordmark="Cybond" splitIndex={2} onComplete={onComplete} />)
    expect(MOTION.slow).toBe(400)
    expect(MOTION.hero).toBe(600)
    advance(400)
    expect(screen.getByText('bond').className).not.toContain('text-accent') // not glowing yet (split, pre-signal)
    advance(600)
    expect(screen.getByText('bond').className).toContain('text-accent') // signal
  })

  it('uses brand ease token classes on the wordmark transitions', () => {
    const { container } = render(
      <BrandSplash wordmark="Cybond" splitIndex={2} onComplete={vi.fn()} />,
    )
    // slide span uses the in-out curve; possessive fade uses the out curve
    expect(screen.getByText('Cy').parentElement?.className).toContain('ease-in-out')
    expect(container.querySelector('[data-possessive]')?.className).toContain('ease-out')
  })

  it('halves durations and skips slide transforms under reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    const onComplete = vi.fn()
    render(<BrandSplash wordmark="Cybond" splitIndex={2} onComplete={onComplete} />)
    advance(200) // initial 400 * 0.5
    expect(screen.getByText('Cy').parentElement?.className).not.toContain('-translate-x-8')
    advance(300 + 500) // split 600*0.5 + signal 1000*0.5
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
