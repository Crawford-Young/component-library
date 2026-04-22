import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Slider } from './slider'

describe('Slider', () => {
  it('renders a slider element', () => {
    render(<Slider defaultValue={[50]} aria-label="Volume" />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('renders a single thumb for single value', () => {
    render(<Slider defaultValue={[50]} aria-label="Volume" />)
    expect(screen.getAllByRole('slider')).toHaveLength(1)
  })

  it('renders two thumbs for range value', () => {
    render(<Slider defaultValue={[20, 80]} aria-label="Price range" />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  it('thumb has correct initial aria-valuenow', () => {
    render(<Slider defaultValue={[42]} aria-label="Volume" />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42')
  })

  it('applies sm size class', () => {
    const { container } = render(<Slider defaultValue={[50]} size="sm" aria-label="Volume" />)
    // The root element should contain the size-specific class
    expect(container.firstChild).toHaveClass('h-1')
  })

  it('applies default size class', () => {
    const { container } = render(<Slider defaultValue={[50]} aria-label="Volume" />)
    expect(container.firstChild).toHaveClass('h-1.5')
  })

  it('applies lg size class', () => {
    const { container } = render(<Slider defaultValue={[50]} size="lg" aria-label="Volume" />)
    expect(container.firstChild).toHaveClass('h-2')
  })

  it('calls onValueChange when value changes via keyboard', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Slider defaultValue={[50]} aria-label="Volume" onValueChange={onValueChange} />)
    const thumb = screen.getByRole('slider')
    thumb.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalled()
  })

  it('increments value with ArrowRight key', async () => {
    const user = userEvent.setup()
    render(<Slider defaultValue={[50]} aria-label="Volume" />)
    const thumb = screen.getByRole('slider')
    thumb.focus()
    await user.keyboard('{ArrowRight}')
    // default step is 1; 50 + 1 = 51
    expect(thumb).toHaveAttribute('aria-valuenow', '51')
  })

  it('decrements value with ArrowLeft key', async () => {
    const user = userEvent.setup()
    render(<Slider defaultValue={[50]} aria-label="Volume" />)
    const thumb = screen.getByRole('slider')
    thumb.focus()
    await user.keyboard('{ArrowLeft}')
    expect(thumb).toHaveAttribute('aria-valuenow', '49')
  })

  it('respects min and max props', () => {
    render(<Slider defaultValue={[5]} min={0} max={10} aria-label="Rating" />)
    const thumb = screen.getByRole('slider')
    expect(thumb).toHaveAttribute('aria-valuemin', '0')
    expect(thumb).toHaveAttribute('aria-valuemax', '10')
  })

  it('applies className', () => {
    const { container } = render(
      <Slider defaultValue={[50]} aria-label="Volume" className="test-slider" />,
    )
    expect(container.firstChild).toHaveClass('test-slider')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Slider ref={ref} defaultValue={[50]} aria-label="Volume" />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('has correct displayName', () => {
    expect(Slider.displayName).toBeDefined()
  })

  it('is disabled when disabled prop is set', () => {
    const { container } = render(<Slider defaultValue={[50]} aria-label="Volume" disabled />)
    // Radix Slider sets data-disabled on the root span when disabled
    expect(container.firstChild).toHaveAttribute('data-disabled')
  })

  it('renders with no value or defaultValue (uses fallback [0])', () => {
    render(<Slider aria-label="Volume" />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0')
  })
})
