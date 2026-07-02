import { describe, expect, it } from 'vitest'
import { EASE, EASE_CSS, MOTION, SHIMMER_PERIOD_MS, SPRING_MAGNETIC, STAGGER } from './motion'

describe('MOTION', () => {
  it('defines the five duration tokens in ms', () => {
    expect(MOTION).toEqual({ instant: 100, fast: 150, base: 250, slow: 400, hero: 600 })
  })
})

describe('EASE', () => {
  it('defines the three brand bezier curves', () => {
    expect(EASE.out).toEqual([0.25, 1, 0.5, 1])
    expect(EASE.inOut).toEqual([0.65, 0, 0.35, 1])
    expect(EASE.exit).toEqual([0.5, 0, 0.75, 0])
  })
})

describe('EASE_CSS', () => {
  it('derives cubic-bezier strings matching the EASE arrays', () => {
    expect(EASE_CSS.out).toBe('cubic-bezier(0.25, 1, 0.5, 1)')
    expect(EASE_CSS.inOut).toBe('cubic-bezier(0.65, 0, 0.35, 1)')
    expect(EASE_CSS.exit).toBe('cubic-bezier(0.5, 0, 0.75, 0)')
  })
})

describe('STAGGER', () => {
  it('defines word/card/char stagger and item cap', () => {
    expect(STAGGER).toEqual({ wordMs: 30, cardMs: 40, charMs: 28, capItems: 5 })
  })
})

describe('SHIMMER_PERIOD_MS', () => {
  it('is 1500ms, defined on the scale as hero * 2.5', () => {
    expect(SHIMMER_PERIOD_MS).toBe(1500)
    expect(SHIMMER_PERIOD_MS).toBe(MOTION.hero * 2.5)
  })
})

describe('SPRING_MAGNETIC', () => {
  it('defines the magnetic spring config', () => {
    expect(SPRING_MAGNETIC).toEqual({ stiffness: 300, damping: 25 })
  })
})
