import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './sidebar'

describe('Sidebar', () => {
  it('renders children', () => {
    render(
      <Sidebar>
        <p>nav item</p>
      </Sidebar>,
    )
    expect(screen.getByText('nav item')).toBeInTheDocument()
  })

  it('renders footer slot when provided', () => {
    render(
      <Sidebar footer={<div data-testid="footer">footer</div>}>
        <p>nav</p>
      </Sidebar>,
    )
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('does not render footer when omitted', () => {
    const { queryByTestId } = render(
      <Sidebar>
        <p>nav</p>
      </Sidebar>,
    )
    expect(queryByTestId('footer')).not.toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <Sidebar className="custom">
        <p>nav</p>
      </Sidebar>,
    )
    expect(container.firstChild).toHaveClass('custom')
  })
})
