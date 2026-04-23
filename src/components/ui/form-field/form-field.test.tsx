import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormControl, FormDescription, FormField, FormLabel, FormMessage } from './form-field'

describe('FormField', () => {
  it('renders children', () => {
    render(
      <FormField>
        <span>child</span>
      </FormField>,
    )
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('applies space-y-2 class', () => {
    const { container } = render(<FormField>x</FormField>)
    expect((container.firstChild as HTMLElement).className).toContain('space-y-2')
  })

  it('generates an id and threads it to FormLabel htmlFor and FormControl id', () => {
    render(
      <FormField>
        <FormLabel>My label</FormLabel>
        <FormControl>
          <input />
        </FormControl>
      </FormField>,
    )
    const label = screen.getByText('My label')
    const input = screen.getByRole('textbox')
    expect(label).toHaveAttribute('for', input.id)
    expect(input.id).toBeTruthy()
  })

  it('FormLabel renders with correct styling', () => {
    render(
      <FormField>
        <FormLabel>Label text</FormLabel>
      </FormField>,
    )
    const label = screen.getByText('Label text')
    expect(label.tagName).toBe('LABEL')
  })

  it('FormDescription renders with correct styling', () => {
    render(<FormDescription>hint text</FormDescription>)
    const el = screen.getByText('hint text')
    expect(el.tagName).toBe('P')
    expect(el.className).toContain('text-sm')
    expect(el.className).toContain('text-muted-foreground')
  })

  it('FormMessage renders with destructive styling', () => {
    render(<FormMessage>error text</FormMessage>)
    const el = screen.getByText('error text')
    expect(el.tagName).toBe('P')
    expect(el.className).toContain('text-sm')
    expect(el.className).toContain('text-destructive')
    expect(el.className).toContain('font-medium')
  })

  it('FormDescription renders null when no children', () => {
    const { container } = render(<FormDescription />)
    expect(container.firstChild).toBeNull()
  })

  it('FormMessage renders null when no children', () => {
    const { container } = render(<FormMessage />)
    expect(container.firstChild).toBeNull()
  })

  it('FormControl forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(
      <FormField>
        <FormControl>
          <input ref={ref} />
        </FormControl>
      </FormField>,
    )
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('useFormField throws when used outside FormField', () => {
    // Render FormLabel outside FormField — it calls useFormField which throws
    expect(() => {
      render(<FormLabel>Label</FormLabel>)
    }).toThrow('useFormField must be used within <FormField>')
  })
})
