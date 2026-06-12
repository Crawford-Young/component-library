import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotionSafe } from '@/lib/use-reduced-motion-safe'
import { StaggerReveal } from './stagger-reveal'

vi.mock('@/lib/use-reduced-motion-safe', () => ({ useReducedMotionSafe: vi.fn(() => false) }))

beforeEach(() => {
  vi.mocked(useReducedMotionSafe).mockReturnValue(false)
})

describe('StaggerReveal', () => {
  it('renders all children', () => {
    render(
      <StaggerReveal>
        <span>a</span>
        <span>b</span>
      </StaggerReveal>,
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })

  it('wraps each child in its own animation wrapper', () => {
    const { container } = render(
      <StaggerReveal>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </StaggerReveal>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.querySelectorAll(':scope > div')).toHaveLength(3)
  })

  it('starts each item hidden (opacity 0)', () => {
    const { container } = render(
      <StaggerReveal>
        <span>a</span>
      </StaggerReveal>,
    )
    const item = (container.firstChild as HTMLElement).firstChild as HTMLElement
    expect(item.style.opacity).toBe('0')
  })

  it('merges custom className on the container', () => {
    const { container } = render(
      <StaggerReveal className="grid grid-cols-3">
        <span>a</span>
      </StaggerReveal>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('grid-cols-3')
  })

  it('forwards ref to the container', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <StaggerReveal ref={ref}>
        <span>a</span>
      </StaggerReveal>,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('accepts a custom stagger step', () => {
    const { container } = render(
      <StaggerReveal staggerMs={30}>
        <span>a</span>
        <span>b</span>
      </StaggerReveal>,
    )
    expect((container.firstChild as HTMLElement).querySelectorAll(':scope > div')).toHaveLength(2)
  })

  it('respects reduced motion (items fade only, no y offset)', () => {
    vi.mocked(useReducedMotionSafe).mockReturnValue(true)
    const { container } = render(
      <StaggerReveal>
        <span>a</span>
      </StaggerReveal>,
    )
    const item = (container.firstChild as HTMLElement).firstChild as HTMLElement
    expect(item.style.transform === '' || item.style.transform === 'none').toBe(true)
  })
})
