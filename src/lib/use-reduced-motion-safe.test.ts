import { renderHook } from '@testing-library/react'
import { useReducedMotion } from 'framer-motion'
import { describe, expect, it, vi } from 'vitest'
import { useReducedMotionSafe } from './use-reduced-motion-safe'

vi.mock('framer-motion', () => ({ useReducedMotion: vi.fn() }))

describe('useReducedMotionSafe', () => {
  it('returns false when framer reports null (SSR / pre-hydration)', () => {
    vi.mocked(useReducedMotion).mockReturnValue(null)
    const { result } = renderHook(() => useReducedMotionSafe())
    expect(result.current).toBe(false)
  })

  it('returns true when the user prefers reduced motion', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true)
    const { result } = renderHook(() => useReducedMotionSafe())
    expect(result.current).toBe(true)
  })

  it('returns false when the user has no reduced-motion preference', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false)
    const { result } = renderHook(() => useReducedMotionSafe())
    expect(result.current).toBe(false)
  })
})
