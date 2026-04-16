import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert, AlertDescription, AlertTitle } from './alert'

describe('Alert', () => {
  it('renders with role alert', () => {
    render(<Alert>content</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Alert>hello</Alert>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('has left border class by default', () => {
    render(<Alert />)
    expect(screen.getByRole('alert').className).toContain('border-l-')
  })

  it.each([
    ['default', 'border-border'],
    ['success', 'border-success'],
    ['warning', 'border-warning'],
    ['destructive', 'border-destructive'],
    ['info', 'border-info'],
  ] as const)('renders %s variant with correct border class', (variant, expectedClass) => {
    render(<Alert variant={variant} />)
    expect(screen.getByRole('alert').className).toContain(expectedClass)
  })

  it('merges custom className', () => {
    render(<Alert className="my-class" />)
    expect(screen.getByRole('alert').className).toContain('my-class')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Alert ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('AlertTitle', () => {
  it('renders children', () => {
    render(<AlertTitle>Title text</AlertTitle>)
    expect(screen.getByText('Title text')).toBeInTheDocument()
  })

  it('applies font-semibold class', () => {
    const { container } = render(<AlertTitle>T</AlertTitle>)
    expect((container.firstChild as HTMLElement).className).toContain('font-semibold')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLHeadingElement | null }
    render(<AlertTitle ref={ref}>T</AlertTitle>)
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
  })
})

describe('AlertDescription', () => {
  it('renders children', () => {
    render(<AlertDescription>Desc text</AlertDescription>)
    expect(screen.getByText('Desc text')).toBeInTheDocument()
  })

  it('applies text-sm class', () => {
    const { container } = render(<AlertDescription>D</AlertDescription>)
    expect((container.firstChild as HTMLElement).className).toContain('text-sm')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLParagraphElement | null }
    render(<AlertDescription ref={ref}>D</AlertDescription>)
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
  })
})
