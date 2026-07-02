import { afterEach, describe, expect, it, vi } from 'vitest'
import { startBrandHandoff } from './start-brand-handoff'

// standalone stub shape — intersecting Document collides with lib.dom's
// native (non-optional) startViewTransition typing
interface VTStub {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}
const vtDoc = document as unknown as VTStub

afterEach(() => {
  delete vtDoc.startViewTransition
  vi.unstubAllGlobals()
})

describe('startBrandHandoff', () => {
  it('runs the update directly when the View Transitions API is absent', async () => {
    const update = vi.fn()
    await startBrandHandoff(update)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('runs the update inside startViewTransition when supported', async () => {
    const update = vi.fn()
    const vt = vi.fn((cb: () => void) => {
      cb()
      return { finished: Promise.resolve() }
    })
    vtDoc.startViewTransition = vt
    await startBrandHandoff(update)
    expect(vt).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('skips the transition under prefers-reduced-motion even when supported', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
    )
    const update = vi.fn()
    const vt = vi.fn()
    vtDoc.startViewTransition = vt
    await startBrandHandoff(update)
    expect(vt).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('resolves even when the transition is skipped (finished rejects)', async () => {
    const update = vi.fn()
    vtDoc.startViewTransition = (cb) => {
      cb()
      return { finished: Promise.reject(new Error('skipped')) }
    }
    await expect(startBrandHandoff(update)).resolves.toBeUndefined()
  })
})
