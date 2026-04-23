import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Toggle, toggleVariants } from './toggle'

describe('Toggle', () => {
  it('renders children', () => {
    render(<Toggle>Bold</Toggle>)
    expect(screen.getByText('Bold')).toBeInTheDocument()
  })

  it('is a button element', () => {
    render(<Toggle>B</Toggle>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('toggles pressed state on click', async () => {
    const user = userEvent.setup()
    render(<Toggle aria-label="bold">B</Toggle>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('applies default variant classes', () => {
    render(<Toggle>B</Toggle>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-transparent')
  })

  it('applies outline variant classes', () => {
    render(<Toggle variant="outline">B</Toggle>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })

  it('applies sm size classes', () => {
    render(<Toggle size="sm">B</Toggle>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-8')
  })

  it('applies lg size classes', () => {
    render(<Toggle size="lg">B</Toggle>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-11')
  })

  it('applies data-[state=on] pressed styling', async () => {
    const user = userEvent.setup()
    render(<Toggle aria-label="bold">B</Toggle>)
    const btn = screen.getByRole('button')
    await user.click(btn)
    expect(btn).toHaveAttribute('data-state', 'on')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Toggle ref={ref}>B</Toggle>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('toggleVariants is a function', () => {
    expect(typeof toggleVariants).toBe('function')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Toggle disabled>B</Toggle>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
