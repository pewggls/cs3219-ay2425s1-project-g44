"use client"

import { useEffect, useState } from "react";
import { columns, Question } from "./columns"
import { DataTable } from "./data-table"
import { Badge, BadgeProps } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

const complexityList: Array<{
    value: string;
    label: string;
    badgeVariant: BadgeProps["variant"];
}> = [
        { value: "easy", label: "Easy", badgeVariant: "easy" },
        { value: "medium", label: "Medium", badgeVariant: "medium" },
        { value: "hard", label: "Hard", badgeVariant: "hard" },
    ];

const categoryList: Array<{
    value: string;
    label: string;
    badgeVariant: BadgeProps["variant"];
}> = [
        { value: "algorithms", label: "Algorithms", badgeVariant: "category" },
        { value: "arrays", label: "Arrays", badgeVariant: "category" },
        {
            value: "bitmanipulation",
            label: "Bit Manipulation",
            badgeVariant: "category",
        },
        { value: "brainteaser", label: "Brainteaser", badgeVariant: "category" },
        { value: "databases", label: "Databases", badgeVariant: "category" },
        { value: "datastructures", label: "Data Structures", badgeVariant: "category" },
        { value: "recursion", label: "Recursion", badgeVariant: "category" },
        { value: "strings", label: "Strings", badgeVariant: "category" },
    ];

export default function QuestionRepo() {
    const [questionList, setQuestionList] = useState<Question[]>([]); // Complete list of questions
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_QUESTION_API_BASE_URL}/all`, {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();

                // Map backend data to match the frontend Question type
                const mappedQuestions: Question[] = data.map((q: {id: number, title: string, complexity: string, category: string[], summary: string, description: string, link: string,selected: boolean}) => ({
                    id: q.id,
                    title: q.title,
                    complexity: complexityList.find(
                        (complexity) => complexity.value === q.complexity.toLowerCase()
                    )?.value,
                    categories: q.category.sort((a: string, b: string) => a.localeCompare(b)),
                    summary: q.summary,
                    description: q.description,
                    link: q.link,
                    selected: false, // Set selected to false initially
                }));
                console.log("question list: ", mappedQuestions)
                setQuestionList(mappedQuestions); // Set the fetched data to state
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions from server:", error);
            }
        }

        fetchQuestions();
    }, []);

    return (
        <div className="min-h-screen p-4 bg-white">
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="text-2xl font-bold font-brand tracking-tight text-brand-700"
                        prefetch={false}
                    >
                        PeerPrep
                    </Link>
                    {process.env.NODE_ENV == "development" && (
                        <Badge variant="dev" className="ml-2 font-brand">
                            DEV
                        </Badge>
                    )}
                </div>
                <div className="hidden desktop:flex items-center gap-4">
                    <nav className="flex items-center gap-10 font-brand">
                        <Link href="/questions" className="text-lg font-semibold uppercase text-gray-700/50 hover:text-gray-700 transition duration-100" prefetch={false}>
                            Questions
                        </Link>
                        <Link href="/question-repo" className="text-lg font-semibold uppercase text-gray-700 drop-shadow-md" prefetch={false}>
                            Repository
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full text-gray-400 transition duration-100 hover:text-gray-400 hover:bg-white hover:border-2"
                                >
                                    <User className="" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="font-sans">
                                <DropdownMenuLabel>Username</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link href="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>
            </header>

            <main className="mx-auto p-12">
                <div className="mb-12"><span className="font-serif font-light text-4xl text-primary tracking-tight">Question Repository</span></div>
                <DataTable columns={columns(setQuestionList)} data={questionList} setData={setQuestionList} loading={loading}/>
            </main>
        </div>
    );
}
