"use client"

import { Plus, Trash2, X } from "lucide-react"
import { Table, TableMeta } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { categories, complexities } from "./data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { useRef, useState } from "react"
import AddEditQuestionDialog from "./add-edit-question-dialog"
import { Question } from "./columns"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ExtendedTableMeta<TData> extends TableMeta<TData> {
    removeSelectedRows?: (rows: number[]) => void;
}

interface DataTableToolbarProps<TData extends Question> {
    table: Table<TData> & { options: { meta?: ExtendedTableMeta<TData> } };
    data?: TData[];
    setData?: React.Dispatch<React.SetStateAction<TData[]>>;
    isVisible: boolean
}

export function DataTableToolbar<TData extends Question>({
    table, data, setData, isVisible
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const isFilteredRowsSelected = table.getFilteredSelectedRowModel().rows.length > 0
    const triggerAddRef = useRef<HTMLDivElement>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleClose = () => triggerAddRef.current?.click();

    const apiUrl = process.env.NEXT_PUBLIC_QUESTION_API_BASE_URL;
    async function deleteQuestions() {
        const delRows = [];
        const errorResponses = [];
        for (const row of table.getFilteredSelectedRowModel().rows.reverse()) {
            try {
                const response = await fetch(`${apiUrl}/delete/${row.original.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorResponse = await response.json();
                    errorResponses.push(errorResponse.message);
                    continue;
                }

                delRows.push(row.index);
            } catch (error) {
                alert("An error occurred while deleting questions.");
                console.error("Error while deleting questions");
            }
        }

        if (errorResponses.length > 0) {
            alert(`An error occurred while deleting questions: ${errorResponses.join(", ")}`);
        }

        table.options.meta?.removeSelectedRows?.(delRows);
        table.resetRowSelection();
    }

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
            
            {isVisible && (
            <>
            <div className="flex flex-row gap-4">
                {isFilteredRowsSelected && (
                    <Dialog>
                        <DialogTrigger>
                            <Button
                                variant="ghost"
                                className="text-red-600 hover:text-red-600 font-semibold h-8 px-2 desktop:px-3"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete selected
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-8 bg-white text-black font-sans rounded-2xl">
                            <DialogHeader className="items-start">
                                <DialogTitle className="font-serif font-normal text-3xl">Delete {table.getFilteredSelectedRowModel().rows.length} questions?</DialogTitle>
                                <DialogDescription className="pt-1 font-bold">This action cannot be undone!</DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex items-end">
                                <Button variant="destructive" className="rounded-lg" onClick={() => deleteQuestions()}>Confirm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                <Button
                    size="sm"
                    className="h-8 desktop:px-3 bg-brand-700 hover:bg-brand-600"
                    onClick={() => {
                        triggerAddRef.current?.click();
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="font-semibold uppercase">Add</span>
                </Button>
            </div>
            <AddEditQuestionDialog ref={triggerAddRef} row={null} reset={isDialogOpen} setReset={setIsDialogOpen} setData={setData as React.Dispatch<React.SetStateAction<Question[]>> | undefined} handleClose={handleClose} />
            </>
            )}
        </div>
    )
}