import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

function DataTable() {
  return (
    <Table>
      <TableCaption>Invoice list</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV-001</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-002</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell>$150.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell>$400.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

describe('Table', () => {
  it('renders a table element', () => {
    render(<DataTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<DataTable />)
    expect(screen.getByRole('columnheader', { name: 'Invoice' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument()
  })

  it('renders table rows', () => {
    render(<DataTable />)
    expect(screen.getAllByRole('row')).toHaveLength(4) // header row + 2 body rows + footer row
  })

  it('renders table cells', () => {
    render(<DataTable />)
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('$250.00')).toBeInTheDocument()
  })

  it('renders caption', () => {
    render(<DataTable />)
    expect(screen.getByText('Invoice list')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<DataTable />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('$400.00')).toBeInTheDocument()
  })

  it('Table wraps in a div with overflow-auto for responsive scroll', () => {
    const { container } = render(
      <Table>
        <TableBody />
      </Table>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.className).toContain('overflow-auto')
  })

  it('applies className to Table', () => {
    const { container } = render(
      <Table className="test-table">
        <TableBody />
      </Table>,
    )
    const table = container.querySelector('table')
    expect(table).toHaveClass('test-table')
  })

  it('applies className to TableRow', () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="test-row">
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getAllByRole('row')[0]).toHaveClass('test-row')
  })

  it('applies className to TableCell', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="test-cell">value</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByRole('cell', { name: 'value' })).toHaveClass('test-cell')
  })

  it('forwards ref on Table', () => {
    const ref = { current: null as HTMLTableElement | null }
    render(
      <Table ref={ref}>
        <TableBody />
      </Table>,
    )
    expect(ref.current).toBeInstanceOf(HTMLTableElement)
  })

  it('forwards ref on TableRow', () => {
    const ref = { current: null as HTMLTableRowElement | null }
    render(
      <Table>
        <TableBody>
          <TableRow ref={ref}>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(ref.current).toBeInstanceOf(HTMLTableRowElement)
  })

  it('has correct displayNames', () => {
    expect(Table.displayName).toBe('Table')
    expect(TableHeader.displayName).toBe('TableHeader')
    expect(TableBody.displayName).toBe('TableBody')
    expect(TableFooter.displayName).toBe('TableFooter')
    expect(TableRow.displayName).toBe('TableRow')
    expect(TableHead.displayName).toBe('TableHead')
    expect(TableCell.displayName).toBe('TableCell')
    expect(TableCaption.displayName).toBe('TableCaption')
  })
})
