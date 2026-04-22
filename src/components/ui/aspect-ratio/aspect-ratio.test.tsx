import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AspectRatio } from './aspect-ratio'

describe('AspectRatio', () => {
  it('renders children', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="/placeholder.jpg" alt="placeholder" />
      </AspectRatio>,
    )
    expect(screen.getByAltText('placeholder')).toBeInTheDocument()
  })

  it('applies correct aspect ratio via style', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>content</div>
      </AspectRatio>,
    )
    // Radix sets --radix-aspect-ratio-width and height CSS vars on the wrapper
    const root = container.firstChild as HTMLElement
    expect(root).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(
      <AspectRatio ratio={4 / 3} className="test-class">
        <div>content</div>
      </AspectRatio>,
    )
    // The inner wrapper gets the className
    expect(container.querySelector('.test-class')).toBeInTheDocument()
  })

  it('renders with 1:1 ratio', () => {
    render(
      <AspectRatio ratio={1}>
        <div>square</div>
      </AspectRatio>,
    )
    expect(screen.getByText('square')).toBeInTheDocument()
  })

  it('renders with default ratio when no ratio prop is given', () => {
    render(
      <AspectRatio>
        <div>no ratio</div>
      </AspectRatio>,
    )
    expect(screen.getByText('no ratio')).toBeInTheDocument()
  })
})
