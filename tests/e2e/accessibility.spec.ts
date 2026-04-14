import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const stories = [
  { name: 'Button', id: 'ui-button--default' },
  { name: 'Badge', id: 'ui-badge--default' },
  { name: 'Input', id: 'ui-input--default' },
  { name: 'Label', id: 'ui-label--default' },
  { name: 'Textarea', id: 'ui-textarea--default' },
  { name: 'Separator', id: 'ui-separator--horizontal' },
  { name: 'Card', id: 'ui-card--default' },
  { name: 'Skeleton', id: 'ui-skeleton--default' },
  { name: 'Spinner', id: 'ui-spinner--default' },
  { name: 'Avatar', id: 'ui-avatar--with-fallback' },
]

for (const { name, id } of stories) {
  test(`${name} has no axe violations`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`)
    await page.waitForSelector('#storybook-root:not([hidden]) > *', { timeout: 15_000 })

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze()

    expect(results.violations).toEqual([])
  })
}
