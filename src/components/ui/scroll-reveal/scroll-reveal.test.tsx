import { render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotionSafe } from '@/lib/use-reduced-motion-safe'
import { ScrollReveal } from './scroll-reveal'

vi.mock('@/lib/use-reduced-motion-safe', () => ({ useReducedMotionSafe: vi.fn(() => false) }))

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
})

beforeEach(() => {
  vi.mocked(useReducedMotionSafe).mockReturnValue(false)
})

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(<ScrollReveal>section content</ScrollReveal>)
    expect(screen.getByText('section content')).toBeInTheDocument()
  })

  it('starts hidden (opacity 0)', () => {
    const { container } = render(<ScrollReveal>content</ScrollReveal>)
    expect((container.firstChild as HTMLElement).style.opacity).toBe('0')
  })

  it('merges custom className', () => {
    const { container } = render(<ScrollReveal className="mt-8">content</ScrollReveal>)
    expect((container.firstChild as HTMLElement).className).toContain('mt-8')
  })

  it('forwards ref to the wrapper element', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<ScrollReveal ref={ref}>content</ScrollReveal>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('renders children directly when staggerChildren is off', () => {
    const { container } = render(
      <ScrollReveal>
        <span>a</span>
        <span>b</span>
      </ScrollReveal>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.querySelectorAll('div')).toHaveLength(0)
  })

  it('wraps each child for staggering when staggerChildren is on', () => {
    const { container } = render(
      <ScrollReveal staggerChildren>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </ScrollReveal>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.querySelectorAll(':scope > div')).toHaveLength(3)
  })

  it('respects reduced motion (no y offset in hidden state)', () => {
    vi.mocked(useReducedMotionSafe).mockReturnValue(true)
    const { container } = render(<ScrollReveal>content</ScrollReveal>)
    const el = container.firstChild as HTMLElement
    expect(el.style.transform === '' || el.style.transform === 'none').toBe(true)
  })
})
