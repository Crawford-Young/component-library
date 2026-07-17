import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RouteErrorFallback } from './route-error-fallback'

function makeError(digest?: string): Error & { digest?: string } {
  const error: Error & { digest?: string } = new Error('boom')
  if (digest !== undefined) error.digest = digest
  return error
}

describe('RouteErrorFallback', () => {
  it('renders default title, description, and retry label', () => {
    render(<RouteErrorFallback error={makeError()} reset={() => {}} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('renders custom title, description, and retry label', () => {
    render(
      <RouteErrorFallback
        error={makeError()}
        reset={() => {}}
        title="Failed to load calendar"
        description="Calendar data could not be loaded."
        retryLabel="Reload"
      />,
    )
    expect(screen.getByText('Failed to load calendar')).toBeInTheDocument()
    expect(screen.getByText('Calendar data could not be loaded.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('calls reset when the retry button is clicked', async () => {
    const reset = vi.fn()
    const user = userEvent.setup()
    render(<RouteErrorFallback error={makeError()} reset={reset} />)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('renders the digest reference line when digest is present', () => {
    render(<RouteErrorFallback error={makeError('abc123')} reset={() => {}} />)
    expect(screen.getByText('Ref: abc123')).toBeInTheDocument()
  })

  it('does not render a reference line without a digest', () => {
    render(<RouteErrorFallback error={makeError()} reset={() => {}} />)
    expect(screen.queryByText(/^Ref:/)).not.toBeInTheDocument()
  })

  it('forwards className to the root element', () => {
    const { container } = render(
      <RouteErrorFallback error={makeError()} reset={() => {}} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders a home link when homeHref is provided', () => {
    render(<RouteErrorFallback error={makeError()} reset={() => {}} homeHref="/" />)
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/')
  })

  it('renders a custom home label', () => {
    render(
      <RouteErrorFallback
        error={makeError()}
        reset={() => {}}
        homeHref="/"
        homeLabel="Back to site"
      />,
    )
    expect(screen.getByRole('link', { name: 'Back to site' })).toBeInTheDocument()
  })

  it('does not render a home link without homeHref', () => {
    render(<RouteErrorFallback error={makeError()} reset={() => {}} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
