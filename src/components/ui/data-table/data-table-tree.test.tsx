import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type ColumnDef, DataTable } from './data-table'

interface Node {
  name: string
  size: number
  children?: Node[]
}

const columns: ColumnDef<Node>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'size', header: 'Size' },
]

const tree: Node[] = [
  {
    name: 'Zeta',
    size: 1,
    children: [
      { name: 'Zed-b', size: 9, children: [{ name: 'Leaf', size: 4 }] },
      { name: 'Zed-a', size: 2 },
    ],
  },
  { name: 'Alpha', size: 5, children: [{ name: 'Child', size: 3 }] },
  { name: 'Solo', size: 7 },
]

const getSubRows = (n: Node) => n.children

const bodyRows = () => screen.getAllByRole('row').slice(1)
const names = () => bodyRows().map((r) => within(r).getAllByRole('cell')[0].textContent)

describe('DataTable tree rows', () => {
  it('shows only top-level rows initially and hides children', () => {
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    expect(names()).toEqual(['Zeta', 'Alpha', 'Solo'])
  })

  it('renders an expand button with aria-expanded only on rows with children', () => {
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    const toggles = screen.getAllByRole('button', { name: 'Expand row' })
    expect(toggles).toHaveLength(2)
    toggles.forEach((t) => expect(t).toHaveAttribute('aria-expanded', 'false'))
    const solo = bodyRows()[2]
    expect(within(solo).queryByRole('button')).toBeNull()
  })

  it('expands a row on click and flips the label and aria-expanded', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    await user.click(screen.getAllByRole('button', { name: 'Expand row' })[1])
    expect(names()).toEqual(['Zeta', 'Alpha', 'Child', 'Solo'])
    const collapse = screen.getByRole('button', { name: 'Collapse row' })
    expect(collapse).toHaveAttribute('aria-expanded', 'true')
    await user.click(collapse)
    expect(names()).toEqual(['Zeta', 'Alpha', 'Solo'])
  })

  it('is operable from the keyboard', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    const toggle = screen.getAllByRole('button', { name: 'Expand row' })[1]
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(names()).toContain('Child')
    await user.keyboard(' ')
    expect(names()).not.toContain('Child')
  })

  it('indents the first cell by row depth and leaves other cells alone', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    await user.click(screen.getByRole('button', { name: 'Expand all' }))
    const byName = (n: string) => bodyRows().find((r) => within(r).queryByText(n))!
    const firstCell = (n: string) => within(byName(n)).getAllByRole('cell')[0]
    expect(firstCell('Zeta').style.paddingLeft).toBe('')
    expect(firstCell('Zed-b').style.paddingLeft).toBe('calc(1rem + 1 * 1.5rem)')
    expect(firstCell('Leaf').style.paddingLeft).toBe('calc(1rem + 2 * 1.5rem)')
    expect(within(byName('Leaf')).getAllByRole('cell')[1].style.paddingLeft).toBe('')
  })

  it('shows an expand-all control only when getSubRows is set, and toggles it', async () => {
    const user = userEvent.setup()
    const flat = render(<DataTable columns={columns} data={tree} />)
    expect(screen.queryByRole('button', { name: /all/i })).toBeNull()
    flat.unmount()
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    await user.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(names()).toEqual(['Zeta', 'Zed-b', 'Leaf', 'Zed-a', 'Alpha', 'Child', 'Solo'])
    await user.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(names()).toEqual(['Zeta', 'Alpha', 'Solo'])
  })

  it('sorts within siblings, keeping children under their parent', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    await user.click(screen.getByRole('button', { name: 'Expand all' }))
    await user.click(screen.getByText('Name'))
    expect(names()).toEqual(['Alpha', 'Child', 'Solo', 'Zeta', 'Zed-a', 'Zed-b', 'Leaf'])
  })

  it('accepts an initial expanded state when uncontrolled', () => {
    render(
      <DataTable
        columns={columns}
        data={tree}
        getSubRows={getSubRows}
        defaultExpanded={{ '1': true }}
      />,
    )
    expect(names()).toEqual(['Zeta', 'Alpha', 'Child', 'Solo'])
  })

  it('renders children from a controlled expanded value and follows a new one', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    const view = (expanded: Record<string, boolean>) => (
      <DataTable
        columns={columns}
        data={tree}
        getSubRows={getSubRows}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
      />
    )
    const { rerender } = render(view({ '1': true }))
    expect(names()).toEqual(['Zeta', 'Alpha', 'Child', 'Solo'])
    await user.click(screen.getByRole('button', { name: 'Expand row' }))
    expect(onExpandedChange).toHaveBeenCalledTimes(1)
    expect(names()).toEqual(['Zeta', 'Alpha', 'Child', 'Solo'])
    rerender(view({ '0': true }))
    expect(names()).toEqual(['Zeta', 'Zed-b', 'Zed-a', 'Alpha', 'Solo'])
  })

  it('treats a controlled expanded without onExpandedChange as read-only', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} expanded={{}} />)
    await user.click(screen.getAllByRole('button', { name: 'Expand row' })[0])
    expect(names()).toEqual(['Zeta', 'Alpha', 'Solo'])
  })

  it('keeps expanding when uncontrolled and onExpandedChange only observes', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={tree}
        getSubRows={getSubRows}
        onExpandedChange={onExpandedChange}
      />,
    )
    await user.click(screen.getAllByRole('button', { name: 'Expand row' })[1])
    expect(onExpandedChange).toHaveBeenCalledTimes(1)
    expect(names()).toEqual(['Zeta', 'Alpha', 'Child', 'Solo'])
  })

  it('renders no toggles when getSubRows is set but no row has children', () => {
    render(<DataTable columns={columns} data={[{ name: 'A', size: 1 }]} getSubRows={getSubRows} />)
    expect(screen.queryByRole('button', { name: 'Expand row' })).toBeNull()
  })

  it('labels each toggle from getRowLabel and falls back to "row" when unset', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={tree}
        getSubRows={getSubRows}
        getRowLabel={(n) => n.name}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Expand row' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Expand Alpha' }))
    expect(screen.getByRole('button', { name: 'Collapse Alpha' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Expand Zeta' })).toBeInTheDocument()
  })
  it('hides expand-all when no row can expand', () => {
    render(<DataTable columns={columns} data={[{ name: 'A', size: 1 }]} getSubRows={getSubRows} />)
    expect(screen.queryByRole('button', { name: /all/i })).toBeNull()
  })

  it('reads "Collapse all" once every expandable row is expanded by hand', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={tree}
        getSubRows={getSubRows}
        getRowLabel={(n) => n.name}
      />,
    )
    expect(screen.getByRole('button', { name: 'Expand all' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Expand Zeta' }))
    await user.click(screen.getByRole('button', { name: 'Expand Alpha' }))
    await user.click(screen.getByRole('button', { name: 'Expand Zed-b' }))
    expect(screen.getByRole('button', { name: 'Collapse all' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(names()).toEqual(['Zeta', 'Alpha', 'Solo'])
  })

  it('aligns leaf rows with a same-size aria-hidden spacer where the chevron would be', () => {
    render(<DataTable columns={columns} data={tree} getSubRows={getSubRows} />)
    const solo = within(bodyRows()[2]).getAllByRole('cell')[0]
    const spacer = solo.querySelector('[aria-hidden="true"]')!
    expect(spacer).toHaveClass('size-4', 'mr-1')
    expect(within(bodyRows()[1]).getAllByRole('cell')[1].querySelector('[aria-hidden]')).toBeNull()
  })

  it('counts every visible tree row in the pagination totals', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={tree}
        getSubRows={getSubRows}
        pagination={{ pageSize: 2 }}
      />,
    )
    expect(screen.getByText('1–2 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(screen.getByText('1–2 of 7')).toBeInTheDocument()
  })
})

describe('DataTable getRowId', () => {
  it('keeps an expanded row expanded when a sibling is inserted before it', async () => {
    const user = userEvent.setup()
    const getRowId = (n: Node) => n.name
    const { rerender } = render(
      <DataTable columns={columns} data={tree} getSubRows={getSubRows} getRowId={getRowId} />,
    )
    await user.click(screen.getAllByRole('button', { name: 'Expand row' })[1])
    expect(names()).toEqual(['Zeta', 'Alpha', 'Child', 'Solo'])

    const fresh: Node = { name: 'Fresh', size: 0, children: [{ name: 'Fresh-child', size: 1 }] }
    rerender(
      <DataTable
        columns={columns}
        data={[fresh, ...tree]}
        getSubRows={getSubRows}
        getRowId={getRowId}
      />,
    )
    expect(names()).toEqual(['Fresh', 'Zeta', 'Alpha', 'Child', 'Solo'])
  })
})
