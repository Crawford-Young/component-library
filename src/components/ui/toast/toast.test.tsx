import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { toast, Toaster } from './toast'

describe('Toaster', () => {
  it('renders without errors', () => {
    const { container } = render(<Toaster />)
    // sonner renders an ol or section element
    expect(container).toBeInTheDocument()
  })

  it('renders an accessible list or section element', () => {
    render(<Toaster />)
    // sonner renders a section with aria-live; data-sonner-toaster is on the ol inside which only renders when toasts exist
    const toasterEl = document.querySelector('section[aria-live]')
    expect(toasterEl).toBeTruthy()
  })

  it('accepts position prop', () => {
    const { container } = render(<Toaster position="top-center" />)
    expect(container).toBeInTheDocument()
  })
})

describe('toast', () => {
  it('is a function', () => {
    expect(typeof toast).toBe('function')
  })

  it('has toast.success method', () => {
    expect(typeof toast.success).toBe('function')
  })

  it('has toast.error method', () => {
    expect(typeof toast.error).toBe('function')
  })

  it('has toast.warning method', () => {
    expect(typeof toast.warning).toBe('function')
  })

  it('has toast.info method', () => {
    expect(typeof toast.info).toBe('function')
  })

  it('has toast.promise method', () => {
    expect(typeof toast.promise).toBe('function')
  })

  it('has toast.dismiss method', () => {
    expect(typeof toast.dismiss).toBe('function')
  })
})
