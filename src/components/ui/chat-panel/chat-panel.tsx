import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ChatPanelProps extends React.ComponentPropsWithoutRef<'aside'> {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** Accessible name for the panel and the default header text when `header` is omitted. */
  readonly title: string
  /** Replaces the default title text in the header row. */
  readonly header?: React.ReactNode
  /** Rendered between the header and the close button. */
  readonly actions?: React.ReactNode
  /** When false, no backdrop is rendered and the page stays interactive. */
  readonly modal?: boolean
}

export function ChatPanel({
  open,
  onOpenChange,
  title,
  header,
  actions,
  modal = true,
  children,
  className,
  ...props
}: ChatPanelProps): React.JSX.Element {
  return (
    <>
      {modal && open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
        />
      )}
      <aside
        aria-label={title}
        {...props}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-[380px] flex-col border-l border-border bg-surface shadow-xl',
          'transition-transform duration-300 ease-in-out motion-reduce:transition-none',
          open ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          {header ?? <span className="text-sm font-semibold text-foreground">{title}</span>}
          <div className="ml-auto flex items-center gap-1">
            {actions}
            <button
              type="button"
              aria-label="Close panel"
              onClick={() => onOpenChange(false)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-item-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {open && <div className="flex-1 overflow-y-auto">{children}</div>}
      </aside>
    </>
  )
}
