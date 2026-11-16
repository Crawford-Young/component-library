import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

describe('ToggleGroup (single)', () => {
  it('renders items', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('selects one item at a time (single mode)', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a" aria-label="A">
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b" aria-label="B">
          B
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    // Radix ToggleGroup type="single" renders items with role="radio"
    const btnA = screen.getByRole('radio', { name: 'A' })
    const btnB = screen.getByRole('radio', { name: 'B' })
    await user.click(btnA)
    expect(btnA).toHaveAttribute('data-state', 'on')
    expect(btnB).toHaveAttribute('data-state', 'off')
    await user.click(btnB)
    expect(btnA).toHaveAttribute('data-state', 'off')
    expect(btnB).toHaveAttribute('data-state', 'on')
  })

  it('applies variant and size from group context to items', () => {
    render(
      <ToggleGroup type="single" variant="outline" size="sm">
        <ToggleGroupItem value="x" aria-label="X">
          X
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    // Radix ToggleGroup type="single" renders items with role="radio"
    const btn = screen.getByRole('radio', { name: 'X' })
    expect(btn.className).toContain('border')
    expect(btn.className).toContain('h-8')
  })
})

describe('ToggleGroup touch size', () => {
  it('group size="touch" reaches items through context', () => {
    render(
      <ToggleGroup type="single" size="touch">
        <ToggleGroupItem value="a" aria-label="A">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const cls = screen.getByRole('radio', { name: 'A' }).className.split(/\s+/)
    expect(cls).toContain('h-24')
    expect(cls).toContain('min-w-24')
    expect(cls).toContain('flex-col')
  })

  it("an item's own size overrides the group's touch size", () => {
    render(
      <ToggleGroup type="single" size="touch">
        <ToggleGroupItem value="a" size="sm" aria-label="A">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const cls = screen.getByRole('radio', { name: 'A' }).className.split(/\s+/)
    expect(cls).toContain('h-8')
    expect(cls).not.toContain('h-24')
  })
})

describe('ToggleGroup orientation', () => {
  const group = (orientation?: 'vertical' | 'horizontal') => (
    <ToggleGroup type="single" orientation={orientation} aria-label="rail" size="touch">
      <ToggleGroupItem value="a" aria-label="A">
        A
      </ToggleGroupItem>
      <ToggleGroupItem value="b" aria-label="B">
        B
      </ToggleGroupItem>
    </ToggleGroup>
  )

  it('vertical root stacks items and stretches them', () => {
    render(group('vertical'))
    const cls = screen.getByRole('group', { name: 'rail' }).className.split(/\s+/)
    expect(cls).toContain('flex-col')
    expect(cls).toContain('items-stretch')
    expect(cls).not.toContain('items-center')
  })

  it.each([undefined, 'horizontal'] as const)('orientation %s keeps the row classes', (o) => {
    render(group(o))
    const cls = screen.getByRole('group', { name: 'rail' }).className.split(/\s+/)
    expect(cls).toEqual(expect.arrayContaining(['flex', 'items-center', 'justify-center', 'gap-1']))
    expect(cls).not.toContain('flex-col')
    expect(cls).not.toContain('items-stretch')
  })

  it('vertical single group: one checked, clicking another moves the check', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup
        type="single"
        orientation="vertical"
        defaultValue="a"
        aria-label="rail"
        size="touch"
      >
        <ToggleGroupItem value="a" aria-label="A">
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b" aria-label="B">
          B
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const a = screen.getByRole('radio', { name: 'A' })
    const b = screen.getByRole('radio', { name: 'B' })
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(1)
    expect(a).toBeChecked()
    await user.click(b)
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(1)
    expect(b).toBeChecked()
    expect(a).not.toBeChecked()
  })

  it('ArrowDown moves focus to the next item when vertical', async () => {
    const user = userEvent.setup()
    render(group('vertical'))
    const a = screen.getByRole('radio', { name: 'A' })
    const b = screen.getByRole('radio', { name: 'B' })
    expect(screen.getByRole('group', { name: 'rail' })).toHaveAttribute(
      'data-orientation',
      'vertical',
    )
    a.focus()
    // a vertical roving group ignores the horizontal arrow
    await user.keyboard('{ArrowRight}')
    expect(a).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(b).toHaveFocus()
  })
})

describe('ToggleGroup (multiple)', () => {
  it('allows multiple items to be pressed simultaneously', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="a" aria-label="A">
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b" aria-label="B">
          B
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const btnA = screen.getByRole('button', { name: 'A' })
    const btnB = screen.getByRole('button', { name: 'B' })
    await user.click(btnA)
    await user.click(btnB)
    expect(btnA).toHaveAttribute('data-state', 'on')
    expect(btnB).toHaveAttribute('data-state', 'on')
  })
})

describe('ToggleGroupItem', () => {
  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="x" ref={ref}>
          X
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('is disabled when disabled prop is set', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="x" disabled aria-label="X">
          X
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    // Radix ToggleGroup type="single" renders items with role="radio"; disabled sets data-disabled
    const item = screen.getByRole('radio', { name: 'X' })
    expect(item).toHaveAttribute('data-disabled')
  })
})
