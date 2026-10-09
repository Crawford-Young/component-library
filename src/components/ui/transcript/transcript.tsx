import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

/*
 * Tone text mixes the feedback token 60/40 with --foreground: the raw tokens
 * are tuned for fills and fall below 4.5:1 as small text (destructive on the
 * dark background is ~4.1:1, warning on white ~2.1:1). Mixing toward the
 * foreground lightens in dark mode and darkens in light mode, so one class
 * clears AA in both.
 */
const toneText = {
  success: 'text-[color:color-mix(in_srgb,rgb(var(--success))_60%,rgb(var(--foreground)))]',
  warning: 'text-[color:color-mix(in_srgb,rgb(var(--warning))_60%,rgb(var(--foreground)))]',
  error: 'text-[color:color-mix(in_srgb,rgb(var(--destructive))_60%,rgb(var(--foreground)))]',
  info: 'text-[color:color-mix(in_srgb,rgb(var(--info))_60%,rgb(var(--foreground)))]',
} as const

const focusRing =
  'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

interface TimestampSlot {
  /** Rendered right-aligned on the part's first line, e.g. `<time dateTime=…>14:02:11</time>`. */
  readonly timestamp?: React.ReactNode
}

interface CollapsibleState {
  readonly open?: boolean
  readonly defaultOpen?: boolean
  readonly onOpenChange?: (open: boolean) => void
}

type ItemProps = Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> & TimestampSlot

function Timestamp({ children }: { readonly children: React.ReactNode }) {
  if (children == null) return null
  return (
    <span className="ml-auto shrink-0 pl-2 text-[11px] tabular-nums text-muted-foreground">
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ root */

export type TranscriptProps = React.OlHTMLAttributes<HTMLOListElement>

export const Transcript = React.forwardRef<HTMLOListElement, TranscriptProps>(
  ({ className, 'aria-label': ariaLabel = 'Agent transcript', ...props }, ref) => (
    <ol
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        'm-0 flex list-none flex-col gap-2.5 p-0 font-mono text-[12.5px] leading-[1.55] text-foreground',
        className,
      )}
      {...props}
    />
  ),
)
Transcript.displayName = 'Transcript'

/* ------------------------------------------------------------- user turn */

export type TranscriptUserTurnProps = ItemProps

export const TranscriptUserTurn = React.forwardRef<HTMLLIElement, TranscriptUserTurnProps>(
  ({ className, timestamp, children, ...props }, ref) => (
    <li ref={ref} className={className} {...props}>
      <div className="flex items-start gap-2 rounded-sm bg-surface px-2.5 py-1.5 text-foreground">
        <span aria-hidden="true" className="text-muted-foreground">
          &gt;
        </span>
        <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
          <span className="sr-only">User: </span>
          {children}
        </div>
        <Timestamp>{timestamp}</Timestamp>
      </div>
    </li>
  ),
)
TranscriptUserTurn.displayName = 'TranscriptUserTurn'

/* -------------------------------------------------------- assistant text */

export type TranscriptTextProps = ItemProps

export const TranscriptText = React.forwardRef<HTMLLIElement, TranscriptTextProps>(
  ({ className, timestamp, children, ...props }, ref) => (
    <li ref={ref} className={cn('flex items-start gap-2 pl-0.5', className)} {...props}>
      <div className="min-w-0 flex-1 text-foreground [overflow-wrap:anywhere]">{children}</div>
      <Timestamp>{timestamp}</Timestamp>
    </li>
  ),
)
TranscriptText.displayName = 'TranscriptText'

/* ------------------------------------------------------------------ note */

export const transcriptNoteVariants = cva('min-w-0 flex-1 [overflow-wrap:anywhere]', {
  variants: {
    tone: {
      default: 'text-muted-foreground',
      ...toneText,
    },
  },
  defaultVariants: { tone: 'default' },
})

export type TranscriptNoteTone = NonNullable<VariantProps<typeof transcriptNoteVariants>['tone']>

export interface TranscriptNoteProps extends ItemProps {
  readonly tone?: TranscriptNoteTone
}

export const TranscriptNote = React.forwardRef<HTMLLIElement, TranscriptNoteProps>(
  ({ className, timestamp, tone = 'default', children, ...props }, ref) => (
    <li
      ref={ref}
      data-tone={tone}
      className={cn('flex items-start gap-2 pl-0.5', className)}
      {...props}
    >
      <div className={transcriptNoteVariants({ tone })}>
        <span aria-hidden="true">⎿</span> <span>{children}</span>
      </div>
      <Timestamp>{timestamp}</Timestamp>
    </li>
  ),
)
TranscriptNote.displayName = 'TranscriptNote'

