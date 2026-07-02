import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SPRING_MAGNETIC } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'
import { MagneticButton } from './magnetic-button'

vi.mock('@/lib/use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}))

// Repo mock rule: framer mocks render the DATA props they receive and expose
// the imperative motion-value writes so tests assert the real pull contract,
// not just element identity. useMotionValue returns a settable stub that
// records its latest value; useSpring is identity (records its spring config).
const framer = vi.hoisted(() => {
  interface MockMotionValue {
    value: number
    set(next: number): void
  }
  const created: MockMotionValue[] = []
  const springConfigs: unknown[] = []
  const makeMotionValue = (initial: number): MockMotionValue => ({
    value: initial,
    set(next: number): void {
      this.value = next
    },
  })
  return {
    created,
    springConfigs,
    makeMotionValue,
    reset(): void {
      created.length = 0
      springConfigs.length = 0
    },
  }
})

interface MockSpanProps {
  readonly children?: React.ReactNode
  readonly className?: string
  readonly style?: unknown
  readonly onMouseMove?: React.MouseEventHandler<HTMLSpanElement>
  readonly onMouseLeave?: React.MouseEventHandler<HTMLSpanElement>
}

vi.mock('framer-motion', () => ({
  useMotionValue: (initial: number) => {
    const mv = framer.makeMotionValue(initial)
    framer.created.push(mv)
    return mv
  },
  useSpring: (source: unknown, config: unknown) => {
    framer.springConfigs.push(config)
    return source
  },
  motion: {
    span: ({ children, className, onMouseMove, onMouseLeave }: MockSpanProps) => (
      <span
        data-magnetic-wrapper
        className={className}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </span>
    ),
  },
}))

function mockMatchMedia(hoverCapable: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: hoverCapable,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

const BUTTON_RECT: DOMRect = {
  left: 0,
  top: 0,
  width: 100,
  height: 40,
  right: 100,
  bottom: 40,
  x: 0,
  y: 0,
  toJSON: () => ({}),
}

function mockRect(): void {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(BUTTON_RECT)
}

const wrapper = (): HTMLElement | null => document.querySelector('[data-magnetic-wrapper]')

beforeEach(() => {
  framer.reset()
  vi.mocked(usePrefersReducedMotion).mockReturnValue(false)
  mockMatchMedia(true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MagneticButton', () => {
  it('passes variant and size through to the underlying Button', () => {
    render(
      <MagneticButton variant="secondary" size="lg">
        Launch
      </MagneticButton>,
    )
    const button = screen.getByRole('button', { name: 'Launch' })
    expect(button.className).toContain('bg-secondary')
    expect(button.className).toContain('h-11')
  })

  it('passes onClick through to the underlying Button', () => {
    const onClick = vi.fn()
    render(<MagneticButton onClick={onClick}>Go</MagneticButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('forwards ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<MagneticButton ref={ref}>Go</MagneticButton>)
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('springs both axes on SPRING_MAGNETIC', () => {
    render(<MagneticButton>Go</MagneticButton>)
    expect(framer.springConfigs).toHaveLength(2)
    expect(framer.springConfigs.every((config) => config === SPRING_MAGNETIC)).toBe(true)
  })

  it('pulls toward the cursor, clamped to 8px, on mousemove', () => {
    mockRect()
    render(<MagneticButton>Go</MagneticButton>)
    // Cursor far to the right of centre (50, 20): dx=150, dy=0 → magnitude 150,
    // clamped to 8px along x.
    fireEvent.mouseMove(wrapper()!, { clientX: 200, clientY: 20 })
    expect(framer.created[0].value).toBeCloseTo(8)
    expect(framer.created[1].value).toBeCloseTo(0)
  })

  it('pulls the raw offset when the cursor is within 8px of centre', () => {
    mockRect()
    render(<MagneticButton>Go</MagneticButton>)
    // Cursor at (54, 23): dx=4, dy=3 → magnitude 5 (< 8), unclamped.
    fireEvent.mouseMove(wrapper()!, { clientX: 54, clientY: 23 })
    expect(framer.created[0].value).toBeCloseTo(4)
    expect(framer.created[1].value).toBeCloseTo(3)
  })

  it('springs both axes back to zero on mouseleave', () => {
    mockRect()
    render(<MagneticButton>Go</MagneticButton>)
    fireEvent.mouseMove(wrapper()!, { clientX: 200, clientY: 20 })
    fireEvent.mouseLeave(wrapper()!)
    expect(framer.created[0].value).toBe(0)
    expect(framer.created[1].value).toBe(0)
  })

  it('renders a plain Button with no wrapper under reduced motion', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true)
    render(<MagneticButton>Go</MagneticButton>)
    expect(wrapper()).toBeNull()
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })

  it('renders a plain Button with no wrapper when the pointer cannot hover', () => {
    mockMatchMedia(false)
    render(<MagneticButton>Go</MagneticButton>)
    expect(wrapper()).toBeNull()
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })
})
