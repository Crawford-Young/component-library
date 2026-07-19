import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMatchMedia } from './use-match-media'

type ChangeHandler = (e: { matches: boolean }) => void

function mockMatchMedia(initial: boolean): {
  fire: (matches: boolean) => void
  removeEventListener: ReturnType<typeof vi.fn>
} {
  let matches = initial
  let handler: ChangeHandler = () => undefined
  const removeEventListener = vi.fn()
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      get matches() {
        return matches
      },
      addEventListener: (_: string, h: ChangeHandler) => {
        handler = h
      },
      removeEventListener,
    })),
  )
  return {
    fire: (next: boolean) => {
      matches = next
      handler({ matches: next })
    },
    removeEventListener,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMatchMedia', () => {
  it('returns false when the query does not match', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useMatchMedia('(hover: hover)'))
    expect(result.current).toBe(false)
  })

  it('returns true when the query matches', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMatchMedia('(hover: hover)'))
    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', () => {
    const mq = mockMatchMedia(false)
    const { result } = renderHook(() => useMatchMedia('(hover: hover)'))
    act(() => mq.fire(true))
    expect(result.current).toBe(true)
  })

  it('unsubscribes on unmount', () => {
    const mq = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMatchMedia('(hover: hover)'))
    unmount()
    expect(mq.removeEventListener).toHaveBeenCalledOnce()
  })

  it('renders SSR via renderToString without touching window, returning false', () => {
    vi.stubGlobal('window', undefined)
    function Harness(): React.JSX.Element {
      const matches = useMatchMedia('(hover: hover)')
      return React.createElement('span', null, matches ? 'true' : 'false')
    }
    let markup = ''
    expect(() => {
      markup = renderToString(React.createElement(Harness))
    }).not.toThrow()
    expect(markup).toContain('false')
  })
})
