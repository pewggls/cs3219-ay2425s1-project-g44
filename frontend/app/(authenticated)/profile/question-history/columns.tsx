"use client"

import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal  } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link"
import { DataTableColumnHeader } from "../../question-repo/data-table-column-header";

export type QuestionHistory = {
    id: number;
    title: string;
    complexity: string;
    categories: string[];
    description: string;
    attemptDate: Date;
    attemptCount: number;
    attemptTime: number;
  };

export const columns : ColumnDef<QuestionHistory>[]= [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column} title="ID" className="max-w-[30px]" />
        )
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column} title="Title" className="min-w-[10vw] w-[15vw]" />
        )
      },
    },
    {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column} title="Categories" />
        )
      },
      accessorKey: "categories",
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
        return selectedCategories.every((category: string) => (rowCategories as string[]).includes(category));
    },
    },
    {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column} title="Complexity" />
        )
      },
      accessorKey: "complexity",
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
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column} title="No. of Attempts" />
        )
      },
      accessorKey: "attemptCount",
      cell: ({ row }) => <div className="flex items-center justify-center h-full">{row.getValue("attemptCount")}</div>,
    },
    {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column} title="Total Time Spent (mins)" />
        )
      },
      accessorKey: "attemptTime",
      cell: ({ row }) => <div className="flex items-center justify-center h-full">{ Math.ceil(row.original.attemptTime/60)}</div>,
    //   Cell: ({ value }) => Math.floor(value / 60), // Convert time spent in seconds to minutes
    },
    {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column} title="Last Attempted" />
        )
      },
      accessorKey: "attemptDate",
      cell: ({ row }) => {
        const attemptDate = row.original.attemptDate;
        return new Date(attemptDate).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      },
      sortingFn: "datetime",
      sortDescFirst: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/profile/question-history/code?questionId=${row.getValue("id")}`} passHref>
                  View Code
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableResizing: false,
  }
  ];