/* -------------------------------------------------------------- thinking */

export interface TranscriptThinkingProps extends ItemProps, CollapsibleState {
  /** Trigger text after the ✻ glyph. Defaults to "Thinking…". */
  readonly label?: React.ReactNode
}

export const TranscriptThinking = React.forwardRef<HTMLLIElement, TranscriptThinkingProps>(
  (
    {
      className,
      timestamp,
      label = 'Thinking…',
      open,
      defaultOpen,
      onOpenChange,
      children,
      ...props
    },
    ref,
  ) => (
    <Collapsible asChild open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <li ref={ref} className={className} {...props}>
        <div className="flex items-start gap-2">
          <CollapsibleTrigger
            className={cn(
              'text-left italic text-muted-foreground hover:text-foreground',
              focusRing,
            )}
          >
            <span aria-hidden="true">✻</span> {label}
          </CollapsibleTrigger>
          <Timestamp>{timestamp}</Timestamp>
        </div>
        <CollapsibleContent>
          <div className="ml-4 mt-0.5 italic text-muted-foreground [overflow-wrap:anywhere]">
            {children}
          </div>
        </CollapsibleContent>
      </li>
    </Collapsible>
  ),
)
TranscriptThinking.displayName = 'TranscriptThinking'

/* ------------------------------------------------------------- tool call */

export const transcriptToolStatusVariants = cva('mt-[0.45em] size-2 shrink-0 rounded-full', {
  variants: {
    status: {
      pending: 'bg-muted-foreground',
      running: 'bg-muted-foreground motion-safe:animate-pulse',
      waiting: 'bg-warning',
      success: 'bg-success',
      error: 'bg-destructive',
    },
  },
  defaultVariants: { status: 'running' },
})

export type TranscriptToolStatus = NonNullable<
  VariantProps<typeof transcriptToolStatusVariants>['status']
>

const toolStatusLabel: Record<TranscriptToolStatus, string> = {
  pending: 'Pending:',
  running: 'Running:',
  waiting: 'Waiting:',
  success: 'Done:',
  error: 'Failed:',
}

export interface TranscriptToolCallProps extends ItemProps, CollapsibleState {
  /** The `Tool(args)` line. */
  readonly head: React.ReactNode
  readonly status?: TranscriptToolStatus
  /** Screen-reader text standing in for the coloured dot. Defaults per status, e.g. "Failed:". */
  readonly statusLabel?: React.ReactNode
  /** Line shown under the head while `status="waiting"`. */
  readonly waitingLabel?: React.ReactNode
  /** `⎿` line under the head; the trigger for `result` when one is given. */
  readonly resultSummary?: React.ReactNode
  /** Full result body, collapsed by default behind `resultSummary`. */
  readonly result?: React.ReactNode
}

export const TranscriptToolCall = React.forwardRef<HTMLLIElement, TranscriptToolCallProps>(
  (
    {
      className,
      timestamp,
      head,
      status = 'running',
      statusLabel = toolStatusLabel[status],
      waitingLabel = 'Waiting for permission…',
      resultSummary,
      result,
      open,
      defaultOpen,
      onOpenChange,
      ...props
    },
    ref,
  ) => (
    <Collapsible asChild open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <li ref={ref} data-status={status} className={cn('flex flex-col', className)} {...props}>
        <div className="flex items-start gap-2">
          <span
            data-slot="status-dot"
            aria-hidden="true"
            className={transcriptToolStatusVariants({ status })}
          />
          <div className="min-w-0 flex-1 text-foreground [overflow-wrap:anywhere]">
            <span className="sr-only">{statusLabel} </span>
            {head}
          </div>
          <Timestamp>{timestamp}</Timestamp>
        </div>
        {status === 'waiting' && (
          <div className={cn('pl-4', toneText.warning)}>
            <span aria-hidden="true">⎿</span> <span>{waitingLabel}</span>
          </div>
        )}
        {result != null ? (
          <>
            <CollapsibleTrigger
              className={cn(
                'ml-4 self-start text-left text-muted-foreground hover:text-foreground',
                focusRing,
              )}
            >
              <span aria-hidden="true">⎿</span> {resultSummary ?? 'Show result'}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-4 mt-0.5 whitespace-pre-wrap border-l-2 border-border px-2.5 py-1.5 text-muted-foreground [overflow-wrap:anywhere]">
                {result}
              </div>
            </CollapsibleContent>
          </>
        ) : (
          resultSummary != null && (
            <div className="pl-4 text-muted-foreground">
              <span aria-hidden="true">⎿</span> <span>{resultSummary}</span>
            </div>
          )
        )}
      </li>
    </Collapsible>
  ),
)
TranscriptToolCall.displayName = 'TranscriptToolCall'

