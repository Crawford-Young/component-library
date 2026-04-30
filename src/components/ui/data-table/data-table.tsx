import * as React from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronsUpDown, ChevronDown, ChevronUp } from 'lucide-react'
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
  pagination?: boolean | { pageSize?: number }
  className?: string
}

export function DataTable<TData>({ columns, data, pagination, className }: DataTableProps<TData>) {
  const hasPagination = pagination !== undefined && pagination !== false
  const resolvedPageSize = typeof pagination === 'object' ? (pagination.pageSize ?? 10) : 10

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: resolvedPageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(hasPagination ? { pagination: { pageIndex, pageSize } } : {}),
    },
    onSortingChange: setSorting,
    ...(hasPagination ? { onPaginationChange: setPagination } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(hasPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  return (
    <div className={cn('space-y-4', className)}>
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
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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

      {hasPagination && table.getPageCount() > 1 && (
        <div className="flex justify-end">
          <PaginationControl
            page={pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(p) => table.setPageIndex(p - 1)}
            pageSize={pageSize}
            totalItems={data.length}
          />
        </div>
      )}
    </div>
  )
}
