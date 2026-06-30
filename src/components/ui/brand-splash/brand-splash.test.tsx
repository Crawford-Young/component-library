import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  it('renders the whole wordmark in the initial phase', () => {
    render(<BrandSplash wordmark="Cybond" splitIndex={2} onComplete={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading Cybond')
    expect(screen.getByText('Cy')).toBeInTheDocument()
    expect(screen.getByText('bond')).toBeInTheDocument()
    expect(screen.queryByText("'s")).not.toBeInTheDocument()
  })

  it('shows the possessive after the split phase begins', () => {
    render(<BrandSplash wordmark="Cybond" splitIndex={2} onComplete={vi.fn()} />)
    advance(400)
    expect(screen.getByText("'s")).toBeInTheDocument()
  })

  it('omits the possessive when possessive={false}', () => {
    render(<BrandSplash wordmark="Cybond" splitIndex={2} possessive={false} onComplete={vi.fn()} />)
    advance(400)
    expect(screen.queryByText("'s")).not.toBeInTheDocument()
  })

  it('fires onComplete once and unmounts after all phases', () => {
    const onComplete = vi.fn()
    render(<BrandSplash wordmark="Cybond" splitIndex={2} onComplete={onComplete} />)
    advance(400 + 600 + 800)
    expect(onComplete).toHaveBeenCalledTimes(1)
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
    expect(screen.getByText('Cy').className).not.toContain('-translate-x-2')
    advance(300 + 400) // split 600*0.5 + signal 800*0.5
    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
