"use client"

import { useEffect, useState } from "react";
import { columns, Question } from "./questions/columns"
import { DataTable } from "./questions/data-table"
import { Badge, BadgeProps } from "@/components/ui/badge";
import Link from "next/link";

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

export default function Home() {
    const [questionList, setQuestionList] = useState<Question[]>([]); // Complete list of questions

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch("http://localhost:2000/questions/all", {
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
            } catch (error) {
                console.error("Error fetching questions from server:", error);

                // remove this once api is ready
                // try {
                //     const response = await fetch("/data/question.json", {  // place in /public/data/question.json
                //         cache: "no-store",
                //     });
                //     const data = await response.json();

                //     // Map backend data to match the frontend Question type
                //     const mappedQuestions: Question[] = data.questions.map((q: any) => ({
                //         id: q.id,
                //         title: q.title,
                //         complexity: complexityList.find(
                //             (complexity) => complexity.value === q.complexity.toLowerCase()
                //         )?.value,
                //         categories: q.categories.sort((a: string, b: string) => a.localeCompare(b)),
                //         summary: q.summary,
                //         description: q.description,
                //         link: q.link,
                //         selected: false, // Set selected to false initially
                //     }));

                //     setQuestionList(mappedQuestions); // Set the fetched data to state
                // } catch (error) {
                //     console.error("Error fetching questions from local file:", error);
                // }
            }
        }

        fetchQuestions();
    }, []);

    return (
        <div className="min-h-screen p-4 bg-white">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    {/* <CodeIcon className="w-6 h-6 text-purple-600" /> */}
                    <Link
                        href="#"
                        className="text-2xl font-bold font-branding tracking-tight text-brand-700"
                        prefetch={false}
                    >
                        PeerPrep
                    </Link>
                    {process.env.NODE_ENV == "development" && (
                        <Badge variant="dev" className="ml-2 font-branding">
                            DEV
                        </Badge>
                    )}
                </div>
                <div className="hidden desktop:flex items-center gap-4">
                    <nav className="flex items-center gap-4 font-branding">
                        <div className="mr-8">
                            <Link href="#" className="text-lg font-semibold text-gray-700" prefetch={false}>
                                QUESTIONS
                            </Link>
                        </div>
                        {/* <Button variant="ghost" size="icon" className="rounded-full hover:text-brand-400">
                            <Avatar>
                                <AvatarImage src="/placeholder-user.jpg" alt="CR" />
                                <AvatarFallback className="font-branding bg-brand-600">CR</AvatarFallback>
                            </Avatar>
                        </Button> */}
                    </nav>
                </div>
            </header>

            <main className="mx-auto p-12">
                <div className="mb-12"><span className="font-serif font-light text-4xl text-primary tracking-tight">Question Repository</span></div>
                <DataTable columns={columns(setQuestionList)} data={questionList} setData={setQuestionList}/>
            </main>
        </div>
    )
}
