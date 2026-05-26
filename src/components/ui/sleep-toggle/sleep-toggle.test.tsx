import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SleepToggle } from './sleep-toggle'

describe('SleepToggle', () => {
  it('renders a switch with aria-label "Sleep mode"', () => {
    render(<SleepToggle enabled={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('switch', { name: 'Sleep mode' })).toBeInTheDocument()
  })

  it('switch is unchecked when enabled=false', () => {
    render(<SleepToggle enabled={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('switch is checked when enabled=true', () => {
    render(<SleepToggle enabled={true} onToggle={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('calls onToggle with true when switching on', async () => {
    const handler = vi.fn()
    render(<SleepToggle enabled={false} onToggle={handler} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('calls onToggle with false when switching off', async () => {
    const handler = vi.fn()
    render(<SleepToggle enabled={true} onToggle={handler} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('renders "Sleep mode" label text', () => {
    render(<SleepToggle enabled={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Sleep mode')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <SleepToggle enabled={false} onToggle={vi.fn()} className="test-cls" />,
    )
    expect((container.firstChild as HTMLElement).className).toContain('test-cls')
  })
})
