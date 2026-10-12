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
  getSubRows?: (row: TData) => TData[] | undefined
  /** Controlled expanded state (react-table `ExpandedState`); pair with `onExpandedChange`. */
  expanded?: ExpandedState
  onExpandedChange?: OnChangeFn<ExpandedState>
  /** Initial expanded state when uncontrolled. */
  defaultExpanded?: ExpandedState
  /** Names a row in its toggle: "Expand <label>". Falls back to "row". */
  getRowLabel?: (row: TData) => string
}

/** Indent per tree level; matches the `6` step of the spacing scale. */
const INDENT_STEP = '1.5rem'

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
}: DataTableProps<TData>) {
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

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(isTree ? { expanded: expanded ?? innerExpanded } : {}),
      ...(hasPagination ? { pagination: { pageIndex, pageSize } } : {}),
    },
    onSortingChange: setSorting,
    ...(isTree
      ? {
          getSubRows,
          onExpandedChange: onExpandedChange ?? setInnerExpanded,
          getExpandedRowModel: getExpandedRowModel(),
        }
      : {}),
    ...(hasPagination ? { onPaginationChange: setPagination } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(hasPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  return (
    <div className={cn('space-y-4', className)}>
      {isTree && (
        <button
          type="button"
          onClick={table.getToggleAllRowsExpandedHandler()}
          className="rounded text-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {table.getIsAllRowsExpanded() ? 'Collapse all' : 'Expand all'}
        </button>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const canSort = header.column.getCanSort()
                return (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(canSort && 'cursor-pointer select-none')}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-muted-foreground">
                          {sorted === 'asc' ? (
                            <ChevronUp className="size-3.5" aria-hidden="true" />
                          ) : sorted === 'desc' ? (
                            <ChevronDown className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden="true" />
                          )}
                        </span>
                      )}
                    </div>
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
                        ? { paddingLeft: `calc(${row.depth} * ${INDENT_STEP})` }
                        : undefined
                    }
                  >
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
              totalItems={data.length}
            />
          )}
        </div>
      )}
    </div>
  )
}
