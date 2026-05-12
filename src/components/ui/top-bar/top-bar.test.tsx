import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopBar } from './top-bar'

describe('TopBar', () => {
  it('renders title when provided', () => {
    render(<TopBar title="Goals" />)
    expect(screen.getByText('Goals')).toBeInTheDocument()
  })

  it('renders logo slot when provided', () => {
    render(<TopBar logo={<span data-testid="logo">logo</span>} />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders actions slot when provided', () => {
    render(<TopBar actions={<button>Avatar</button>} />)
    expect(screen.getByRole('button', { name: 'Avatar' })).toBeInTheDocument()
  })

  it('renders as a header element', () => {
    const { container } = render(<TopBar title="Home" />)
    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<TopBar className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
