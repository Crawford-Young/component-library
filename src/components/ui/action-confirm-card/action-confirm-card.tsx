'use client'
import * as React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActionConfirmCardProps {
  readonly action: string
  readonly entityType: 'habit' | 'goal' | 'event' | 'activity'
  readonly date?: string
  readonly time?: string
  readonly detail?: string
  readonly onConfirm: () => void
  readonly onDeny: (reason: string) => void
}

type CardState = 'pending' | 'denying' | 'confirmed' | 'denied'

export function ActionConfirmCard({
  action,
  entityType,
  date,
  time,
  detail,
  onConfirm,
  onDeny,
}: ActionConfirmCardProps): React.JSX.Element {
  const [state, setState] = React.useState<CardState>('pending')
  const [reason, setReason] = React.useState('')

  function handleConfirm(): void {
    setState('confirmed')
    onConfirm()
  }

  function handleDenyClick(): void {
    setState('denying')
  }

  function handleCancel(): void {
    setState('pending')
    setReason('')
  }

  function handleSend(): void {
    setState('denied')
    onDeny(reason)
  }

  const dateTime = [date, time].filter(Boolean).join(' · ')

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-card-foreground">{action}</p>
          {dateTime && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {dateTime}
              <span
                className={cn(
                  'ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                  entityType === 'habit' && 'bg-blue-500/10 text-blue-500',
                  entityType === 'goal' && 'bg-purple-500/10 text-purple-500',
                  entityType === 'event' && 'bg-green-500/10 text-green-500',
                  entityType === 'activity' && 'bg-amber-500/10 text-amber-500',
                )}
              >
                {entityType}
              </span>
            </p>
          )}
          {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
        </div>

        {state === 'pending' || state === 'denying' ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Confirm"
              onClick={handleConfirm}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500 transition-colors hover:bg-green-500/20"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Deny"
              onClick={handleDenyClick}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : state === 'confirmed' ? (
          <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
            Confirmed
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
            Declined
          </span>
        )}
      </div>

      {state === 'denying' && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why not? (optional)"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              aria-label="Cancel"
              onClick={handleCancel}
              className="rounded-md px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              aria-label="Send"
              onClick={handleSend}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
