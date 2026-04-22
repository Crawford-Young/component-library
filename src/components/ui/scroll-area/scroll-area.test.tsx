import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScrollArea, ScrollBar } from './scroll-area'

describe('ScrollArea', () => {
  it('renders children', () => {
    render(
      <ScrollArea>
        <p>Scrollable content</p>
      </ScrollArea>,
    )
    expect(screen.getByText('Scrollable content')).toBeInTheDocument()
  })

  it('renders a viewport element', () => {
    const { container } = render(
      <ScrollArea>
        <p>content</p>
      </ScrollArea>,
    )
    // The viewport is always in the DOM regardless of scroll state
    const viewport = container.querySelector('[data-radix-scroll-area-viewport]')
    expect(viewport).toBeInTheDocument()
  })

  it('applies className to the root', () => {
    const { container } = render(
      <ScrollArea className="test-class">
        <p>content</p>
      </ScrollArea>,
    )
    expect(container.firstChild).toHaveClass('test-class')
  })

  it('forwards ref on ScrollArea', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <ScrollArea ref={ref}>
        <p>content</p>
      </ScrollArea>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has correct displayName', () => {
    expect(ScrollArea.displayName).toBeDefined()
    expect(ScrollBar.displayName).toBeDefined()
  })
})

describe('ScrollBar', () => {
  it('renders vertical scrollbar when type is always', () => {
    const { container } = render(
      // type="always" renders without Presence/visibility check
      <ScrollArea type="always">
        <ScrollBar orientation="vertical" />
      </ScrollArea>,
    )
    const scrollbar = container.querySelector('[data-orientation="vertical"]')
    expect(scrollbar).toBeInTheDocument()
  })

  it('renders horizontal scrollbar when type is always', () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    )
    const scrollbar = container.querySelector('[data-orientation="horizontal"]')
    expect(scrollbar).toBeInTheDocument()
  })

  it('applies className to scrollbar when type is always', () => {
    const { container } = render(
      <ScrollArea type="always">
        <ScrollBar className="test-scrollbar" />
      </ScrollArea>,
    )
    const scrollbar = container.querySelector('[data-orientation="vertical"]')
    expect(scrollbar).toHaveClass('test-scrollbar')
  })

  it('forwards ref on ScrollBar when type is always', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <ScrollArea type="always">
        <ScrollBar ref={ref} />
      </ScrollArea>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
