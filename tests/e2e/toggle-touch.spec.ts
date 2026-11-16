import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const LIGHT = '&globals=backgrounds.value:!hex(ffffff)'

const stories = [
  { name: 'Toggle touch', id: 'inputs-toggle--touch', selector: 'button' },
  {
    name: 'ToggleGroup touch rail',
    id: 'inputs-togglegroup--touch-rail',
    selector: '[role="radio"]',
  },
]

async function load(page: Page, id: string, theme: 'dark' | 'light') {
  await page.goto(`/iframe.html?id=${id}&viewMode=story${theme === 'light' ? LIGHT : ''}`)
  await page.waitForSelector('#storybook-root:not([hidden]) > *', { timeout: 15_000 })
  // assert the theme actually applied before trusting axe
  const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  expect(hasDark).toBe(theme === 'dark')
}

for (const { name, id, selector } of stories) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${name} has no axe violations (${theme})`, async ({ page }) => {
      await load(page, id, theme)
      const results = await new AxeBuilder({ page }).include('#storybook-root').analyze()
      expect(results.violations).toEqual([])
    })
  }

  test(`${name}: every control is at least 96x96`, async ({ page }) => {
    await load(page, id, 'dark')
    const boxes = await page.locator(`#storybook-root ${selector}`).evaluateAll((els) =>
      els.map((e) => ({
        w: e.getBoundingClientRect().width,
        h: e.getBoundingClientRect().height,
      })),
    )
    expect(boxes.length).toBeGreaterThan(0)
    for (const b of boxes) {
      expect(b.w).toBeGreaterThanOrEqual(96)
      expect(b.h).toBeGreaterThanOrEqual(96)
    }
  })
}

test.describe('touch rail', () => {
  const id = 'inputs-togglegroup--touch-rail'

  test('items stack vertically in one column', async ({ page }) => {
    await load(page, id, 'dark')
    const rects = await page.locator('#storybook-root [role="radio"]').evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect()
        return { left: r.left, top: r.top, bottom: r.bottom }
      }),
    )
    expect(rects.length).toBeGreaterThanOrEqual(2)
    for (let i = 1; i < rects.length; i++) {
      expect(rects[i]!.top).toBeGreaterThanOrEqual(rects[i - 1]!.bottom - 0.5)
      expect(Math.abs(rects[i]!.left - rects[0]!.left)).toBeLessThanOrEqual(0.5)
    }
  })

  test('rail items are all the same width', async ({ page }) => {
    await load(page, id, 'dark')
    const widths = await page
      .locator('#storybook-root [role="radio"]')
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width))
    expect(widths.length).toBeGreaterThanOrEqual(2)
    for (const w of widths) {
      expect(Math.abs(w - widths[0]!)).toBeLessThanOrEqual(0.5)
    }
  })

  test('each icon sits above its label', async ({ page }) => {
    await load(page, id, 'dark')
    const pairs = await page.locator('#storybook-root [role="radio"]').evaluateAll((els) =>
      els.map((e) => {
        const svg = e.querySelector('svg')?.getBoundingClientRect()
        const label = e.querySelector('span')?.getBoundingClientRect()
        return svg && label ? { svgBottom: svg.bottom, labelTop: label.top } : null
      }),
    )
    expect(pairs.length).toBeGreaterThanOrEqual(2)
    for (const p of pairs) {
      expect(p).not.toBeNull()
      expect(p!.svgBottom).toBeLessThanOrEqual(p!.labelTop + 0.5)
    }
  })

  test('exactly one item is checked; clicking another moves the check', async ({ page }) => {
    await load(page, id, 'dark')
    const radios = page.locator('#storybook-root [role="radio"]')
    await expect(page.locator('#storybook-root [role="radio"][aria-checked="true"]')).toHaveCount(1)
    await expect(radios.first()).toHaveAttribute('aria-checked', 'true')
    await radios.nth(1).click()
    await expect(page.locator('#storybook-root [role="radio"][aria-checked="true"]')).toHaveCount(1)
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true')
    await expect(radios.first()).toHaveAttribute('aria-checked', 'false')
  })
})
