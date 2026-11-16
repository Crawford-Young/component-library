import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const stories = [
  { name: 'Button Touch', id: 'inputs-button--touch' },
  { name: 'Button TouchVariants', id: 'inputs-button--touch-variants' },
]

const themes = [
  { theme: 'dark', query: '', dark: true },
  { theme: 'light', query: '&globals=backgrounds.value:!hex(ffffff)', dark: false },
] as const

for (const { name, id } of stories) {
  for (const { theme, query, dark } of themes) {
    test.describe(`${name} (${theme})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/iframe.html?id=${id}&viewMode=story${query}`)
        await page.waitForSelector('#storybook-root:not([hidden]) > *', { timeout: 15_000 })
        // Assert the theme actually applied before trusting any result.
        await expect
          .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
          .toBe(dark)
      })

      test('has no axe violations', async ({ page }) => {
        const results = await new AxeBuilder({ page }).include('#storybook-root').analyze()
        expect(results.violations).toEqual([])
      })

      test('every button is at least 96x96', async ({ page }) => {
        const sizes = await page.$$eval('#storybook-root button', (els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect()
            return { width: r.width, height: r.height }
          }),
        )
        expect(sizes.length).toBeGreaterThan(0)
        for (const s of sizes) {
          expect(s.width).toBeGreaterThanOrEqual(96)
          expect(s.height).toBeGreaterThanOrEqual(96)
        }
      })

      test('every touch button has a 32x32 icon and 18px type', async ({ page }) => {
        const metrics = await page.$$eval('#storybook-root button', (els) =>
          els.map((el) => {
            const svg = el.querySelector('svg')
            const r = svg?.getBoundingClientRect()
            return {
              svgWidth: r?.width,
              svgHeight: r?.height,
              fontSize: getComputedStyle(el).fontSize,
            }
          }),
        )
        expect(metrics.length).toBeGreaterThan(0)
        for (const m of metrics) {
          expect(m.svgWidth).toBe(32)
          expect(m.svgHeight).toBe(32)
          expect(m.fontSize).toBe('18px')
        }
      })
    })
  }
}

test('TouchVariants renders all six variants plus an icon-only button', async ({ page }) => {
  await page.goto('/iframe.html?id=inputs-button--touch-variants&viewMode=story')
  await page.waitForSelector('#storybook-root:not([hidden]) > *', { timeout: 15_000 })
  const buttons = page.locator('#storybook-root button')
  await expect(buttons).toHaveCount(7)
  const iconOnly = page.locator('#storybook-root button[aria-label="Settings"]')
  await expect(iconOnly).toHaveCount(1)
  await expect(iconOnly).toHaveText('')
  for (const label of ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']) {
    await expect(buttons.getByText(label, { exact: true })).toHaveCount(1)
  }
})
