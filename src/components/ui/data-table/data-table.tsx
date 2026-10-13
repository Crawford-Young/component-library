import * as React from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronsUpDown, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PaginationControl } from '@/components/ui/pagination-control'

export type { ColumnDef } from '@tanstack/react-table'

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  pagination?: boolean | { pageSize?: number; pageSizeOptions?: number[] }
  className?: string
  /** Returns a row's children; enables tree rows, expand toggles and the expand-all control. */
  readonly getSubRows?: (row: TData) => TData[] | undefined
  /**
   * Controlled expanded state (react-table `ExpandedState`). Pair with `onExpandedChange`;
   * without it the tree is read-only (toggles do nothing).
   */
  readonly expanded?: ExpandedState
  /** Called on every expand change, controlled or not. */
  readonly onExpandedChange?: OnChangeFn<ExpandedState>
  /** Initial expanded state when uncontrolled. */
  readonly defaultExpanded?: ExpandedState
  /** Names a row in its toggle: "Expand <label>". Falls back to "row". */
  readonly getRowLabel?: (row: TData) => string
  /**
   * Stable row id (react-table `getRowId`). Without it expanded state is keyed by index, so a
   * live insert shifts it onto the wrong rows. Ids must be unique across the whole tree, not just
   * among siblings: compose the parent's id (`parent?.id`) into each row's id.
   */
  readonly getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
}

/** Indent per tree level; matches the `6` step of the spacing scale. */
const INDENT_STEP = '1.5rem'
/** Cell padding (`p-4`) that every indent builds on. */
const CELL_PADDING = '1rem'

export function DataTable<TData>({
  columns,
  data,
  pagination,
  className,
  getSubRows,
  expanded,
  onExpandedChange,
  defaultExpanded,
  getRowLabel,
  getRowId,
}: DataTableProps<TData>): React.JSX.Element {
  const hasPagination = pagination !== undefined && pagination !== false
  const resolvedPageSize = typeof pagination === 'object' ? (pagination.pageSize ?? 10) : 10
  const pageSizeOptions =
    typeof pagination === 'object' ? (pagination.pageSizeOptions ?? null) : null

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: resolvedPageSize,
  })

  const [innerExpanded, setInnerExpanded] = React.useState<ExpandedState>(defaultExpanded ?? {})
  const isTree = getSubRows !== undefined

  const handleExpandedChange: OnChangeFn<ExpandedState> = (updater) => {
    if (expanded === undefined) setInnerExpanded(updater)
    onExpandedChange?.(updater)
  }

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting,
      ...(isTree ? { expanded: expanded ?? innerExpanded } : {}),
      ...(hasPagination ? { pagination: { pageIndex, pageSize } } : {}),
    },
    onSortingChange: setSorting,
    ...(isTree
      ? {
          getSubRows,
          onExpandedChange: handleExpandedChange,
          getExpandedRowModel: getExpandedRowModel(),
        }
      : {}),
    ...(hasPagination ? { onPaginationChange: setPagination } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(hasPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const allExpanded =
    isTree &&
    table
      .getCoreRowModel()
      .flatRows.filter((row) => row.getCanExpand())
      .every((row) => row.getIsExpanded())

  return (
    <div className={cn('space-y-4', className)}>
      {isTree && table.getCanSomeRowsExpand() && (
        <button
          type="button"
          onClick={() => table.toggleAllRowsExpanded(!allExpanded)}
          className="rounded text-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const canSort = header.column.getCanSort()
                const content = header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      canSort
                        ? sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : 'none'
                        : undefined
                    }
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex select-none items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {content}
                        <span className="text-muted-foreground">
                          {sorted === 'asc' ? (
                            <ChevronUp className="size-3.5" aria-hidden="true" />
                          ) : sorted === 'desc' ? (
                            <ChevronDown className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    ) : (
                      content
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    style={
                      isTree && index === 0 && row.depth > 0
                        ? { paddingLeft: `calc(${CELL_PADDING} + ${row.depth} * ${INDENT_STEP})` }
                        : undefined
                    }
                  >
                    {isTree && index === 0 && !row.getCanExpand() && (
                      <span aria-hidden="true" className="mr-1 inline-block size-4 align-middle" />
                    )}
                    {isTree && index === 0 && row.getCanExpand() && (
                      <button
                        type="button"
                        onClick={row.getToggleExpandedHandler()}
                        aria-expanded={row.getIsExpanded()}
                        aria-label={`${row.getIsExpanded() ? 'Collapse' : 'Expand'} ${getRowLabel?.(row.original) ?? 'row'}`}
                        className="mr-1 inline-flex rounded align-middle text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {row.getIsExpanded() ? (
                          <ChevronDown className="size-4" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    )}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {hasPagination && (
        <div className="flex items-center justify-center gap-4">
          {pageSizeOptions && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <label htmlFor="page-size-select">Rows per page</label>
              <select
                id="page-size-select"
                aria-label="Rows per page"
                value={pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                  table.setPageIndex(0)
                }}
                className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
          {table.getPageCount() > 1 && (
            <PaginationControl
              page={pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(p) => table.setPageIndex(p - 1)}
              pageSize={pageSize}
              totalItems={table.getPrePaginationRowModel().rows.length}
            />
          )}
        </div>
      )}
    </div>
  )
}
