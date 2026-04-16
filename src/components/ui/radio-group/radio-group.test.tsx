import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { RadioGroup, RadioGroupItem } from './radio-group'

function TestRadioGroup() {
  return (
    <RadioGroup defaultValue="b">
      <RadioGroupItem value="a" aria-label="Option A" />
      <RadioGroupItem value="b" aria-label="Option B" />
      <RadioGroupItem value="c" aria-label="Option C" />
    </RadioGroup>
  )
}

describe('RadioGroup', () => {
  it('renders with radiogroup role', () => {
    render(<TestRadioGroup />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('renders radio items', () => {
    render(<TestRadioGroup />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('pre-selects defaultValue', () => {
    render(<TestRadioGroup />)
    expect(screen.getByLabelText('Option B')).toBeChecked()
  })

  it('changes selection on click', async () => {
    const user = userEvent.setup()
    render(<TestRadioGroup />)
    await user.click(screen.getByLabelText('Option A'))
    expect(screen.getByLabelText('Option A')).toBeChecked()
    expect(screen.getByLabelText('Option B')).not.toBeChecked()
  })

  it('forwards ref on RadioGroup', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<RadioGroup ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('RadioGroupItem', () => {
  it('renders with radio role', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is passed', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" disabled />
      </RadioGroup>,
    )
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  it('applies border class', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radio').className).toContain('border')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" ref={ref} />
      </RadioGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('has correct displayName', () => {
    expect(RadioGroupItem.displayName).toBeDefined()
  })
})
