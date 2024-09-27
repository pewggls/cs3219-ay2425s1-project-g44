"use client"

import { Plus, X } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { categories, complexities } from "./data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { useRef, useState } from "react"
import AddEditQuestionDialog from "./add-edit-question-dialog"
import { Question } from "./columns"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    data?:  TData[]
    setData?: React.Dispatch<React.SetStateAction<TData[]>>
}

export function DataTableToolbar<TData extends Question[] | undefined>({
    table, data, setData
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const triggerAddRef = useRef<HTMLDivElement>(null);

    const handleClose = () => triggerAddRef.current?.click();
    
    return (
        <div className="justify-between flex items-center">
            <div className="flex items-center justify-between font-sans">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Filter by title"
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] desktop:w-[250px]"
                    />
                    {table.getColumn("categories") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("categories")}
                            title="Categories"
                            options={categories}
                        />
                    )}
                    {table.getColumn("complexity") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("complexity")}
                            title="Complexity"
                            options={complexities}
                        />
                    )}
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => table.resetColumnFilters()}
                            className="h-8 px-2 desktop:px-3"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <Button 
                className="h-8 px-2 desktop:px-3 bg-brand-700 hover:bg-brand-600" 
                onClick={() => {
                    triggerAddRef.current?.click();
                }}
            >
                <Plus className="mr-2 h-4 w-4" />
                <span className="font-semibold uppercase">Add</span>
            </Button>
            <AddEditQuestionDialog ref={triggerAddRef} row={null} data={data} setData={setData} handleClose={handleClose}/>
        </div>
    )
}