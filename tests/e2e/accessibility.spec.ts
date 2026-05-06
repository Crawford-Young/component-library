import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const stories = [
  { name: 'Alert', id: 'feedback-alert--default' },
  { name: 'Avatar', id: 'display-avatar--with-fallback' },
  { name: 'Badge', id: 'display-badge--default' },
  { name: 'Button', id: 'inputs-button--default' },
  { name: 'Card', id: 'display-card--default' },
  { name: 'Checkbox', id: 'inputs-checkbox--default' },
  { name: 'Dialog', id: 'overlays-dialog--default' },
  { name: 'Input', id: 'inputs-input--default' },
  { name: 'Label', id: 'form-label--default' },
  { name: 'Popover', id: 'overlays-popover--default' },
  { name: 'Progress', id: 'feedback-progress--default' },
  { name: 'RadioGroup', id: 'inputs-radiogroup--default' },
  { name: 'Select', id: 'inputs-select--default' },
  { name: 'Separator', id: 'display-separator--horizontal' },
  { name: 'Skeleton', id: 'display-skeleton--default' },
  { name: 'Spinner', id: 'display-spinner--default' },
  { name: 'Switch', id: 'inputs-switch--default' },
  { name: 'Textarea', id: 'inputs-textarea--default' },
  { name: 'Tooltip', id: 'overlays-tooltip--default' },
  { name: 'AlertDialog', id: 'overlays-alertdialog--default' },
  { name: 'Sheet', id: 'overlays-sheet--default' },
  { name: 'DropdownMenu', id: 'menus-dropdownmenu--default' },
  { name: 'ContextMenu', id: 'menus-contextmenu--default' },
  { name: 'Tabs', id: 'navigation-tabs--default' },
  { name: 'Accordion', id: 'disclosure-accordion--default' },
  { name: 'Collapsible', id: 'disclosure-collapsible--default' },
  { name: 'NavigationMenu', id: 'navigation-navigationmenu--default' },
  { name: 'ScrollArea', id: 'layout-scrollarea--default' },
  { name: 'AspectRatio', id: 'layout-aspectratio--default' },
  { name: 'Table', id: 'data-table--default' },
  { name: 'Breadcrumb', id: 'navigation-breadcrumb--default' },
  { name: 'Pagination', id: 'navigation-pagination--default' },
  { name: 'Slider', id: 'inputs-slider--default' },
  { name: 'FormField', id: 'form-formfield--default' },
  { name: 'Toggle', id: 'inputs-toggle--default' },
  { name: 'ToggleGroup', id: 'inputs-togglegroup--default' },
  { name: 'Command', id: 'menus-command--default' },
  { name: 'Combobox', id: 'menus-combobox--default' },
  { name: 'Toaster', id: 'overlays-toast--default' },
  { name: 'DatePicker', id: 'inputs-datepicker--default' },
  { name: 'PaginationControl', id: 'data-paginationcontrol--few-pages' },
  { name: 'DataTable', id: 'data-datatable--default' },
  { name: 'ErrorPage', id: 'feedback-errorboundary--not-found' },
  { name: 'CountUp', id: 'display-countup--default' },
  { name: 'BentoGrid', id: 'layout-bentogrid--default' },
]

for (const { name, id } of stories) {
  test(`${name} has no axe violations`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`)
    await page.waitForSelector('#storybook-root:not([hidden]) > *', { timeout: 15_000 })

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze()

    expect(results.violations).toEqual([])
  })
}
