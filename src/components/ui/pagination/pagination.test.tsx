import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

function TestPagination() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="/page/1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="/page/3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

describe('Pagination', () => {
  it('renders a nav landmark', () => {
    render(<TestPagination />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('nav has aria-label', () => {
    render(<TestPagination />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'pagination')
  })

  it('renders Previous link with text', () => {
    render(<TestPagination />)
    expect(screen.getByRole('link', { name: /previous/i })).toBeInTheDocument()
  })

  it('renders Next link with text', () => {
    render(<TestPagination />)
    expect(screen.getByRole('link', { name: /next/i })).toBeInTheDocument()
  })

  it('renders page links', () => {
    render(<TestPagination />)
    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '3' })).toBeInTheDocument()
  })

  it('active page link has aria-current="page"', () => {
    render(<TestPagination />)
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
  })

  it('inactive page link does not have aria-current', () => {
    render(<TestPagination />)
    expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current')
  })

  it('Previous link has correct href', () => {
    render(<TestPagination />)
    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/page/1')
  })

  it('Next link has correct href', () => {
    render(<TestPagination />)
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/page/3')
  })
})

describe('PaginationEllipsis', () => {
  it('renders MoreHorizontal icon', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders sr-only "More pages" text', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    expect(screen.getByText('More pages')).toBeInTheDocument()
    expect(screen.getByText('More pages')).toHaveClass('sr-only')
  })

  it('has correct displayNames', () => {
    expect(Pagination.displayName).toBe('Pagination')
    expect(PaginationContent.displayName).toBe('PaginationContent')
    expect(PaginationItem.displayName).toBe('PaginationItem')
    expect(PaginationLink.displayName).toBe('PaginationLink')
    expect(PaginationPrevious.displayName).toBe('PaginationPrevious')
    expect(PaginationNext.displayName).toBe('PaginationNext')
    expect(PaginationEllipsis.displayName).toBe('PaginationEllipsis')
  })
})
