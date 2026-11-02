import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ContextGauge } from '../context-gauge'
import { Badge } from '../badge'
import { StatusDot, type StatusDotState } from '../status-dot'

export type AgentNodeState = StatusDotState

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
  /** Short lane label (e.g. "subagent"); shares the meta row with `charge`. */
  readonly lane?: React.ReactNode
  /** Charge slot beside the lane, usually an `AgentNodeCharge`. Inline content only: the card is a button. */
  readonly charge?: React.ReactNode
  /** Cost shown just before the state label, e.g. "$1.23". */
  readonly cost?: React.ReactNode
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
      lane,
      charge,
      cost,
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
          <StatusDot data-slot="dot" state={state} className={cn(dimmed && 'opacity-50')} />
          <span
            className={cn(
              'min-w-0 truncate text-xs font-medium',
              dimmed ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {name}
          </span>
          <span className={cn(stateTextVariants({ state }), dimmed && 'text-muted-foreground')}>
            {cost !== undefined && (
              <>
                <span
                  data-slot="cost"
                  className="mr-1 font-normal tabular-nums text-muted-foreground"
                >
                  {cost}
                </span>{' '}
              </>
            )}
            {stateLabel ?? DEFAULT_LABEL[state]}
          </span>
        </span>
        {detail !== undefined && (
          <span data-slot="detail" className="truncate text-[11px] text-muted-foreground">
            {detail}
          </span>
        )}
        {(lane !== undefined || charge !== undefined) && (
          <span
            data-slot="meta"
            className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            {lane !== undefined && <span className="shrink-0">{lane}</span>}
            {charge}
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

export interface AgentNodeChargeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** What the agent is charged to; null renders "unlinked". */
  readonly chargeKey: string | null
  /** Where the charge came from (e.g. "branch name"); spoken and shown on hover. */
  readonly source?: string
}

/**
 * Inline charge chip for `AgentNodeCard`'s `charge` slot (a span, so valid inside the card's button).
 * The source is real sr-only text, so it is part of the card's accessible name and read when the
 * card takes focus; `title` only adds the hover tooltip.
 */
export function AgentNodeCharge({ chargeKey, source, className, ...props }: AgentNodeChargeProps) {
  const spoken = chargeKey === null ? 'no charge' : source ? `charge from ${source}` : 'charge'
  return (
    <Badge asChild variant="outline" className={cn('min-w-0 max-w-full font-mono', className)}>
      <span data-slot="charge" title={spoken} {...props}>
        <span className="min-w-0 truncate">{chargeKey ?? 'unlinked'}</span>
        <span className="sr-only">, {spoken}</span>
      </span>
    </Badge>
  )
}
