import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('renders a div', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies animate-pulse class', () => {
    const { container } = render(<Skeleton />)
    expect((container.firstChild as HTMLElement).className).toContain('animate-pulse')
  })

  it('applies rounded and background classes', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-md')
    expect(el.className).toContain('bg-muted')
  })

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-32')
  })

  it('forwards extra props', () => {
    const { container } = render(<Skeleton data-testid="skel" />)
    expect((container.firstChild as HTMLElement).dataset.testid).toBe('skel')
  })
})
