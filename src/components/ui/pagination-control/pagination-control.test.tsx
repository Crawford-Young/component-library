import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PaginationControl } from './pagination-control'

describe('PaginationControl', () => {
  it('renders page buttons for all pages when totalPages ≤ 7', () => {
    render(<PaginationControl page={1} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Go to page 5')).toBeInTheDocument()
  })

  it('marks current page with aria-current="page"', () => {
    render(<PaginationControl page={3} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Go to page 3')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Go to page 1')).not.toHaveAttribute('aria-current')
  })

  it('calls onPageChange with correct page when a page button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<PaginationControl page={1} totalPages={5} onPageChange={onPageChange} />)
    await user.click(screen.getByLabelText('Go to page 3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange(page - 1) when prev button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<PaginationControl page={3} totalPages={5} onPageChange={onPageChange} />)
    await user.click(screen.getByLabelText('Go to previous page'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange(page + 1) when next button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<PaginationControl page={3} totalPages={5} onPageChange={onPageChange} />)
    await user.click(screen.getByLabelText('Go to next page'))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('disables prev button on first page', () => {
    render(<PaginationControl page={1} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Go to previous page')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<PaginationControl page={5} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Go to next page')).toBeDisabled()
  })

  it('shows ellipsis when page count > 7', () => {
    render(<PaginationControl page={5} totalPages={20} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Go to page 20')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { hidden: true })).toBeDefined()
  })

  it('shows info label when pageSize and totalItems are provided', () => {
    render(
      <PaginationControl
        page={2}
        totalPages={5}
        onPageChange={() => {}}
        pageSize={10}
        totalItems={50}
      />,
    )
    expect(screen.getByText('11–20 of 50')).toBeInTheDocument()
  })

  it('does not show info label when pageSize or totalItems are missing', () => {
    render(<PaginationControl page={1} totalPages={5} onPageChange={() => {}} pageSize={10} />)
    expect(screen.queryByText(/of/)).not.toBeInTheDocument()
  })

  it('caps rangeEnd at totalItems on the last page', () => {
    render(
      <PaginationControl
        page={3}
        totalPages={3}
        onPageChange={() => {}}
        pageSize={10}
        totalItems={25}
      />,
    )
    expect(screen.getByText('21–25 of 25')).toBeInTheDocument()
  })

  it('forwards className to the nav element', () => {
    render(
      <PaginationControl
        page={1}
        totalPages={3}
        onPageChange={() => {}}
        className="custom-class"
      />,
    )
    expect(screen.getByRole('navigation')).toHaveClass('custom-class')
  })
})
