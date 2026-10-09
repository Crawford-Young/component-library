import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ContextGauge } from '../context-gauge'

export type AgentNodeState = 'working' | 'needs-you' | 'idle' | 'done'

const DEFAULT_LABEL: Record<AgentNodeState, string> = {
  working: 'working',
  'needs-you': 'needs you',
  idle: 'idle',
  done: 'done',
}

const cardVariants = cva(
  'flex flex-col gap-1 rounded-lg border border-border bg-surface px-2.5 py-2 text-left transition-colors hover:bg-item-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      selected: { true: 'ring-2 ring-accent', false: '' },
      dimmed: {
        true: 'border-border-subtle [&_[role=meter]>span]:opacity-60',
        false: '',
      },
    },
    defaultVariants: { selected: false, dimmed: false },
  },
)

const dotVariants = cva('size-2 shrink-0 rounded-full', {
  variants: {
    state: {
      working: 'bg-success',
      'needs-you': 'bg-warning',
      idle: 'bg-muted-foreground',
      done: 'bg-muted-foreground opacity-60',
    },
  },
})

const stateTextVariants = cva('ml-auto shrink-0 text-[10.5px] font-medium', {
  variants: {
    state: {
      working: 'text-success',
      'needs-you': 'text-warning',
      idle: 'text-muted-foreground',
      done: 'text-muted-foreground',
    },
  },
})

export interface AgentNodeCardProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'children' | 'name'
> {
  readonly name: React.ReactNode
  readonly state?: AgentNodeState
  /** Overrides the default state label ("working", "needs you", "idle", "done"). */
  readonly stateLabel?: React.ReactNode
  /** One line, truncated with an ellipsis. */
  readonly detail?: React.ReactNode
  /** Context used 0-100; the gauge row is omitted when undefined. */
  readonly context?: number
  /** Shown after the gauge, e.g. "62%". */
  readonly contextLabel?: React.ReactNode
  readonly nudgeAt?: number
  readonly hardStopAt?: number
  readonly selected?: boolean
  readonly dimmed?: boolean
}

export const AgentNodeCard = React.forwardRef<HTMLButtonElement, AgentNodeCardProps>(
  function AgentNodeCard(
    {
      name,
      state = 'working',
      stateLabel,
      detail,
      context,
      contextLabel,
      nudgeAt,
      hardStopAt,
      selected = false,
      dimmed = false,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        className={cn(cardVariants({ selected, dimmed }), className)}
        {...props}
      >
        <span className="flex items-center gap-1.5">
          <span
            data-slot="dot"
            aria-hidden="true"
            className={cn(dotVariants({ state }), dimmed && 'opacity-50')}
          />
          <span
            className={cn(
              'min-w-0 truncate text-xs font-medium',
              dimmed ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {name}
          </span>
          <span className={cn(stateTextVariants({ state }), dimmed && 'text-muted-foreground')}>
            {stateLabel ?? DEFAULT_LABEL[state]}
          </span>
        </span>
        {detail !== undefined && (
          <span data-slot="detail" className="truncate text-[11px] text-muted-foreground">
            {detail}
          </span>
        )}
        {context !== undefined && (
          <ContextGauge
            value={context}
            label={contextLabel}
            nudgeAt={nudgeAt}
            hardStopAt={hardStopAt}
          />
        )}
      </button>
    )
  },
)
