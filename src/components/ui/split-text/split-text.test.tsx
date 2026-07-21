import * as React from 'react'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EASE, MOTION, STAGGER } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'
import { SplitText } from './split-text'

vi.mock('@/lib/use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}))

interface MockTransition {
  readonly duration?: number
  readonly delay?: number
  readonly ease?: unknown
}

interface MockMotionSpanProps {
  readonly children?: React.ReactNode
  readonly className?: string
  readonly transition?: MockTransition
  readonly initial?: unknown
  readonly animate?: unknown
}

// Repo mock rule: framer mocks render the DATA props they receive so tests
// can assert the real transition contract, not just element identity.
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, className, transition, initial, animate }: MockMotionSpanProps) => (
      <span
        data-motion-char
        className={className}
        data-delay={transition?.delay}
        data-duration={transition?.duration}
        data-ease={JSON.stringify(transition?.ease)}
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
      >
        {children}
      </span>
    ),
  },
}))

const MS_PER_SECOND = 1000

const charSpans = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-motion-char]'))

const delayOf = (el: HTMLElement): number => Number.parseFloat(el.getAttribute('data-delay') ?? '')

beforeEach(() => {
  vi.mocked(usePrefersReducedMotion).mockReturnValue(false)
})

describe('SplitText', () => {
  it('renders every character of the text in the decorative glyph structure', () => {
    const { container } = render(<SplitText text="Hi there" />)
    const nbsp = String.fromCharCode(0x00a0)
    const decorative = container.querySelectorAll('[aria-hidden="true"]')
    const decorativeText = Array.from(decorative)
      .map((el) => el.textContent ?? '')
      .join('')
      .split(nbsp)
      .join(' ')
    expect(decorativeText).toBe('Hi there')
    // one motion span per non-space character
    expect(charSpans(container)).toHaveLength('Hithere'.length)
  })

  it('never puts a prohibited aria-label on the role-less wrapper span', () => {
    const { container } = render(<SplitText text="Hi there" />)
    expect((container.firstChild as HTMLElement).hasAttribute('aria-label')).toBe(false)
  })

  it('announces the full text once via a visually-hidden sr-only child', () => {
    const { container } = render(<SplitText text="Hi there" />)
    const srOnly = container.querySelector('.sr-only')
    expect(srOnly).not.toBeNull()
    expect(srOnly?.textContent).toBe('Hi there')
  })

  it('hides the per-word spans from the accessibility tree', () => {
    const { container } = render(<SplitText text="Hi there" />)
    const hidden = container.querySelectorAll('[aria-hidden="true"]')
    // one per word
    expect(hidden).toHaveLength(2)
  })

  it('rises each character from y 110% + opacity 0 to settled', () => {
    const { container } = render(<SplitText text="Hi" />)
    const first = charSpans(container)[0]
    expect(JSON.parse(first.getAttribute('data-initial') ?? '{}')).toEqual({
      y: '110%',
      opacity: 0,
    })
    expect(JSON.parse(first.getAttribute('data-animate') ?? '{}')).toEqual({ y: 0, opacity: 1 })
  })

  it('uses MOTION.hero duration and EASE.out for each character', () => {
    const { container } = render(<SplitText text="Hi" />)
    const first = charSpans(container)[0]
    expect(Number.parseFloat(first.getAttribute('data-duration') ?? '')).toBeCloseTo(
      MOTION.hero / MS_PER_SECOND,
    )
    expect(JSON.parse(first.getAttribute('data-ease') ?? '[]')).toEqual([...EASE.out])
  })

  it('steps each character delay by STAGGER.charMs sequentially across words', () => {
    const { container } = render(<SplitText text="Hi there" />)
    const step = STAGGER.charMs / MS_PER_SECOND
    const delays = charSpans(container).map(delayOf)
    // H i  t  h  e  r  e  → indices 0..6, continuous across the word boundary
    delays.forEach((delay, index) => expect(delay).toBeCloseTo(index * step))
    // the first char of the second word ('t') is index 2, not restarted or
    // skewed by the buggy wi*word.length+ci formula
    expect(delays[2]).toBeCloseTo(2 * step)
  })

  it('offsets every delay by delayMs (converted to seconds)', () => {
    const { container } = render(<SplitText text="Hi there" delayMs={100} />)
    const base = 100 / MS_PER_SECOND
    const step = STAGGER.charMs / MS_PER_SECOND
    const delays = charSpans(container).map(delayOf)
    delays.forEach((delay, index) => expect(delay).toBeCloseTo(base + index * step))
  })

  it('merges a custom className onto the wrapper', () => {
    const { container } = render(<SplitText text="Hi" className="text-7xl font-bold" />)
    expect((container.firstChild as HTMLElement).className).toContain('text-7xl')
  })

  it('renders a single plain span with no motion under reduced motion', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true)
    const { container } = render(<SplitText text="Hi there" className="text-7xl" />)
    expect(charSpans(container)).toHaveLength(0)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('SPAN')
    expect(wrapper.textContent).toBe('Hi there')
    expect(wrapper.className).toContain('text-7xl')
    expect(container.querySelectorAll('span')).toHaveLength(1)
  })
})
