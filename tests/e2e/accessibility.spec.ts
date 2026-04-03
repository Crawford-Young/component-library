import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const stories = [
  { name: 'Button', path: '/story/ui-button--default' },
  { name: 'Badge', path: '/story/ui-badge--default' },
  { name: 'Input', path: '/story/ui-input--default' },
  { name: 'Label', path: '/story/ui-label--default' },
  { name: 'Textarea', path: '/story/ui-textarea--default' },
  { name: 'Separator', path: '/story/ui-separator--horizontal' },
  { name: 'Card', path: '/story/ui-card--default' },
  { name: 'Skeleton', path: '/story/ui-skeleton--default' },
  { name: 'Spinner', path: '/story/ui-spinner--default' },
  { name: 'Avatar', path: '/story/ui-avatar--with-fallback' },
]

for (const { name, path } of stories) {
  test(`${name} has no axe violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze()

    expect(results.violations).toEqual([])
  })
}
