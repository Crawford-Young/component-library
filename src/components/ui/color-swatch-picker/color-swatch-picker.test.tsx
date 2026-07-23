import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorSwatchPicker, EVENT_COLORS } from './color-swatch-picker'

describe('ColorSwatchPicker', () => {
  it('renders 15 swatch buttons in a group named "Color" by default', () => {
    render(<ColorSwatchPicker value="default" onChange={vi.fn()} />)
    expect(screen.getByRole('group', { name: 'Color' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(EVENT_COLORS.length)
    expect(EVENT_COLORS).toHaveLength(15)
  })

  it('marks aria-pressed true only on the button matching value', () => {
    render(<ColorSwatchPicker value="violet" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Color: violet')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Color: blue')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByLabelText('Color: default')).toHaveAttribute('aria-pressed', 'false')
  })

  it('fires onChange with the clicked color', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ColorSwatchPicker value="default" onChange={onChange} />)
    await user.click(screen.getByLabelText('Color: teal'))
    expect(onChange).toHaveBeenCalledWith('teal')
  })

  it('renders a custom group name via the label prop', () => {
    render(<ColorSwatchPicker value="default" onChange={vi.fn()} label="Event color" />)
    expect(screen.getByRole('group', { name: 'Event color' })).toBeInTheDocument()
  })

  it('swaps swatch size classes for size="sm"', () => {
    render(<ColorSwatchPicker value="default" onChange={vi.fn()} size="sm" />)
    expect(screen.getByLabelText('Color: default')).toHaveClass('h-5', 'w-5')
    expect(screen.getByLabelText('Color: default')).not.toHaveClass('h-6', 'w-6')
  })

  it('defaults to md swatch size classes', () => {
    render(<ColorSwatchPicker value="default" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Color: default')).toHaveClass('h-6', 'w-6')
  })

  it('merges a custom className onto the group container', () => {
    render(<ColorSwatchPicker value="default" onChange={vi.fn()} className="custom-class" />)
    expect(screen.getByRole('group', { name: 'Color' })).toHaveClass('custom-class')
  })

  it('gives every swatch an aria-label of "Color: <name>"', () => {
    render(<ColorSwatchPicker value="default" onChange={vi.fn()} />)
    for (const color of EVENT_COLORS) {
      expect(screen.getByLabelText(`Color: ${color}`)).toBeInTheDocument()
    }
  })

  it('renders every swatch as type="button"', () => {
    render(<ColorSwatchPicker value="default" onChange={vi.fn()} />)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('type', 'button')
    }
  })
})
