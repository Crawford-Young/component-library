import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { type ColumnDef, DataTable } from './data-table'

interface Person {
  name: string
  age: number
  role: string
}

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'role', header: 'Role' },
]

const data: Person[] = [
  { name: 'Alice', age: 30, role: 'Engineer' },
  { name: 'Bob', age: 25, role: 'Designer' },
  { name: 'Carol', age: 35, role: 'Manager' },
  { name: 'Dave', age: 28, role: 'Engineer' },
  { name: 'Eve', age: 31, role: 'Designer' },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('renders all data rows when no pagination', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
    expect(screen.getByText('Dave')).toBeInTheDocument()
    expect(screen.getByText('Eve')).toBeInTheDocument()
  })

  it('sorts ascending when column header is clicked once', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={data} />)
    await user.click(screen.getByText('Name'))
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('Alice')).toBeInTheDocument()
    expect(within(rows[4]).getByText('Eve')).toBeInTheDocument()
  })

  it('sorts descending when column header is clicked twice', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={data} />)
    await user.click(screen.getByText('Name'))
    await user.click(screen.getByText('Name'))
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('Eve')).toBeInTheDocument()
    expect(within(rows[4]).getByText('Alice')).toBeInTheDocument()
  })

  it('clears sort when column header is clicked a third time', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={data} />)
    await user.click(screen.getByText('Name'))
    await user.click(screen.getByText('Name'))
    await user.click(screen.getByText('Name'))
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('Alice')).toBeInTheDocument()
  })

  it('shows "No results." when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('shows PaginationControl when pagination is true', () => {
    const manyRows: Person[] = Array.from({ length: 25 }, (_, i) => ({
      name: `Person ${i + 1}`,
      age: 20 + i,
      role: 'Engineer',
    }))
    render(<DataTable columns={columns} data={manyRows} pagination />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('does not show PaginationControl when pagination is false', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
  })

  it('shows only pageSize rows per page when pagination is enabled', () => {
    const manyRows: Person[] = Array.from({ length: 25 }, (_, i) => ({
      name: `Person ${i + 1}`,
      age: 20 + i,
      role: 'Engineer',
    }))
    render(<DataTable columns={columns} data={manyRows} pagination={{ pageSize: 10 }} />)
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(10)
  })

  it('navigates to next page when next button is clicked', async () => {
    const user = userEvent.setup()
    const manyRows: Person[] = Array.from({ length: 25 }, (_, i) => ({
      name: `Person ${i + 1}`,
      age: 20 + i,
      role: 'Engineer',
    }))
    render(<DataTable columns={columns} data={manyRows} pagination={{ pageSize: 10 }} />)
    expect(screen.getByText('Person 1')).toBeInTheDocument()
    expect(screen.queryByText('Person 11')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Go to next page'))

    expect(screen.queryByText('Person 1')).not.toBeInTheDocument()
    expect(screen.getByText('Person 11')).toBeInTheDocument()
  })

  it('forwards className to the root div', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders page size selector when pageSizeOptions is provided', () => {
    const manyRows: Person[] = Array.from({ length: 25 }, (_, i) => ({
      name: `Person ${i + 1}`,
      age: 20 + i,
      role: 'Engineer',
    }))
    render(
      <DataTable
        columns={columns}
        data={manyRows}
        pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
      />,
    )
    expect(screen.getByLabelText('Rows per page')).toBeInTheDocument()
  })

  it('changes page size when selector is changed', async () => {
    const user = userEvent.setup()
    const manyRows: Person[] = Array.from({ length: 50 }, (_, i) => ({
      name: `Person ${i + 1}`,
      age: 20 + i,
      role: 'Engineer',
    }))
    render(
      <DataTable
        columns={columns}
        data={manyRows}
        pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
      />,
    )
    expect(screen.getAllByRole('row').slice(1)).toHaveLength(10)
    await user.selectOptions(screen.getByLabelText('Rows per page'), '25')
    expect(screen.getAllByRole('row').slice(1)).toHaveLength(25)
  })
})
