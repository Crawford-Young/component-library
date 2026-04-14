import { render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>card body</Card>)
    expect(screen.getByText('card body')).toBeInTheDocument()
  })

  it('applies base classes', () => {
    render(<Card>content</Card>)
    const card = screen.getByText('content')
    expect(card.className).toContain('rounded-xl')
    expect(card.className).toContain('border')
  })

  it('merges custom className', () => {
    render(<Card className="custom">content</Card>)
    expect(screen.getByText('content').className).toContain('custom')
  })

  it('forwards ref', () => {
    function Wrapper() {
      const ref = useRef<HTMLDivElement>(null)
      return <Card ref={ref}>content</Card>
    }
    render(<Wrapper />)
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>header</CardHeader>)
    expect(screen.getByText('header')).toBeInTheDocument()
  })

  it('applies padding classes', () => {
    render(<CardHeader>header</CardHeader>)
    expect(screen.getByText('header').className).toContain('p-6')
  })
})

describe('CardTitle', () => {
  it('renders as h3', () => {
    render(<CardTitle>Title</CardTitle>)
    const el = screen.getByText('Title')
    expect(el.tagName).toBe('H3')
  })

  it('applies font classes', () => {
    render(<CardTitle>Title</CardTitle>)
    const el = screen.getByText('Title')
    expect(el.className).toContain('font-semibold')
  })
})

describe('CardDescription', () => {
  it('renders children', () => {
    render(<CardDescription>desc</CardDescription>)
    expect(screen.getByText('desc')).toBeInTheDocument()
  })

  it('applies muted text class', () => {
    render(<CardDescription>desc</CardDescription>)
    expect(screen.getByText('desc').className).toContain('text-muted-foreground')
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>body</CardContent>)
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('applies padding', () => {
    render(<CardContent>body</CardContent>)
    expect(screen.getByText('body').className).toContain('p-6')
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>footer</CardFooter>)
    expect(screen.getByText('footer')).toBeInTheDocument()
  })

  it('applies flex and padding', () => {
    render(<CardFooter>footer</CardFooter>)
    const el = screen.getByText('footer')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('p-6')
  })
})
