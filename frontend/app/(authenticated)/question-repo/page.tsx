"use client"

import { useEffect, useState } from "react";
import { columns, Question } from "./columns"
import { DataTable } from "./data-table"
import { BadgeProps } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
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
                const mappedQuestions: Question[] = data.map((q: {id: number, title: string, complexity: string, category: string[], description: string, link: string,selected: boolean}) => ({
                    id: q.id,
                    title: q.title,
                    complexity: complexityList.find(
                        (complexity) => complexity.value === q.complexity.toLowerCase()
                    )?.value,
                    categories: q.category.sort((a: string, b: string) => a.localeCompare(b)),
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
    }, [setQuestionList, setLoading]);

    const handleProfileRedirect = () => {
        router.push('/profile'); // Update with your actual profile page path
    };

    return (
        <main className="flex flex-col min-h-screen px-20 pt-24 pb-10">
            <div className="mb-10"><span className="font-serif font-light text-4xl text-primary tracking-tight">Question Repository</span></div>
            <DataTable columns={columns(setQuestionList)} data={questionList} setData={setQuestionList} loading={loading}/>
        </main>
    );
}
