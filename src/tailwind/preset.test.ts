import { describe, expect, it } from 'vitest'
import { SHIMMER_PERIOD_MS } from '../lib/motion'
import { cyUIPreset } from './preset'

// animation is typed ResolvableTo<KeyValuePair> (map or plugin-utils function) — ours is a static map
const animations = cyUIPreset.theme?.extend?.animation
const animationMap = typeof animations === 'function' ? undefined : animations

describe('cyUIPreset trace animation', () => {
  it('eases the trace loop on the brand in-out curve, not linear', () => {
    const trace = animationMap?.trace
    expect(trace).toBe('trace 1.2s var(--ease-in-out) infinite')
    expect(trace).not.toContain('linear')
  })

  it('defines a brand-enter animation on the out curve at slow duration', () => {
    expect(animationMap?.['brand-enter']).toBe('brand-enter 400ms var(--ease-out) both')
  })

  it('eases the shimmer sweep on the brand in-out curve at the scale period', () => {
    expect(animationMap?.shimmer).toBe(`shimmer ${SHIMMER_PERIOD_MS}ms var(--ease-in-out) infinite`)
    expect(animationMap?.shimmer).not.toContain('linear')
  })
})
