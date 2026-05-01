import * as React from 'react'
import { cn } from '@/lib/utils'

const DEFAULT_CONTENT: Record<string | number, { title: string; description: string }> = {
  404: {
    title: 'Page not found',
    description: "Sorry, we couldn't find the page you're looking for.",
  },
  500: {
    title: 'Server error',
    description: 'Something went wrong on our end. Please try again.',
  },
}

export interface ErrorPageProps {
  code?: number | string
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function ErrorPage({ code, title, description, action, className }: ErrorPageProps) {
  const defaults =
    code !== undefined
      ? (DEFAULT_CONTENT[code] ?? {
          title: 'Something went wrong',
          description: 'An unexpected error occurred.',
        })
      : { title: 'Something went wrong', description: 'An unexpected error occurred.' }

  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center gap-4 text-center',
        className,
      )}
    >
      {code !== undefined && (
        <p aria-hidden="true" className="text-8xl font-bold text-muted-foreground/60">
          {code}
        </p>
      )}
      <h1 className="text-2xl font-semibold text-foreground">{title ?? defaults.title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? defaults.description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode)
  onError?: (error: Error, info: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  render() {
    const { error } = this.state
    if (error !== null) {
      const { fallback } = this.props
      if (typeof fallback === 'function') return fallback(error)
      if (fallback !== undefined) return fallback
      return <ErrorPage code={500} description={error.message} />
    }
    return this.props.children
  }
}
