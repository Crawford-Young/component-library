import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Kbd } from './kbd'

describe('Kbd', () => {
  it('renders single key from children', () => {
    render(<Kbd>⌘</Kbd>)
    expect(screen.getByText('⌘')).toBeInTheDocument()
  })

  it('renders a kbd element for single key', () => {
    const { container } = render(<Kbd>K</Kbd>)
    expect(container.querySelector('kbd')).toBeInTheDocument()
  })

  it('renders key combo from keys prop', () => {
    render(<Kbd keys={['⌘', 'K']} />)
    expect(screen.getByText('⌘')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders + separators between keys in a combo', () => {
    render(<Kbd keys={['⌘', 'Shift', 'K']} />)
    const separators = screen.getAllByText('+')
    expect(separators).toHaveLength(2)
  })

  it('renders each key in its own kbd element for combos', () => {
    const { container } = render(<Kbd keys={['A', 'B', 'C']} />)
    expect(container.querySelectorAll('kbd')).toHaveLength(3)
  })

  it('keys prop takes precedence over children', () => {
    render(<Kbd keys={['⌘', 'K']}>ignored</Kbd>)
    expect(screen.queryByText('ignored')).not.toBeInTheDocument()
    expect(screen.getByText('⌘')).toBeInTheDocument()
  })

  it('applies className to single key wrapper', () => {
    const { container } = render(<Kbd className="text-accent">X</Kbd>)
    expect((container.firstChild as HTMLElement).className).toContain('text-accent')
  })

  it('applies className to combo wrapper', () => {
    const { container } = render(<Kbd keys={['A', 'B']} className="text-accent" />)
    expect((container.firstChild as HTMLElement).className).toContain('text-accent')
  })

  it('applies muted and mono styling', () => {
    const { container } = render(<Kbd>A</Kbd>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('bg-muted')
    expect(el.className).toContain('font-mono')
  })
})
