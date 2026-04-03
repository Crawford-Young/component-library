import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator', () => {
  it('renders as horizontal by default', () => {
    render(<Separator />)
    const sep = screen.getByRole('none')
    expect(sep.className).toContain('h-px')
    expect(sep.className).toContain('w-full')
  })

  it('renders as vertical', () => {
    render(<Separator orientation="vertical" />)
    const sep = screen.getByRole('none')
    expect(sep.className).toContain('h-full')
    expect(sep.className).toContain('w-px')
  })

  it('is decorative by default (role="none")', () => {
    render(<Separator />)
    expect(screen.getByRole('none')).toBeInTheDocument()
  })

  it('renders as separator when non-decorative', () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<Separator className="custom-class" />)
    expect(screen.getByRole('none').className).toContain('custom-class')
  })
})
