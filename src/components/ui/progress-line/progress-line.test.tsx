import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotionSafe } from '@/lib/use-reduced-motion-safe'
import { ProgressLine } from './progress-line'

vi.mock('@/lib/use-reduced-motion-safe', () => ({ useReducedMotionSafe: vi.fn(() => false) }))

beforeEach(() => {
  vi.useRealTimers()
  vi.useFakeTimers({
    toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
  })
  vi.mocked(useReducedMotionSafe).mockReturnValue(false)
})

afterEach(() => {
  vi.useRealTimers()
})

const bar = () => screen.getByRole('progressbar').firstChild as HTMLElement

describe('ProgressLine', () => {
  it('renders nothing while idle', () => {
    render(<ProgressLine active={false} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('fills to 60% with the brand out-curve when activated', () => {
    render(<ProgressLine active />)
    expect(bar().style.width).toBe('60%')
    expect(bar().style.transition).toContain('300ms')
    expect(bar().style.transition).toContain('cubic-bezier(0.25, 1, 0.5, 1)')
  })

  it('crawls to 90% linearly after the fill phase', () => {
    render(<ProgressLine active />)
    act(() => vi.advanceTimersByTime(300))
    expect(bar().style.width).toBe('90%')
    expect(bar().style.transition).toContain('linear')
  })

  it('snaps to 100% then fades out and unmounts when deactivated', () => {
    const { rerender } = render(<ProgressLine active />)
    act(() => vi.advanceTimersByTime(300))
    rerender(<ProgressLine active={false} />)
    expect(bar().style.width).toBe('100%')
    act(() => vi.advanceTimersByTime(150))
    const wrapper = screen.getByRole('progressbar') as HTMLElement
    expect(wrapper.style.opacity).toBe('0')
    act(() => vi.advanceTimersByTime(200))
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('completes from the fill phase too (fast loads)', () => {
    const { rerender } = render(<ProgressLine active />)
    rerender(<ProgressLine active={false} />)
    expect(bar().style.width).toBe('100%')
  })

  it('restarts if reactivated mid-fade', () => {
    const { rerender } = render(<ProgressLine active />)
    rerender(<ProgressLine active={false} />)
    act(() => vi.advanceTimersByTime(150))
    rerender(<ProgressLine active />)
    expect(bar().style.width).toBe('60%')
  })

  it('uses linear fill under reduced motion', () => {
    vi.mocked(useReducedMotionSafe).mockReturnValue(true)
    render(<ProgressLine active />)
    expect(bar().style.transition).toContain('linear')
    expect(bar().style.transition).not.toContain('cubic-bezier')
  })

  it('exposes an accessible label', () => {
    render(<ProgressLine active label="Loading dashboard" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Loading dashboard')
  })

  it('merges custom className', () => {
    render(<ProgressLine active className="z-[60]" />)
    expect((screen.getByRole('progressbar') as HTMLElement).className).toContain('z-[60]')
  })
})
