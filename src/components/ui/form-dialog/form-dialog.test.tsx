import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormDialog } from './form-dialog'
import type { FormDialogFooterContext, FormDialogProps } from './form-dialog'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeProps(overrides: Partial<FormDialogProps> = {}): FormDialogProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    title: 'My form',
    description: 'A description of the form.',
    children: <input aria-label="Field" />,
    ...overrides,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Title / description / children
// ═══════════════════════════════════════════════════════════════════════════════

describe('title, description, children', () => {
  it('renders the title inside an open dialog', () => {
    render(<FormDialog {...makeProps()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'My form' })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<FormDialog {...makeProps()} />)
    expect(screen.getByText('A description of the form.')).toBeInTheDocument()
  })

  it('omits the description node when description is not provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<FormDialog {...makeProps({ description: undefined })} />)
    expect(screen.queryByText('A description of the form.')).not.toBeInTheDocument()
    warnSpy.mockRestore()
  })

  it('renders children inside a form element', () => {
    render(<FormDialog {...makeProps()} />)
    const field = screen.getByRole('textbox', { name: 'Field' })
    expect(field.closest('form')).not.toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Default footer — submit / cancel / pending / submitDisabled / submitLabel
// ═══════════════════════════════════════════════════════════════════════════════

describe('default footer', () => {
  it('submits via the footer Save button, which targets the form by id', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    const user = userEvent.setup()
    render(<FormDialog {...makeProps({ onSubmit })} />)
    const save = screen.getByRole('button', { name: 'Save' })
    const form = screen.getByRole('textbox', { name: 'Field' }).closest('form')
    expect(save.getAttribute('form')).toBe(form?.getAttribute('id'))
    await user.click(save)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('fires onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<FormDialog {...makeProps({ onOpenChange })} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows the pending label and disables Save when isPending', () => {
    render(<FormDialog {...makeProps({ isPending: true })} />)
    const save = screen.getByRole('button', { name: 'Saving…' })
    expect(save).toBeDisabled()
  })

  it('disables Save via submitDisabled independent of isPending', () => {
    render(<FormDialog {...makeProps({ submitDisabled: true })} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('renders a custom submitLabel', () => {
    render(<FormDialog {...makeProps({ submitLabel: 'Create' })} />)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('renders a custom pendingLabel while pending', () => {
    render(<FormDialog {...makeProps({ isPending: true, pendingLabel: 'Creating…' })} />)
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// footer render-prop — replaces default footer, receives ctx
// ═══════════════════════════════════════════════════════════════════════════════

describe('footer render-prop', () => {
  it('replaces the default footer entirely', () => {
    render(<FormDialog {...makeProps({ footer: () => <button type="button">Custom</button> })} />)
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
  })

  it('receives ctx with formId matching the form element id, isPending, and a working close()', async () => {
    const onOpenChange = vi.fn()
    let receivedCtx: FormDialogFooterContext | undefined
    const user = userEvent.setup()
    render(
      <FormDialog
        {...makeProps({
          onOpenChange,
          isPending: true,
          footer: (ctx) => {
            receivedCtx = ctx
            return (
              <button type="button" onClick={ctx.close}>
                Close via ctx
              </button>
            )
          },
        })}
      />,
    )
    const form = screen.getByRole('textbox', { name: 'Field' }).closest('form')
    expect(receivedCtx?.formId).toBe(form?.getAttribute('id'))
    expect(receivedCtx?.isPending).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Close via ctx' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// size / className passthrough to DialogContent
// ═══════════════════════════════════════════════════════════════════════════════

describe('size / className passthrough', () => {
  it('applies the size variant to DialogContent', () => {
    render(<FormDialog {...makeProps({ size: 'lg' })} />)
    expect(screen.getByRole('dialog').className).toContain('max-w-2xl')
  })

  it('merges a custom className onto DialogContent', () => {
    render(<FormDialog {...makeProps({ className: 'custom-form-dialog' })} />)
    expect(screen.getByRole('dialog').className).toContain('custom-form-dialog')
  })

  it('does not render the dialog when open=false', () => {
    render(<FormDialog {...makeProps({ open: false })} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// displayName
// ═══════════════════════════════════════════════════════════════════════════════

describe('displayName', () => {
  it('has the correct displayName', () => {
    expect(FormDialog.displayName).toBe('FormDialog')
  })
})
