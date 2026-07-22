import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ChatFabProps {
  readonly onClick: () => void
  /** Replaces the default chat-bubble icon. */
  readonly icon?: React.ReactNode
  /** Accessible label for the button. */
  readonly label?: string
  /** 'fixed' pins to the bottom-right viewport corner; 'static' lets the parent own placement. */
  readonly position?: 'fixed' | 'static'
  readonly className?: string
}

export function ChatFab({
  onClick,
  icon,
  label = 'Open AI assistant',
  position = 'fixed',
  className,
}: ChatFabProps): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        position === 'fixed' ? 'fixed bottom-6 right-6 z-30' : 'static',
        'flex h-14 w-14 items-center justify-center rounded-full',
        'bg-accent text-accent-foreground',
        'shadow-xl shadow-accent/30',
        'transition-transform duration-150 hover:scale-105 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
        className,
      )}
    >
      {icon ?? (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  )
}
