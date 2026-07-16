'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ErrorPage } from '@/components/ui/error-boundary'

export interface RouteErrorFallbackProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
  readonly title?: string
  readonly description?: string
  readonly retryLabel?: string
  readonly className?: string
}

export function RouteErrorFallback({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  retryLabel = 'Try again',
  className,
}: RouteErrorFallbackProps): React.JSX.Element {
  return (
    <ErrorPage
      title={title}
      description={description}
      className={className}
      action={
        <div className="flex flex-col items-center gap-3">
          <Button onClick={reset}>{retryLabel}</Button>
          {error.digest !== undefined && (
            <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
          )}
        </div>
      }
    />
  )
}
