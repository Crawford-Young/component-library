import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion'

type ChangeHandler = (e: { matches: boolean }) => void

function mockMatchMedia(initial: boolean): { fire: (matches: boolean) => void } {
  let handler: ChangeHandler = () => undefined
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: initial,
      addEventListener: (_: string, h: ChangeHandler) => {
        handler = h
      },
      removeEventListener: vi.fn(),
    }),
  )
  return { fire: (matches: boolean) => handler({ matches }) }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePrefersReducedMotion', () => {
  it('returns false when media query does not match', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when media query matches', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', () => {
    const mq = mockMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    act(() => mq.fire(true))
    expect(result.current).toBe(true)
  })
})
