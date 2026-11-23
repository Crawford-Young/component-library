import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

expect.extend(toHaveNoViolations)

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it.each([
    ['default', 'bg-primary'],
    ['secondary', 'bg-secondary'],
    ['destructive', 'bg-destructive'],
    ['warning', 'bg-warning'],
    ['success', 'bg-success'],
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

describe('Badge asChild', () => {
  it('renders a div by default', () => {
    render(<Badge>B</Badge>)
    expect(screen.getByText('B').tagName).toBe('DIV')
  })

  it('takes its look on the child element and renders no wrapper', () => {
    render(
      <Badge asChild variant="outline" className="extra">
        <span data-testid="chip">chip</span>
      </Badge>,
    )
    const chip = screen.getByTestId('chip')
    expect(chip.tagName).toBe('SPAN')
    expect(chip).toHaveClass('text-foreground', 'extra', 'rounded-full')
  })

  it('is valid inside a button (no block element in phrasing content)', () => {
    render(
      <button type="button">
        <Badge asChild>
          <span>inside</span>
        </Badge>
      </button>,
    )
    expect(screen.getByRole('button').querySelector('div')).toBeNull()
  })
})

describe('Badge - axe', () => {
  it('has no axe violations in the success variant', async () => {
    const { container } = render(<Badge variant="success">Checks passed</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
