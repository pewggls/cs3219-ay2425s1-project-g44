"use client"

import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Question } from "./columns"
import { useRef, useState } from "react"

import AddEditQuestionDialog from "./add-edit-question-dialog"
import DelQuestionDialog from "./del-question-dialog"
import Link from "next/link"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
    setData?: React.Dispatch<React.SetStateAction<TData[]>>
}

export function DataTableRowActions<TData extends Question>({
    row, setData
}: DataTableRowActionsProps<TData>) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const triggerEditRef = useRef<HTMLDivElement>(null);
    const triggerDelRef = useRef<HTMLDivElement>(null);

    const handleEditClose = () => triggerEditRef.current?.click();
    const handleDelClose = () => triggerDelRef.current?.click();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-sans">
                <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <Link href={row.original.link} passHref><span className="">Original link</span></Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem onSelect={() => {
                    triggerEditRef.current?.click();
                    setIsDialogOpen(true)
                }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span className="">Edit</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onSelect={() => {
                    triggerDelRef.current?.click();
                }}>
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-semibold">Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>

            {/* for dialogs to work in dropdowns we need some workarounds, else they don't render properly:
                https://ui.shadcn.com/docs/components/dialog#notes
                in this case we use this solution:
                https://github.com/radix-ui/primitives/issues/1836#issuecomment-2177341164
            */}
            <AddEditQuestionDialog row={row.original as Question} ref={triggerEditRef} reset={isDialogOpen} setReset={setIsDialogOpen} setData={setData as React.Dispatch<React.SetStateAction<Question[]>> | undefined} handleClose={handleEditClose}/>
            <DelQuestionDialog row={row.original as Question} ref={triggerDelRef} setData={setData as React.Dispatch<React.SetStateAction<Question[]>> | undefined} handleClose={handleDelClose}/>
        </DropdownMenu>
        
    )
}