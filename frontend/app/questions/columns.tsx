"use client"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { SetStateAction } from "react"

export type Question = {
    id: number,
    title: string,
    summary: string,
    description: string,
    categories: string[],
    complexity: string,
    link: string
}

export const columns: (param: Dispatch<SetStateAction<Question[]>>) => ColumnDef<Question>[] = (setData) => {
    return [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px] mr-2"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px] mr-2"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => <div className="w-[40px]">{row.getValue("id")}</div>,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="font-medium">
                    {row.getValue("title")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'summary',
        header: 'Summary',
    },
    {
        accessorKey: 'categories',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Categories" />
        ),
        cell: ({ row }) => (
            <div className="w-[140px]">
                {row.original.categories.map((category, index) => (
                    <Badge key={index} variant="category" className="mr-1 my-0.5">
                        {category}
                    </Badge>
                ))}
            </div>
        ),
        filterFn: (row, id, selectedCategories) => {
            const rowCategories = row.getValue(id);
            console.log(selectedCategories);
            console.log(rowCategories);
            return selectedCategories.every(category => rowCategories.includes(category));
        },
        
    },
    {
        accessorKey: 'complexity',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Complexity" />
        ),
        cell: ({ row }) => (
            <div className="w-[40px]">
                <Badge variant={row.original.complexity as BadgeProps["variant"]}>
                    {row.original.complexity}
                </Badge>
            </div>
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} setData={setData}/>,
    }
]
}