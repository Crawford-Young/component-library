import { describe, expect, it } from 'vitest'
import { cyUIPreset } from './preset'

describe('cyUIPreset trace animation', () => {
  it('eases the trace loop on the brand in-out curve, not linear', () => {
    const trace = cyUIPreset.theme?.extend?.animation?.trace
    expect(trace).toBe('trace 1.2s var(--ease-in-out) infinite')
    expect(trace).not.toContain('linear')
  })

  it('defines a brand-enter animation on the out curve at slow duration', () => {
    expect(cyUIPreset.theme?.extend?.animation?.['brand-enter']).toBe(
      'brand-enter 400ms var(--ease-out) both',
    )
  })
})
