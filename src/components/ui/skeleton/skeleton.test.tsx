import * as React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './skeleton'

const el = (ui: React.ReactElement) => render(ui).container.firstChild as HTMLElement

describe('Skeleton', () => {
  it('renders a div', () => {
    expect(el(<Skeleton />)).toBeInTheDocument()
  })

  it('defaults to the shimmer variant', () => {
    const node = el(<Skeleton />)
    expect(node.className).toContain('after:animate-shimmer')
    expect(node.className).toContain('bg-surface')
    expect(node.className).toContain('overflow-hidden')
    expect(node.className).not.toContain('animate-pulse')
  })

  it('hides the shimmer sweep under reduced motion', () => {
    expect(el(<Skeleton />).className).toContain('motion-reduce:after:hidden')
  })

  it('supports the legacy pulse variant', () => {
    const node = el(<Skeleton variant="pulse" />)
    expect(node.className).toContain('animate-pulse')
    expect(node.className).toContain('bg-muted')
    expect(node.className).not.toContain('after:animate-shimmer')
  })

  it('keeps the rounded base in both variants', () => {
    expect(el(<Skeleton />).className).toContain('rounded')
    expect(el(<Skeleton variant="pulse" />).className).toContain('rounded')
  })

  it('merges custom className', () => {
    const node = el(<Skeleton className="h-4 w-32" />)
    expect(node.className).toContain('h-4')
    expect(node.className).toContain('w-32')
  })

  it('forwards extra props', () => {
    expect(el(<Skeleton data-testid="skel" />).dataset.testid).toBe('skel')
  })
})
