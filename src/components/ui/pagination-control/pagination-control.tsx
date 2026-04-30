import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationControlProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  totalItems?: number
  className?: string
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right'

function getPages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: PageItem[] = [1]
  const left = Math.max(2, page - 1)
  const right = Math.min(totalPages - 1, page + 1)
  if (left > 2) pages.push('ellipsis-left')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push('ellipsis-right')
  pages.push(totalPages)
  return pages
}

export function PaginationControl({
  page,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  className,
}: PaginationControlProps) {
  const pages = getPages(page, totalPages)
  const showInfo = pageSize !== undefined && totalItems !== undefined
  const rangeStart = showInfo ? (page - 1) * pageSize! + 1 : 0
  const rangeEnd = showInfo ? Math.min(page * pageSize!, totalItems!) : 0

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center gap-1', className)}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Go to previous page"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded transition-colors',
          'text-muted-foreground hover:bg-item-hover hover:text-foreground',
          'disabled:pointer-events-none disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      {pages.map((p) =>
        p === 'ellipsis-left' || p === 'ellipsis-right' ? (
          <span key={p} className="flex h-9 w-9 items-center justify-center text-muted-foreground">
            <MoreHorizontal className="size-4" aria-hidden="true" role="img" />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              p === page
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-item-hover',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Go to next page"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded transition-colors',
          'text-muted-foreground hover:bg-item-hover hover:text-foreground',
          'disabled:pointer-events-none disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>

      {showInfo && (
        <span className="ml-4 text-sm text-muted-foreground">
          {rangeStart}–{rangeEnd} of {totalItems}
        </span>
      )}
    </nav>
  )
}
