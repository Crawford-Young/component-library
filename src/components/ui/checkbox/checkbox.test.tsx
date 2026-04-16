import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders with checkbox role', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('is unchecked by default', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('can be checked', async () => {
    const user = userEvent.setup()
    render(<Checkbox />)
    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Checkbox onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<Checkbox disabled onCheckedChange={onCheckedChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('renders with indeterminate state', () => {
    render(<Checkbox checked="indeterminate" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
  })

  it('merges custom className', () => {
    render(<Checkbox className="my-class" />)
    expect(screen.getByRole('checkbox').className).toContain('my-class')
  })

  it('applies border class', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox').className).toContain('border')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Checkbox ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('has correct displayName', () => {
    expect(Checkbox.displayName).toBeDefined()
  })
})
