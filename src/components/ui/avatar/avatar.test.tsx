import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar', () => {
  it('renders', () => {
    const { container } = render(<Avatar />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies base classes', () => {
    const { container } = render(<Avatar />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('overflow-hidden')
  })

  it('renders md size by default', () => {
    const { container } = render(<Avatar />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-10')
    expect(el.className).toContain('w-10')
  })

  it('renders sm size', () => {
    const { container } = render(<Avatar size="sm" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-8')
    expect(el.className).toContain('w-8')
  })

  it('renders lg size', () => {
    const { container } = render(<Avatar size="lg" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-12')
    expect(el.className).toContain('w-12')
  })

  it('merges custom className', () => {
    const { container } = render(<Avatar className="custom" />)
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })
})

describe('AvatarImage', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="test.png" alt="test" />
        <AvatarFallback>CY</AvatarFallback>
      </Avatar>,
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('AvatarFallback', () => {
  it('renders children', () => {
    render(
      <Avatar>
        <AvatarFallback>CY</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('CY')).toBeInTheDocument()
  })

  it('applies centering classes', () => {
    render(
      <Avatar>
        <AvatarFallback>CY</AvatarFallback>
      </Avatar>,
    )
    const el = screen.getByText('CY')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('items-center')
    expect(el.className).toContain('justify-center')
  })
})