/* ----------------------------------------------------------------- todos */

export interface TranscriptTodosProps extends ItemProps {
  /** Box heading. Defaults to "Todos". */
  readonly title?: React.ReactNode
}

export const TranscriptTodos = React.forwardRef<HTMLLIElement, TranscriptTodosProps>(
  ({ className, timestamp, title = 'Todos', children, ...props }, ref) => (
    <li ref={ref} className={className} {...props}>
      <div className="flex flex-col gap-0.5 rounded-sm border border-border px-2.5 py-2">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-foreground">{title}</span>
          <Timestamp>{timestamp}</Timestamp>
        </div>
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{children}</ul>
      </div>
    </li>
  ),
)
TranscriptTodos.displayName = 'TranscriptTodos'

export type TranscriptTodoStatus = 'pending' | 'in_progress' | 'completed'

const todoStatus: Record<
  TranscriptTodoStatus,
  { readonly box: string; readonly label: string; readonly className: string }
> = {
  pending: { box: '☐', label: 'Pending:', className: 'text-muted-foreground' },
  in_progress: { box: '◼', label: 'In progress:', className: 'font-semibold text-foreground' },
  completed: { box: '☒', label: 'Completed:', className: 'text-muted-foreground' },
}

export interface TranscriptTodoProps extends React.LiHTMLAttributes<HTMLLIElement> {
  readonly status?: TranscriptTodoStatus
}

export const TranscriptTodo = React.forwardRef<HTMLLIElement, TranscriptTodoProps>(
  ({ className, status = 'pending', children, ...props }, ref) => {
    const { box, label, className: statusClass } = todoStatus[status]
    return (
      <li
        ref={ref}
        data-status={status}
        className={cn('flex items-start gap-2', statusClass, className)}
        {...props}
      >
        <span aria-hidden="true">{box}</span>
        <span className="sr-only">{label} </span>
        <span
          className={cn(
            'min-w-0 flex-1 [overflow-wrap:anywhere]',
            status === 'completed' && 'line-through',
          )}
        >
          {children}
        </span>
      </li>
    )
  },
)
TranscriptTodo.displayName = 'TranscriptTodo'

/* ------------------------------------------------------- permission */

export interface TranscriptPermissionProps extends ItemProps {
  /** Prompt heading. Defaults to "Do you want to run this?". */
  readonly question?: React.ReactNode
  /** The command or action awaiting approval. */
  readonly command?: React.ReactNode
}

export const TranscriptPermission = React.forwardRef<HTMLLIElement, TranscriptPermissionProps>(
  (
    { className, timestamp, question = 'Do you want to run this?', command, children, ...props },
    ref,
  ) => (
    <li ref={ref} className={className} {...props}>
      <div
        role="alert"
        className="flex flex-col gap-2 rounded-md border border-warning/60 bg-warning/[0.06] px-3 py-2.5"
      >
        <div className="flex items-start gap-2">
          <span className="font-semibold text-foreground">{question}</span>
          <Timestamp>{timestamp}</Timestamp>
        </div>
        {command != null && (
          <div
            data-slot="command"
            className="rounded-sm bg-surface px-2 py-1 text-foreground [overflow-wrap:anywhere]"
          >
            {command}
          </div>
        )}
        <div className="flex flex-col gap-1">{children}</div>
      </div>
    </li>
  ),
)
TranscriptPermission.displayName = 'TranscriptPermission'

export interface TranscriptPermissionChoiceProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onSelect'
> {
  /** The choice's ordinal, rendered as `1.`. */
  readonly number: React.ReactNode
  /** Marks the cursor row with the ❯ glyph and a success tint. */
  readonly highlighted?: boolean
  /** Called when the choice is activated (click, Enter, Space). */
  readonly onSelect?: () => void
}

export const TranscriptPermissionChoice = React.forwardRef<
  HTMLButtonElement,
  TranscriptPermissionChoiceProps
>(({ className, number, highlighted = false, onSelect, onClick, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    data-highlighted={highlighted || undefined}
    className={cn(
      'flex px-2 py-1 text-left hover:bg-item-hover disabled:pointer-events-none',
      focusRing,
      highlighted ? 'bg-success/15 text-foreground' : 'text-muted-foreground',
      className,
    )}
    onClick={(event) => {
      onClick?.(event)
      onSelect?.()
    }}
    {...props}
  >
    <span aria-hidden="true" className="inline-block w-[2ch] shrink-0">
      {highlighted ? '❯' : null}
    </span>
    <span>
      {number}. {children}
    </span>
  </button>
))
TranscriptPermissionChoice.displayName = 'TranscriptPermissionChoice'
