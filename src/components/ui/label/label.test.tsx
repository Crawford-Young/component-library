import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Email address</Label>)
    expect(screen.getByText('Email address')).toBeInTheDocument()
  })

  it('renders as a label element', () => {
    render(<Label htmlFor="email">Email</Label>)
    expect(screen.getByText('Email').tagName).toBe('LABEL')
  })

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(<Label ref={ref}>Name</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('merges custom className', () => {
    render(<Label className="custom-class">Label</Label>)
    expect(screen.getByText('Label').className).toContain('custom-class')
  })
})
