import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, '../../src/styles/tokens.css'), 'utf-8')

function extractBlock(source: string, selector: string): string {
  const re = new RegExp(`${selector}\\s*\\{([^}]*)\\}`, 's')
  return re.exec(source)?.[1] ?? ''
}

function parseTokens(block: string): Map<string, [number, number, number]> {
  const tokens = new Map<string, [number, number, number]>()
  const re = /--([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)/g
  let m
  while ((m = re.exec(block)) !== null) {
    tokens.set(`--${m[1]}`, [Number(m[2]), Number(m[3]), Number(m[4])])
  }
  return tokens
}

const lightTokens = parseTokens(extractBlock(css, ':root'))
const darkTokens = parseTokens(extractBlock(css, '\\.dark'))
const dark = new Map([...lightTokens, ...darkTokens])

function linearize(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}
function contrast(a: [number, number, number], b: [number, number, number]): number {
  const l1 = Math.max(luminance(a), luminance(b))
  const l2 = Math.min(luminance(a), luminance(b))
  return (l1 + 0.05) / (l2 + 0.05)
}

// ─── Palette values ───────────────────────────────────────────────────────────

describe('tokens.css — accent ramp values', () => {
  it('--accent is emerald-500 [16, 185, 129]', () => {
    expect(lightTokens.get('--accent')).toEqual([16, 185, 129])
  })
  it('--accent-hover is emerald-400 [52, 211, 153]', () => {
    expect(lightTokens.get('--accent-hover')).toEqual([52, 211, 153])
  })
  it('--accent-subtle is emerald-100 [209, 250, 229] in light', () => {
    expect(lightTokens.get('--accent-subtle')).toEqual([209, 250, 229])
  })
  it('--accent-subtle is emerald-950 [2, 44, 34] in dark', () => {
    expect(darkTokens.get('--accent-subtle')).toEqual([2, 44, 34])
  })
  it('--accent-active is emerald-300 [110, 231, 183]', () => {
    expect(lightTokens.get('--accent-active')).toEqual([110, 231, 183])
  })
})

// ─── Token API surface ────────────────────────────────────────────────────────

describe('tokens.css — new token API exists in both modes', () => {
  const required = [
    '--accent-hover',
    '--accent-hover-foreground',
    '--accent-subtle',
    '--accent-subtle-foreground',
    '--accent-active',
    '--accent-active-foreground',
  ]
  for (const token of required) {
    it(`light has ${token}`, () => expect(lightTokens.has(token)).toBe(true))
    it(`dark has ${token}`, () => expect(dark.has(token)).toBe(true))
  }
})

// ─── WCAG AA (≥ 4.5:1) ───────────────────────────────────────────────────────

describe('tokens.css — WCAG AA contrast', () => {
  it('light: foreground on background', () => {
    expect(
      contrast(lightTokens.get('--foreground')!, lightTokens.get('--background')!),
    ).toBeGreaterThanOrEqual(4.5)
  })
  it('light: muted-foreground on background', () => {
    expect(
      contrast(lightTokens.get('--muted-foreground')!, lightTokens.get('--background')!),
    ).toBeGreaterThanOrEqual(4.5)
  })
  it('light: accent-foreground on accent', () => {
    expect(
      contrast(lightTokens.get('--accent-foreground')!, lightTokens.get('--accent')!),
    ).toBeGreaterThanOrEqual(4.5)
  })
  it('light: accent-hover-foreground on accent-hover', () => {
    expect(
      contrast(lightTokens.get('--accent-hover-foreground')!, lightTokens.get('--accent-hover')!),
    ).toBeGreaterThanOrEqual(4.5)
  })
  it('light: accent-subtle-foreground on accent-subtle', () => {
    expect(
      contrast(lightTokens.get('--accent-subtle-foreground')!, lightTokens.get('--accent-subtle')!),
    ).toBeGreaterThanOrEqual(4.5)
  })
  it('dark: foreground on background', () => {
    expect(contrast(dark.get('--foreground')!, dark.get('--background')!)).toBeGreaterThanOrEqual(
      4.5,
    )
  })
  it('dark: accent on background', () => {
    expect(contrast(dark.get('--accent')!, dark.get('--background')!)).toBeGreaterThanOrEqual(4.5)
  })
  it('dark: accent-hover on background', () => {
    expect(contrast(dark.get('--accent-hover')!, dark.get('--background')!)).toBeGreaterThanOrEqual(
      4.5,
    )
  })
  it('dark: accent-active on background', () => {
    expect(
      contrast(dark.get('--accent-active')!, dark.get('--background')!),
    ).toBeGreaterThanOrEqual(4.5)
  })
})
