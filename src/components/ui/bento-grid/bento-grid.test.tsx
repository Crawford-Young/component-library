import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BentoCell, BentoGrid } from './bento-grid'

describe('BentoGrid', () => {
  it('renders children', () => {
    render(
      <BentoGrid>
        <div>child</div>
      </BentoGrid>,
    )
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('applies grid classes', () => {
    const { container } = render(
      <BentoGrid>
        <div />
      </BentoGrid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('grid')
    expect(el.className).toContain('gap-4')
  })

  it('merges custom className', () => {
    const { container } = render(
      <BentoGrid className="custom">
        <div />
      </BentoGrid>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })

  it('forwards ref to the underlying div', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <BentoGrid ref={ref}>
        <div />
      </BentoGrid>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('BentoCell', () => {
  it('renders children', () => {
    render(
      <BentoCell>
        <span>content</span>
      </BentoCell>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('default span applies no extra col-span class', () => {
    const { container } = render(
      <BentoCell>
        <div />
      </BentoCell>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).not.toContain('col-span-2')
    expect(el.className).not.toContain('col-span-full')
  })

  it('wide span applies md:col-span-2', () => {
    const { container } = render(
      <BentoCell span="wide">
        <div />
      </BentoCell>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('md:col-span-2')
  })

  it('full span applies col-span-full', () => {
    const { container } = render(
      <BentoCell span="full">
        <div />
      </BentoCell>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('col-span-full')
  })

  it('forwards id prop', () => {
    const { container } = render(
      <BentoCell id="cell-1">
        <div />
      </BentoCell>,
    )
    expect((container.firstChild as HTMLElement).id).toBe('cell-1')
  })

  it('merges custom className', () => {
    const { container } = render(
      <BentoCell className="custom">
        <div />
      </BentoCell>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })

  it('forwards ref to the underlying div', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <BentoCell ref={ref}>
        <div />
      </BentoCell>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
