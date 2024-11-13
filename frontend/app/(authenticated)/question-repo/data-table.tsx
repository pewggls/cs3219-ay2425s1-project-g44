"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useMemo, useState } from "react"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setData?: React.Dispatch<React.SetStateAction<TData[]>>;
  loading: boolean
  isVisible?: boolean
  initialSorting?: SortingState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  loading,
  isVisible = true,
  initialSorting = [],
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )

  const tableData = useMemo(
    () => (loading ? Array(1).fill({}) : data),
    [loading, data]
  )
  const tableColumns = useMemo(
    () =>
      loading
        ? columns.map((column) => ({
            ...column,
            cell: () => (
              <Skeleton className="h-4 w-[60%]" />
            )
          }))
        : columns,
    [loading, columns]
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    meta: {
      removeSelectedRows: (selectedRows: number[]) => {
        const filterFunc = (old: TData[]) => {
          const newRows = old.filter((q) => !selectedRows.includes((q as any).id - 1));
          return newRows.map((q, index) => ({
            ...q,
            id: index + 1 // Reassign ID based on the new order
          }));
        }
        if (setData) {
          setData(filterFunc);
        }
      },
    }
  })

  return (
    <div className="w-full font-sans text-black flex flex-col h-fit">
      <div className="pb-4">
        <DataTableToolbar table={table} data={data} setData={setData} isVisible={isVisible}/>
      </div>

      <div className="rounded-md border flex-grow overflow-hidden flex flex-col">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="overflow-auto">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
