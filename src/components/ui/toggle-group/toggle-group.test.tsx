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
