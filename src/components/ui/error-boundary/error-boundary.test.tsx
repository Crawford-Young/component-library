import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary, ErrorPage } from './error-boundary'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.mocked(console.error).mockRestore()
})

function Bomb({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Explosion!')
  return <p>Safe</p>
}

describe('ErrorPage', () => {
  it('renders 404 defaults', () => {
    render(<ErrorPage code={404} />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
    expect(screen.getByText(/couldn't find the page/)).toBeInTheDocument()
  })

  it('renders 500 defaults', () => {
    render(<ErrorPage code={500} />)
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('renders generic defaults when code is unknown', () => {
    render(<ErrorPage code={418} />)
    expect(screen.getByText('418')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('accepts custom title and description', () => {
    render(<ErrorPage title="Custom title" description="Custom description" />)
    expect(screen.getByText('Custom title')).toBeInTheDocument()
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })

  it('renders action slot', () => {
    render(<ErrorPage action={<button>Go home</button>} />)
    expect(screen.getByRole('button', { name: 'Go home' })).toBeInTheDocument()
  })

  it('does not render code when code is not provided', () => {
    render(<ErrorPage title="Oops" />)
    expect(screen.queryByText('500')).not.toBeInTheDocument()
  })

  it('forwards className to the root element', () => {
    const { container } = render(<ErrorPage className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Safe')).toBeInTheDocument()
  })

  it('renders default ErrorPage fallback when error is thrown', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('renders ReactNode fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('renders render-prop fallback with error when provided', () => {
    render(
      <ErrorBoundary fallback={(err) => <p>{err.message}</p>}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Explosion!')).toBeInTheDocument()
  })

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    )
  })
})
