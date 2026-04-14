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
