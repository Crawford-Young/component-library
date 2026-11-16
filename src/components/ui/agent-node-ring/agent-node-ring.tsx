import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { contextGaugeTone, type ContextGaugeTone } from '../context-gauge'
import { StatusDot } from '../status-dot'
import type { AgentNodeState } from '../agent-node-card'

export type AgentNodeRingSize = 'root' | 'default' | 'dense'

const DEFAULT_LABEL: Record<AgentNodeState, string> = {
  working: 'working',
  'needs-you': 'needs you',
  idle: 'idle',
  done: 'done',
}

export const agentNodeRingVariants = cva('relative focus-visible:ring-2 focus-visible:ring-ring', {
  variants: {
    size: {
      root: 'inline-flex flex-col items-center gap-2 text-center focus-visible:outline-none',
      default: 'inline-flex flex-col items-center gap-2 text-center focus-visible:outline-none',
      dense: 'inline-block size-3 shrink-0 rounded-full',
    },
  },
})

// Dense halo / selection live on the button itself; round nodes carry them on the disc.
const denseEmphasis = cva('', {
  variants: {
    state: {
      working: '',
      'needs-you': 'ring-2 ring-warning/50',
      idle: '',
      done: '',
    },
    selected: {
      true: 'outline outline-2 outline-offset-2 outline-accent',
      false: 'focus-visible:outline-none',
    },
  },
})

const discVariants = cva('relative flex shrink-0 items-center justify-center rounded-full', {
  variants: {
    size: { root: 'size-[120px]', default: 'size-24' },
    state: {
      working: '',
      'needs-you': 'outline outline-2 outline-offset-2 outline-warning',
      idle: '',
      done: '',
    },
    selected: { true: 'ring-2 ring-accent', false: '' },
  },
})

const stateTextVariants = cva('', {
  variants: {
    state: {
      working: 'text-foreground dark:text-success',
      'needs-you': 'text-foreground dark:text-warning',
      idle: 'text-muted-foreground',
      done: 'text-muted-foreground',
    },
  },
})

const TONE_STROKE: Record<ContextGaugeTone, string> = {
  ok: 'stroke-success',
  warn: 'stroke-warning',
  danger: 'stroke-destructive',
}

export interface AgentNodeRingProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'children' | 'name'
> {
  /** Role label, e.g. "implementer". */
  readonly name: React.ReactNode
  readonly state?: AgentNodeState
  /** Overrides the default state label ("working", "needs you", "idle", "done"). */
  readonly stateLabel?: React.ReactNode
  /** First part of the detail line, e.g. "strate#62". */
  readonly charge?: React.ReactNode
  /** Last part of the detail line, e.g. "$7.10". */
  readonly cost?: React.ReactNode
  /** Context used 0-100 (clamped; NaN -> 0). Without it the ring is a bare track. */
  readonly context?: number
  readonly nudgeAt?: number
  readonly hardStopAt?: number
  readonly size?: AgentNodeRingSize
  readonly selected?: boolean
}

const Separator = (): React.JSX.Element => <span aria-hidden="true">·</span>

export const AgentNodeRing = React.forwardRef<HTMLButtonElement, AgentNodeRingProps>(
  function AgentNodeRing(
    {
      name,
      state = 'working',
      stateLabel,
      charge,
      cost,
      context,
      nudgeAt,
      hardStopAt,
      size = 'default',
      selected = false,
      className,
      ...props
    },
    ref,
  ) {
    const label = stateLabel ?? DEFAULT_LABEL[state]
    const clamped =
      context === undefined || Number.isNaN(context) ? 0 : Math.min(100, Math.max(0, context))
    const percent = Math.round(clamped)
    const buttonProps = {
      ref,
      type: 'button' as const,
      'aria-pressed': selected,
      'data-size': size,
      'data-state': state,
      ...props,
    }

    if (size === 'dense') {
      return (
        <button
          {...buttonProps}
          className={cn(
            agentNodeRingVariants({ size }),
            denseEmphasis({ state, selected }),
            className,
          )}
        >
          <StatusDot data-slot="dot" state={state} className="size-full" />
          <span className="sr-only">
            {name}, {label}
            {context !== undefined && `, context ${percent}%`}
            {charge !== undefined && <>, {charge}</>}
            {cost !== undefined && <>, {cost}</>}
          </span>
        </button>
      )
    }

    const tone = contextGaugeTone(clamped, nudgeAt, hardStopAt)
    return (
      <button {...buttonProps} className={cn(agentNodeRingVariants({ size }), className)}>
        <span data-slot="ring" className={discVariants({ size, state, selected })}>
          <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full">
            <circle
              data-slot="ring-track"
              cx={50}
              cy={50}
              r={45}
              fill="none"
              strokeWidth={8}
              className="stroke-surface-raised"
            />
            {context !== undefined && (
              <circle
                data-slot="ring-fill"
                data-tone={tone}
                cx={50}
                cy={50}
                r={45}
                fill="none"
                strokeWidth={8}
                pathLength={100}
                strokeDasharray={`${clamped} 100`}
                transform="rotate(-90 50 50)"
                className={TONE_STROKE[tone]}
              />
            )}
          </svg>
          {context !== undefined && (
            <>
              <span
                role="meter"
                aria-hidden="true"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="absolute inset-0"
              />
              <span
                data-slot="value"
                className="relative font-mono text-xl font-semibold tabular-nums text-foreground"
              >
                {percent}%
              </span>
            </>
          )}
        </span>
        <span data-slot="name" className="text-[22px] font-semibold text-foreground">
          {name}
        </span>
        <span
          data-slot="detail"
          className="flex items-center justify-center gap-1.5 text-[18px] text-muted-foreground"
        >
          {charge !== undefined && (
            <>
              <span>{charge}</span>
              <Separator />
            </>
          )}
          <span data-slot="state" className={stateTextVariants({ state })}>
            {label}
          </span>
          {cost !== undefined && (
            <>
              <Separator />
              <span>{cost}</span>
            </>
          )}
        </span>
      </button>
    )
  },
)
