import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Goals" />)
    expect(screen.getByRole('heading', { name: 'Goals' })).toBeInTheDocument()
  })

  it('renders action slot when provided', () => {
    render(<PageHeader title="Goals" action={<button>New Goal</button>} />)
    expect(screen.getByRole('button', { name: 'New Goal' })).toBeInTheDocument()
  })

  it('does not render action slot when omitted', () => {
    const { queryByRole } = render(<PageHeader title="Goals" />)
    expect(queryByRole('button')).not.toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<PageHeader title="Goals" className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('renders a ReactNode title inside the h1', () => {
    render(<PageHeader title={<em data-testid="rich-title">Calendar</em>} />)
    expect(screen.getByRole('heading', { level: 1 })).toContainElement(
      screen.getByTestId('rich-title'),
    )
  })
})
