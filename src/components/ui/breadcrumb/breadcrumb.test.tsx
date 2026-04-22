import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb'

function TestBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

describe('Breadcrumb', () => {
  it('renders a nav landmark', () => {
    render(<TestBreadcrumb />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('nav has aria-label', () => {
    render(<TestBreadcrumb />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'breadcrumb')
  })

  it('renders list items', () => {
    render(<TestBreadcrumb />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Components')).toBeInTheDocument()
    expect(screen.getByText('Breadcrumb')).toBeInTheDocument()
  })

  it('BreadcrumbLink renders as anchor with href', () => {
    render(<TestBreadcrumb />)
    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('BreadcrumbPage has aria-current="page"', () => {
    render(<TestBreadcrumb />)
    expect(screen.getByText('Breadcrumb')).toHaveAttribute('aria-current', 'page')
  })

  it('BreadcrumbPage renders as span', () => {
    render(<TestBreadcrumb />)
    const page = screen.getByText('Breadcrumb')
    expect(page.tagName).toBe('SPAN')
  })

  it('BreadcrumbSeparator renders ChevronRight icon', () => {
    const { container } = render(<TestBreadcrumb />)
    // ChevronRight from lucide renders as an svg; separator wraps it in an li
    const separators = container.querySelectorAll('[aria-hidden="true"]')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('BreadcrumbList renders as ol', () => {
    const { container } = render(<TestBreadcrumb />)
    expect(container.querySelector('ol')).toBeInTheDocument()
  })
})

describe('BreadcrumbEllipsis', () => {
  it('renders MoreHorizontal icon', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders sr-only "More" text', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByText('More')).toBeInTheDocument()
    expect(screen.getByText('More')).toHaveClass('sr-only')
  })

  it('has correct displayNames', () => {
    expect(Breadcrumb.displayName).toBe('Breadcrumb')
    expect(BreadcrumbList.displayName).toBe('BreadcrumbList')
    expect(BreadcrumbItem.displayName).toBe('BreadcrumbItem')
    expect(BreadcrumbLink.displayName).toBe('BreadcrumbLink')
    expect(BreadcrumbPage.displayName).toBe('BreadcrumbPage')
    expect(BreadcrumbSeparator.displayName).toBe('BreadcrumbSeparator')
    expect(BreadcrumbEllipsis.displayName).toBe('BreadcrumbEllipsis')
  })
})
