import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    await user.type(screen.getByRole('textbox'), 'Hello world')
    expect(screen.getByRole('textbox')).toHaveValue('Hello world')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders placeholder text', () => {
    render(<Textarea placeholder="Write something..." />)
    expect(screen.getByPlaceholderText('Write something...')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('merges custom className', () => {
    render(<Textarea className="custom-class" />)
    expect(screen.getByRole('textbox').className).toContain('custom-class')
  })
})
