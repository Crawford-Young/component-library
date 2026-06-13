import { describe, expect, it } from 'vitest'
import type { TargetAndTransition } from 'framer-motion'
import { getRevealVariants, getStaggerDelayMs, getStaggerItemVariants } from './motion-variants'

describe('getRevealVariants', () => {
  it('hides 16px below with fade, reveals over 400ms on the brand out-curve', () => {
    const variants = getRevealVariants(false)
    expect(variants.hidden).toEqual({ opacity: 0, y: 16 })
    expect(variants.visible).toEqual({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0, ease: [0.25, 1, 0.5, 1] },
    })
  })

  it('converts delayMs to seconds', () => {
    const visible = getRevealVariants(false, 200).visible as TargetAndTransition
    expect(visible.transition?.delay).toBe(0.2)
  })

  it('drops the y transform under reduced motion (opacity only)', () => {
    const variants = getRevealVariants(true)
    expect(variants.hidden).toEqual({ opacity: 0, y: 0 })
  })
})

describe('getStaggerDelayMs', () => {
  it('steps 40ms per index by default', () => {
    expect(getStaggerDelayMs(0)).toBe(0)
    expect(getStaggerDelayMs(3)).toBe(120)
  })

  it('caps the delay at 5 items', () => {
    expect(getStaggerDelayMs(5)).toBe(200)
    expect(getStaggerDelayMs(12)).toBe(200)
  })

  it('accepts a custom step', () => {
    expect(getStaggerDelayMs(2, 30)).toBe(60)
  })
})

describe('getStaggerItemVariants', () => {
  it('hides 8px below; visible resolves per-item delay from custom', () => {
    const variants = getStaggerItemVariants(false)
    expect(variants.hidden).toEqual({ opacity: 0, y: 8 })
    const visible = variants.visible as (delayMs: number) => TargetAndTransition
    expect(visible(80)).toEqual({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.08, ease: [0.25, 1, 0.5, 1] },
    })
  })

  it('drops the y transform under reduced motion', () => {
    expect(getStaggerItemVariants(true).hidden).toEqual({ opacity: 0, y: 0 })
  })
})
