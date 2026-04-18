/**
 * Token contract tests for the Rockmont palette.
 *
 * These tests FAIL against the current zinc/emerald tokens and PASS once
 * tokens.css is updated to the Rockmont values.
 *
 * Strategy:
 *   - Parse src/styles/tokens.css at test time (no DOM, no CSS-in-JS)
 *   - Assert exact RGB triples for key tokens in light and dark modes
 *   - Assert all new token names exist in the :root block
 *   - Validate every parsed token is within the 0-255 range per channel
 *   - Assert WCAG AA contrast (≥ 4.5:1) for key foreground/background pairs
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// CSS parsing helpers
// ---------------------------------------------------------------------------

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

const lightBlock = extractBlock(css, ':root')
const darkBlock = extractBlock(css, '\\.dark')
const lightTokens = parseTokens(lightBlock)
const darkTokens = parseTokens(darkBlock)
// fullDark merges light defaults with dark overrides (mirrors CSS cascade)
const fullDark = new Map([...lightTokens, ...darkTokens])

// ---------------------------------------------------------------------------
// WCAG contrast helpers
// ---------------------------------------------------------------------------

function linearize(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const l1 = Math.max(luminance(a), luminance(b))
  const l2 = Math.min(luminance(a), luminance(b))
  return (l1 + 0.05) / (l2 + 0.05)
}

// ---------------------------------------------------------------------------
// Expected Rockmont values
// ---------------------------------------------------------------------------

const ROCKMONT = {
  light: {
    '--background': [245, 243, 234] as [number, number, number],
    '--foreground': [15, 14, 12] as [number, number, number],
    '--muted-foreground': [107, 102, 89] as [number, number, number],
    '--accent': [139, 186, 52] as [number, number, number],
    '--accent-foreground': [15, 14, 12] as [number, number, number],
    '--accent-subtle': [63, 96, 46] as [number, number, number],
    '--accent-active': [255, 255, 38] as [number, number, number],
  },
  dark: {
    '--background': [17, 16, 9] as [number, number, number],
    '--foreground': [245, 243, 234] as [number, number, number],
    '--muted-foreground': [155, 154, 138] as [number, number, number],
    '--accent': [139, 186, 52] as [number, number, number],
    '--accent-foreground': [17, 16, 9] as [number, number, number],
  },
}

// New token names that must exist in :root (currently absent)
const NEW_TOKEN_NAMES = [
  '--accent-hover',
  '--accent-hover-foreground',
  '--accent-subtle',
  '--accent-subtle-foreground',
  '--accent-active',
  '--accent-active-foreground',
]

// ---------------------------------------------------------------------------
// 1. Source palette values — light mode
// ---------------------------------------------------------------------------

describe('Rockmont light mode palette values (:root)', () => {
  it('--background is Parchment (245 243 234)', () => {
    expect(lightTokens.get('--background')).toEqual(ROCKMONT.light['--background'])
  })

  it('--foreground is near-black (15 14 12)', () => {
    expect(lightTokens.get('--foreground')).toEqual(ROCKMONT.light['--foreground'])
  })

  it('--muted-foreground is warm gray (107 102 89)', () => {
    expect(lightTokens.get('--muted-foreground')).toEqual(ROCKMONT.light['--muted-foreground'])
  })

  it('--accent is Lime (139 186 52)', () => {
    expect(lightTokens.get('--accent')).toEqual(ROCKMONT.light['--accent'])
  })

  it('--accent-foreground is near-black (15 14 12)', () => {
    expect(lightTokens.get('--accent-foreground')).toEqual(ROCKMONT.light['--accent-foreground'])
  })

  it('--accent-subtle is Forest (63 96 46)', () => {
    expect(lightTokens.get('--accent-subtle')).toEqual(ROCKMONT.light['--accent-subtle'])
  })

  it('--accent-active is Sun yellow (255 255 38)', () => {
    expect(lightTokens.get('--accent-active')).toEqual(ROCKMONT.light['--accent-active'])
  })
})

// ---------------------------------------------------------------------------
// 2. Source palette values — dark mode (.dark overrides)
// ---------------------------------------------------------------------------

describe('Rockmont dark mode palette values (.dark)', () => {
  it('--background is Soil (17 16 9)', () => {
    expect(darkTokens.get('--background')).toEqual(ROCKMONT.dark['--background'])
  })

  it('--foreground is Parchment (245 243 234)', () => {
    expect(darkTokens.get('--foreground')).toEqual(ROCKMONT.dark['--foreground'])
  })

  it('--muted-foreground is warm mid-gray (155 154 138)', () => {
    expect(darkTokens.get('--muted-foreground')).toEqual(ROCKMONT.dark['--muted-foreground'])
  })

  it('--accent is Lime — same as light (139 186 52)', () => {
    expect(darkTokens.get('--accent')).toEqual(ROCKMONT.dark['--accent'])
  })

  it('--accent-foreground resolves to Soil (17 16 9) in dark mode', () => {
    expect(darkTokens.get('--accent-foreground')).toEqual(ROCKMONT.dark['--accent-foreground'])
  })
})

// ---------------------------------------------------------------------------
// 3. New token API surface — all 6 names must exist in :root
// ---------------------------------------------------------------------------

describe('New token API surface (must exist in :root)', () => {
  for (const name of NEW_TOKEN_NAMES) {
    it(`${name} is defined in :root`, () => {
      expect(
        lightTokens.has(name),
        `Expected token ${name} to be defined in :root but it was missing`,
      ).toBe(true)
    })
  }
})

// ---------------------------------------------------------------------------
// 4. RGB format validation — all parsed tokens must have channels in 0-255
// ---------------------------------------------------------------------------

describe('RGB format validation', () => {
  it('all :root tokens have channels in [0, 255]', () => {
    for (const [name, [r, g, b]] of lightTokens) {
      expect(r, `${name} red channel out of range`).toBeGreaterThanOrEqual(0)
      expect(r, `${name} red channel out of range`).toBeLessThanOrEqual(255)
      expect(g, `${name} green channel out of range`).toBeGreaterThanOrEqual(0)
      expect(g, `${name} green channel out of range`).toBeLessThanOrEqual(255)
      expect(b, `${name} blue channel out of range`).toBeGreaterThanOrEqual(0)
      expect(b, `${name} blue channel out of range`).toBeLessThanOrEqual(255)
    }
  })

  it('all .dark tokens have channels in [0, 255]', () => {
    for (const [name, [r, g, b]] of darkTokens) {
      expect(r, `${name} red channel out of range`).toBeGreaterThanOrEqual(0)
      expect(r, `${name} red channel out of range`).toBeLessThanOrEqual(255)
      expect(g, `${name} green channel out of range`).toBeGreaterThanOrEqual(0)
      expect(g, `${name} green channel out of range`).toBeLessThanOrEqual(255)
      expect(b, `${name} blue channel out of range`).toBeGreaterThanOrEqual(0)
      expect(b, `${name} blue channel out of range`).toBeLessThanOrEqual(255)
    }
  })
})

// ---------------------------------------------------------------------------
// 5. WCAG AA contrast gates — key pairs must be ≥ 4.5:1
// ---------------------------------------------------------------------------

describe('WCAG AA contrast (≥ 4.5:1)', () => {
  describe('Light mode', () => {
    it('foreground on background', () => {
      const fg = lightTokens.get('--foreground')!
      const bg = lightTokens.get('--background')!
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })

    it('muted-foreground on background', () => {
      const fg = lightTokens.get('--muted-foreground')!
      const bg = lightTokens.get('--background')!
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })

    it('accent-foreground on accent', () => {
      const fg = lightTokens.get('--accent-foreground')!
      const bg = lightTokens.get('--accent')!
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('Dark mode (using cascaded values)', () => {
    it('foreground on background', () => {
      const fg = fullDark.get('--foreground')!
      const bg = fullDark.get('--background')!
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })

    it('muted-foreground on background', () => {
      const fg = fullDark.get('--muted-foreground')!
      const bg = fullDark.get('--background')!
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })

    it('accent on background', () => {
      const fg = fullDark.get('--accent')!
      const bg = fullDark.get('--background')!
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })

    it('accent-active (Sun yellow) on background', () => {
      // accent-active must exist in light (new token) and be usable in dark context
      const yellow = lightTokens.get('--accent-active')!
      const bg = fullDark.get('--background')!
      expect(contrastRatio(yellow, bg)).toBeGreaterThanOrEqual(4.5)
    })
  })
})
