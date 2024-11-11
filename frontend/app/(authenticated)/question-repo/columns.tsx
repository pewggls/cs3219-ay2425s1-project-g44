"use client"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Dispatch, SetStateAction } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AlignLeft } from "lucide-react"
import Markdown from "react-markdown"


export type Question = {
    id: number,
    title: string,
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
            <DataTableColumnHeader column={column} title="ID" className="max-w-[40px]" />
        ),
        cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" className="min-w-[10vw] w-[25vw]" />
        ),
        cell: ({ row }) => {
            return (
                <HoverCard>
                    <HoverCardTrigger>
                        <div className="flex space-x-2">
                            <span className="font-medium cursor-help">
                            {row.getValue("title")}
                            </span>
                        </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="rounded-xl w-max">
                        <div className="flex flex-col">
                            <div className="flex items-center font-semibold mb-2">
                                <AlignLeft className="h-4 w-4 mr-2" />
                                <span>Description</span>
                            </div>
                            <div>
                                <Markdown className="text-sm text-primary prose prose-zinc prose-code:bg-zinc-200 prose-code:px-1 prose-code:rounded prose-code:prose-pre:bg-inherit">
                                    {row.original.description}
                                </Markdown>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            )
        },
    },
    // {
    //     accessorKey: 'summary',
    //     header: 'Summary',
    // },
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
        // cell: ({ row }) => {
        //     return (
        //         <div className="w-[140px]">
        //             {Array.isArray(row.original.categories) && row.original.categories.length > 0 ? (
        //                 row.original.categories.map((category, index) => (
        //                     <Badge key={index} variant="category" className="mr-1 my-0.5">
        //                         {category}
        //                     </Badge>
        //                 ))
        //             ) : (
        //                 <span>No categories available</span> // Optional message if no categories
        //             )}
        //         </div>
        //     );
        // },
        filterFn: (row, id, selectedCategories) => {
            const rowCategories = row.getValue(id);
            return selectedCategories.every((category: string) => (rowCategories as string[]).includes(category));
        },
        
    },
    {
        accessorKey: 'complexity',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Complexity" />
        ),
        cell: ({ row }) => (
            <div className="w-[40px]">
                <Badge variant={row.original.complexity.toLowerCase() as BadgeProps["variant"]}>
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
        enableResizing: false,
    }
]
}