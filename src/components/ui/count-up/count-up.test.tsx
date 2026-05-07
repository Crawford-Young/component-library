import * as React from 'react'
import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CountUp } from './count-up'

function mockMatchMedia(prefersReduced: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = []
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: prefersReduced,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_: string, cb: (typeof listeners)[0]) => {
        listeners.push(cb)
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
  return listeners
}

let intersectionCallback: IntersectionObserverCallback | null = null
const observeSpy = vi.fn()
const disconnectSpy = vi.fn()

beforeEach(() => {
  intersectionCallback = null
  observeSpy.mockClear()
  disconnectSpy.mockClear()
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
      intersectionCallback = cb
      return { observe: observeSpy, disconnect: disconnectSpy, unobserve: vi.fn() }
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('CountUp', () => {
  it('renders final value immediately when prefers-reduced-motion is true', () => {
    mockMatchMedia(true)
    render(<CountUp to={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders with suffix', () => {
    mockMatchMedia(true)
    render(<CountUp to={10} suffix="%" />)
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('applies className', () => {
    mockMatchMedia(true)
    const { container } = render(<CountUp to={5} className="text-accent" />)
    expect((container.firstChild as HTMLElement).className).toContain('text-accent')
  })

  it('sets up IntersectionObserver when not reduced motion', () => {
    mockMatchMedia(false)
    render(<CountUp to={100} />)
    expect(observeSpy).toHaveBeenCalledOnce()
  })

  it('does not start animation if observer fires with isIntersecting=false', () => {
    mockMatchMedia(false)
    render(<CountUp to={100} />)
    act(() => {
      intersectionCallback!(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('animates to final value when observer fires with isIntersecting=true', () => {
    mockMatchMedia(false)
    let rafCallback: FrameRequestCallback | null = null
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn().mockImplementation((cb: FrameRequestCallback) => {
        rafCallback = cb
        return 1
      }),
    )

    render(<CountUp to={50} duration={1000} />)

    act(() => {
      intersectionCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    act(() => {
      rafCallback!(performance.now() + 500)
    })

    act(() => {
      rafCallback!(performance.now() + 2000)
    })

    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('does not restart if observer fires twice', () => {
    mockMatchMedia(false)
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1))

    render(<CountUp to={10} />)

    act(() => {
      intersectionCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    act(() => {
      intersectionCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(vi.mocked(requestAnimationFrame)).toHaveBeenCalledOnce()
  })

  it('does not re-setup observer when props change after animation has started', () => {
    mockMatchMedia(false)
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1))
    const { rerender } = render(<CountUp to={50} />)
    act(() => {
      intersectionCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    observeSpy.mockClear()
    rerender(<CountUp to={100} />)
    expect(observeSpy).not.toHaveBeenCalled()
  })

  it('disconnects observer and cancels rAF on unmount', () => {
    mockMatchMedia(false)
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(42))

    const { unmount } = render(<CountUp to={99} />)

    act(() => {
      intersectionCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    unmount()

    expect(disconnectSpy).toHaveBeenCalled()
    expect(cancelSpy).toHaveBeenCalledWith(42)
  })

  it('updates reduced state when matchMedia change event fires', () => {
    const listeners = mockMatchMedia(false)
    render(<CountUp to={42} />)
    act(() => {
      listeners.forEach((cb) => cb({ matches: true }))
    })
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('forwards ref to the span element', () => {
    mockMatchMedia(true)
    const ref = React.createRef<HTMLSpanElement>()
    render(<CountUp to={5} ref={ref} />)
    expect(ref.current?.tagName).toBe('SPAN')
  })

  it('forwards callback ref to the span element', () => {
    mockMatchMedia(true)
    let capturedNode: HTMLSpanElement | null = null
    const callbackRef = (node: HTMLSpanElement | null) => {
      capturedNode = node
    }
    render(<CountUp to={7} ref={callbackRef} />)
    expect(capturedNode).not.toBeNull()
    expect((capturedNode as HTMLSpanElement | null)?.tagName).toBe('SPAN')
  })
})
