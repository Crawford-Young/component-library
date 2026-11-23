import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const stories = [
  { name: 'States', id: 'display-agentnodering--states' },
  { name: 'Root', id: 'display-agentnodering--root' },
  { name: 'Default', id: 'display-agentnodering--default' },
  { name: 'RootIdle', id: 'display-agentnodering--root-idle' },
  { name: 'RootDone', id: 'display-agentnodering--root-done' },
  { name: 'DefaultSelected', id: 'display-agentnodering--default-selected' },
  { name: 'NoContext', id: 'display-agentnodering--no-context' },
  { name: 'Dense', id: 'display-agentnodering--dense' },
  { name: 'DenseSelected', id: 'display-agentnodering--dense-selected' },
]

const themes = [
  { theme: 'dark', query: '', dark: true },
  { theme: 'light', query: '&globals=backgrounds.value:!hex(ffffff)', dark: false },
] as const

const discSizes = [
  { name: 'Root', id: 'display-agentnodering--root', size: 'root', px: 120 },
  { name: 'Default', id: 'display-agentnodering--default', size: 'default', px: 96 },
  { name: 'States', id: 'display-agentnodering--states', size: 'default', px: 96 },
] as const

async function open(
  page: import('@playwright/test').Page,
  id: string,
  query: string,
  dark: boolean,
) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story${query}`)
  await page.waitForSelector('#storybook-root:not([hidden]) > *', { timeout: 15_000 })
  // Assert the theme actually applied before trusting any result.
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
    .toBe(dark)
}

for (const { theme, query, dark } of themes) {
  for (const { name, id } of stories) {
    test(`AgentNodeRing ${name} (${theme}) has no axe violations`, async ({ page }) => {
      await open(page, id, query, dark)
      const results = await new AxeBuilder({ page }).include('#storybook-root').analyze()
      expect(results.violations).toEqual([])
    })
  }

  for (const { name, id, size, px } of discSizes) {
    test(`AgentNodeRing ${name} (${theme}) discs are ${px}x${px}`, async ({ page }) => {
      await open(page, id, query, dark)
      const discs = await page.$$eval(`[data-size="${size}"] [data-slot="ring"]`, (els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect()
          return { width: r.width, height: r.height }
        }),
      )
      expect(discs.length).toBeGreaterThan(0)
      for (const d of discs) {
        expect(Math.abs(d.width - px)).toBeLessThanOrEqual(1)
        expect(Math.abs(d.height - px)).toBeLessThanOrEqual(1)
      }
    })
  }

  test(`AgentNodeRing Dense (${theme}) dots render at the size the story set`, async ({ page }) => {
    await open(page, 'display-agentnodering--dense', query, dark)
    const rows = await page.$$eval('[data-row-size]', (rowEls) =>
      rowEls.map((row) => ({
        expected: Number(row.getAttribute('data-row-size')),
        dots: Array.from(row.querySelectorAll('button[data-size="dense"]')).map((b) => {
          const r = b.getBoundingClientRect()
          return { width: r.width, height: r.height }
        }),
      })),
    )
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.dots).toHaveLength(4)
      for (const d of row.dots) {
        expect(Math.abs(d.width - row.expected)).toBeLessThanOrEqual(1)
        expect(Math.abs(d.height - row.expected)).toBeLessThanOrEqual(1)
      }
    }
  })
}

test('AgentNodeRing accessible name says the context percent once, rounded', async ({ page }) => {
  await open(page, 'display-agentnodering--default', '&args=context:42.4', true)
  const button = page.getByRole('button')
  // Exactly one "42" (not "42 42%", not "42.4"), and the percent is present.
  await expect(button).toHaveAccessibleName(/^(?:(?!42).)*42%(?:(?!42).)*$/)
  await expect(button).toHaveAccessibleName(/implementer/)
  await expect(button).toHaveAccessibleName(/strate#62/)
})

// Exact names below are written from each story's props (every fact once, in reading order,
// separator dots hidden), not copied from what the browser rendered.
test('AgentNodeRing Root accessible names say each fact once', async ({ page }) => {
  await open(page, 'display-agentnodering--root', '', true)
  const buttons = page.getByRole('button')
  await expect(buttons).toHaveCount(3)
  await expect(buttons.nth(0)).toHaveAccessibleName('42% director strate#62 working $7.10')
  // Selection is a pressed state, not part of the name.
  await expect(buttons.nth(1)).toHaveAccessibleName('42% director strate#62 working $7.10')
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(buttons.nth(2)).toHaveAccessibleName('84% director strate#62 needs you $7.10')
})

test('AgentNodeRing Dense accessible names say each fact once', async ({ page }) => {
  await open(page, 'display-agentnodering--dense', '', true)
  const buttons = page.getByRole('button')
  // Two rows (24px, 12px) of the four states, in the story's state order.
  const labels = ['working', 'needs you', 'idle', 'done']
  await expect(buttons).toHaveCount(labels.length * 2)
  for (const [i, label] of [...labels, ...labels].entries()) {
    await expect(buttons.nth(i)).toHaveAccessibleName(`implementer, ${label}, context 42%`)
  }
})

test('AgentNodeRing NoContext accessible name carries no context percent', async ({ page }) => {
  await open(page, 'display-agentnodering--no-context', '', true)
  const button = page.getByRole('button')
  await expect(button).toHaveCount(1)
  await expect(button).toHaveAccessibleName('implementer strate#62 idle $0.00')
  await expect(button).not.toHaveAccessibleName(/%|context/)
})

// #159: a dense needs-you dot's warning halo is a box-shadow ring. Focus used to be one too and
// replaced it. Read computed styles after a real keyboard Tab, never class names.
const WARNING_HALO = 'rgba(245, 158, 11, 0.5)'

for (const { theme, query, dark } of themes) {
  test(`AgentNodeRing dense needs-you keeps its halo under keyboard focus (${theme})`, async ({
    page,
  }) => {
    await open(page, 'display-agentnodering--dense-selected', query, dark)
    const plain = page.getByRole('button', { name: /^implementer/ })
    const selected = page.getByRole('button', { name: /^reviewer/ })

    const read = (el: Element) => {
      const cs = getComputedStyle(el)
      return {
        boxShadow: cs.boxShadow,
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        outlineOffset: cs.outlineOffset,
      }
    }

    const selectedBefore = await selected.evaluate(read)

    await page.keyboard.press('Tab')
    await expect(plain).toBeFocused()
    const focused = await plain.evaluate(read)
    expect(focused.boxShadow).toContain(WARNING_HALO)
    expect(focused.outlineStyle).toBe('solid')
    expect(focused.outlineWidth).toBe('2px')

    await page.keyboard.press('Tab')
    await expect(selected).toBeFocused()
    const selectedFocused = await selected.evaluate(read)
    expect(selectedFocused.boxShadow).toContain(WARNING_HALO)
    expect(selectedFocused.outlineStyle).toBe('solid')
    // Focus is visible on the selected dot too: its outline steps out.
    expect(selectedFocused.outlineOffset).not.toBe(selectedBefore.outlineOffset)
  })
}
