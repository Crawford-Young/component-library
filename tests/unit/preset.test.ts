import { describe, it, expect } from 'vitest'
import { cyUIPreset } from '../../src/tailwind/preset'

describe('cyUIPreset — colors', () => {
  it('exposes item-hover color', () => {
    const colors = (cyUIPreset.theme?.extend as Record<string, unknown>)?.colors as Record<
      string,
      unknown
    >
    expect(colors['item-hover']).toBe('rgb(var(--item-hover) / <alpha-value>)')
  })
})
