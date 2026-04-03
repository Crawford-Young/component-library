import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it.each([
    ['default', 'bg-primary'],
    ['secondary', 'bg-secondary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'text-foreground'],
  ] as const)('renders %s variant with key class', (variant, expectedClass) => {
    render(<Badge variant={variant}>B</Badge>)
    expect(screen.getByText('B').className).toContain(expectedClass)
  })

  it('merges custom className', () => {
    render(<Badge className="custom-class">B</Badge>)
    expect(screen.getByText('B').className).toContain('custom-class')
  })

  it('passes through HTML attributes', () => {
    render(<Badge data-testid="badge">B</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })
})
