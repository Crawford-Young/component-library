import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const stories = [
  { name: 'Alert', id: 'ui-alert--default' },
  { name: 'Avatar', id: 'ui-avatar--with-fallback' },
  { name: 'Badge', id: 'ui-badge--default' },
  { name: 'Button', id: 'ui-button--default' },
  { name: 'Card', id: 'ui-card--default' },
  { name: 'Checkbox', id: 'ui-checkbox--default' },
  { name: 'Dialog', id: 'ui-dialog--default' },
  { name: 'Input', id: 'ui-input--default' },
  { name: 'Label', id: 'ui-label--default' },
  { name: 'Popover', id: 'ui-popover--default' },
  { name: 'Progress', id: 'ui-progress--default' },
  { name: 'RadioGroup', id: 'ui-radiogroup--default' },
  { name: 'Select', id: 'ui-select--default' },
  { name: 'Separator', id: 'ui-separator--horizontal' },
  { name: 'Skeleton', id: 'ui-skeleton--default' },
  { name: 'Spinner', id: 'ui-spinner--default' },
  { name: 'Switch', id: 'ui-switch--default' },
  { name: 'Textarea', id: 'ui-textarea--default' },
  { name: 'Tooltip', id: 'ui-tooltip--default' },
  { name: 'AlertDialog', id: 'ui-alertdialog--default' },
  { name: 'Sheet', id: 'ui-sheet--default' },
  { name: 'DropdownMenu', id: 'ui-dropdownmenu--default' },
  { name: 'ContextMenu', id: 'ui-contextmenu--default' },
  { name: 'Tabs', id: 'ui-tabs--default' },
  { name: 'Accordion', id: 'ui-accordion--default' },
  { name: 'Collapsible', id: 'ui-collapsible--default' },
  { name: 'NavigationMenu', id: 'ui-navigationmenu--default' },
  { name: 'ScrollArea', id: 'ui-scrollarea--default' },
  { name: 'AspectRatio', id: 'ui-aspectratio--default' },
  { name: 'Table', id: 'ui-table--default' },
  { name: 'Breadcrumb', id: 'ui-breadcrumb--default' },
  { name: 'Pagination', id: 'ui-pagination--default' },
  { name: 'Slider', id: 'ui-slider--default' },
]

for (const { name, id } of stories) {
  test(`${name} has no axe violations`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`)
    await page.waitForSelector('#storybook-root:not([hidden]) > *', { timeout: 15_000 })

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze()

    expect(results.violations).toEqual([])
  })
}
