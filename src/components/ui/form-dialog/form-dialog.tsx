'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Ctx handed to the `footer` slot — versioned API per Extension conventions. */
export interface FormDialogFooterContext {
  readonly formId: string
  readonly isPending: boolean
  readonly close: () => void
}

export interface FormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  readonly title: React.ReactNode
  readonly description?: React.ReactNode
  readonly isPending?: boolean
  readonly submitDisabled?: boolean
  readonly submitLabel?: React.ReactNode
  readonly pendingLabel?: React.ReactNode
  readonly footer?: (ctx: FormDialogFooterContext) => React.ReactNode
  readonly size?: DialogContentProps['size']
  readonly className?: string
  readonly children: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  isPending = false,
  submitDisabled = false,
  submitLabel = 'Save',
  pendingLabel = 'Saving…',
  footer,
  size = 'default',
  className,
  children,
}: FormDialogProps): React.JSX.Element {
  const formId = React.useId()
  const close = React.useCallback((): void => onOpenChange(false), [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size={size}
        className={cn('flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0', className)}
      >
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          {description !== undefined && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          id={formId}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4"
        >
          {children}
        </form>

        <DialogFooter className="border-t border-border px-6 py-4">
          {footer ? (
            footer({ formId, isPending, close })
          ) : (
            <>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" form={formId} disabled={submitDisabled || isPending}>
                {isPending ? pendingLabel : submitLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

FormDialog.displayName = 'FormDialog'
