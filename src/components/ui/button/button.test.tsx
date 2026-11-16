import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it.each([
    ['default', 'bg-primary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'border-input'],
    ['secondary', 'bg-secondary'],
    ['ghost', 'hover:bg-accent'],
    ['link', 'underline-offset-4'],
  ] as const)('renders %s variant with key class', (variant, expectedClass) => {
    render(<Button variant={variant}>B</Button>)
    expect(screen.getByRole('button').className).toContain(expectedClass)
  })

  it.each([
    ['default', ['h-10']],
    ['sm', ['h-8']],
    ['lg', ['h-11']],
    ['icon', ['h-10', 'w-10']],
  ] as const)('renders %s size with key classes', (size, expectedClasses) => {
    render(<Button size={size}>B</Button>)
    expectedClasses.forEach((cls) => expect(screen.getByRole('button').className).toContain(cls))
  })

  const touchClasses = [
    'h-24',
    'min-w-24',
    'gap-3',
    'rounded-lg',
    'px-6',
    'text-lg',
    '[&_svg]:size-8',
    '[&_svg]:shrink-0',
  ]

  it('renders touch size with the touch classes', () => {
    render(<Button size="touch">B</Button>)
    const tokens = screen.getByRole('button').className.split(/\s+/)
    touchClasses.forEach((cls) => expect(tokens).toContain(cls))
    expect(tokens).not.toContain('h-10')
    expect(tokens).not.toContain('rounded')
  })

  it.each([
    ['default', 'bg-primary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'border-input'],
    ['secondary', 'bg-secondary'],
    ['ghost', 'hover:bg-accent'],
    ['link', 'underline-offset-4'],
  ] as const)('combines %s variant with touch size', (variant, variantClass) => {
    render(
      <Button variant={variant} size="touch">
        B
      </Button>,
    )
    const tokens = screen.getByRole('button').className.split(/\s+/)
    expect(tokens).toContain(variantClass)
    touchClasses.forEach((cls) => expect(tokens).toContain(cls))
  })

  it('renders an icon-only touch button with a minimum 24-unit width', () => {
    render(
      <Button size="touch" aria-label="Settings">
        <svg aria-hidden="true" />
      </Button>,
    )
    const tokens = screen.getByRole('button', { name: 'Settings' }).className.split(/\s+/)
    expect(tokens).toContain('h-24')
    expect(tokens).toContain('min-w-24')
    expect(tokens).toContain('[&_svg]:size-8')
  })

  it('lets a consumer stack touch content with flex-col', () => {
    render(
      <Button size="touch" className="flex-col">
        B
      </Button>,
    )
    expect(screen.getByRole('button').className.split(/\s+/)).toContain('flex-col')
  })

  it('applies touch classes to an asChild element', () => {
    render(
      <Button asChild size="touch">
        <a href="/home">Link button</a>
      </Button>,
    )
    const tokens = screen.getByRole('link', { name: 'Link button' }).className.split(/\s+/)
    touchClasses.forEach((cls) => expect(tokens).toContain(cls))
  })

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/home">Link button</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Link button' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has displayName', () => {
    expect(Button.displayName).toBe('Button')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>B</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">B</Button>)
    expect(screen.getByRole('button').className).toContain('custom-class')
  })
})
