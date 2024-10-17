"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flag, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Question = {
    id: number;
    title: string;
    complexity: string | undefined;
    categories: (string | undefined)[];
    description: string;
    selected: boolean;
};

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
    const router = useRouter();
    const [selectedComplexities, setSelectedComplexities] = useState<string[]>(
        complexityList.map((diff) => diff.value)
    );
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        categoryList.map((category) => category.value)
    );
    const [filtersHeight, setFiltersHeight] = useState(0);
    const [questionList, setQuestionList] = useState<Question[]>([]); // Complete list of questions
    const [selectedViewQuestion, setSelectedViewQuestion] =
        useState<Question | null>(null);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [reset, setReset] = useState(false);

    // authenticate user else redirect them to login page
    useEffect(() => {
        const authenticateUser = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    router.push('/'); // Redirect to login if no token
                    return;
                }

                // Call the API to verify the token
                const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/verify-token`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    localStorage.removeItem("token"); // remove invalid token from browser
                    router.push('/'); // Redirect to login if not authenticated
                    return;
                }

                const data = (await response.json()).data;
                
                // if needed
                // setUsername(data.username);
                // setEmail(data.email);
                // form.setValue("username", data.username);
                // form.setValue("email", data.email);
                // userId.current = data.id;
            } catch (error) {
                console.error('Error during authentication:', error);
                router.push('/login'); // Redirect to login in case of any error
            }
    };
    authenticateUser();
    }, []);

    // Fetch questions from backend API
    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_QUESTION_API_BASE_URL}/all`, {
                    cache: "no-store",
                });
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

                setQuestionList(mappedQuestions); // Set the fetched data to state
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        }

        fetchQuestions();
    }, []);

    useEffect(() => {
        const filtersElement = document.getElementById("filters");
        if (filtersElement) {
            setFiltersHeight(filtersElement.offsetHeight);
        }
    }, []);

    // Handle filtered questions based on user-selected complexities and categories
    const filteredQuestions = questionList.filter((question) => {
        const selectedcategoryLabels = selectedCategories.map(
            (categoryValue) =>
                categoryList.find((category) => category.value === categoryValue)?.label
        );

        const matchesComplexity =
            selectedComplexities.length === 0 ||
            (question.complexity &&
                selectedComplexities.includes(question.complexity));

        const matchesCategories =
            selectedCategories.length === 0 ||
            selectedcategoryLabels.some((category) => question.categories.includes(category));

        return matchesComplexity && matchesCategories;
    });

    // Function to reset filters
    const resetFilters = () => {
        setSelectedComplexities(complexityList.map((diff) => diff.value));
        setSelectedCategories(categoryList.map((category) => category.value));
        setReset(true);
    };

    // Function to handle "Select All" button click
    const handleSelectAll = () => {
        const newIsSelectAll = !isSelectAll;
        setIsSelectAll(newIsSelectAll);

        // Toggle selection of all questions
        const updatedQuestions = questionList.map((question) =>
            filteredQuestions.map((f_qns) => f_qns.id).includes(question.id)
                ? {
                    ...question,
                    selected: newIsSelectAll, // Select or unselect all questions
                }
                : question
        );
        setQuestionList(updatedQuestions);
    };

    // Function to handle individual question selection
    const handleSelectQuestion = (id: number) => {
        const updatedQuestions = questionList.map((question) =>
            question.id === id
                ? { ...question, selected: !question.selected }
                : question
        );
        setQuestionList(updatedQuestions);
    };

    useEffect(() => {
        const allSelected =
            questionList.length > 0 && questionList.every((q) => q.selected);
        const noneSelected =
            questionList.length > 0 && questionList.every((q) => !q.selected);

        if (allSelected) {
            setIsSelectAll(true);
        } else if (noneSelected) {
            setIsSelectAll(false);
        }
    }, [questionList]);

    useEffect(() => {
        if (filteredQuestions.length === 0) {
            setSelectedViewQuestion(null);
        }
    }, [filteredQuestions]);


    useEffect(() => {
        console.log("Selected complexities:", selectedComplexities);
    }, [selectedComplexities]); // This effect runs every time selectedcomplexities change 

    const handleProfileRedirect = () => {
        router.push('/profile'); // Update with your actual profile page path
    };

    return (
        // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="min-h-screen p-4 bg-white">
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
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
                    <nav className="flex items-center gap-10 font-branding">
                        <Link href="" className="text-lg font-semibold uppercase text-gray-700 drop-shadow-md" prefetch={false}>
                            Questions
                        </Link>
                        <Link href="/question-repo" className="text-lg font-semibold uppercase text-gray-700/50 hover:text-gray-700 transition duration-150" prefetch={false}>
                            Repository
                        </Link>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleProfileRedirect}>
                            <Avatar>
                                <AvatarImage src="/placeholder-user.jpg" alt="CR" />
                                <AvatarFallback className="font-branding">CR</AvatarFallback>
                            </Avatar>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex flex-col desktop:flex-row p-2 desktop:mx-8 desktop:mt-0 desktop:pt-0 gap-4 font-sans text-black">
                <div className="flex-1 overflow-auto desktop:w-1/2 desktop:mx-auto">
                    <div className="relative h-[90vh]">
                        <div
                            id="filters"
                            className="absolute top-0 left-0 right-0 hidden tablet:flex gap-2 desktop:ml-8 desktop:mr-10 desktop:mt-2 p-2 desktop:rounded-3xl bg-opacity-90 backdrop-blur desktop:drop-shadow-xl bg-white z-10"
                        >

                            <div className="flex grow flex-col gap-2 2xl:flex-row">
                                <MultiSelect
                                    options={complexityList}
                                    onValueChange={setSelectedComplexities}
                                    defaultValue={selectedComplexities}
                                    placeholder="Select complexities"
                                    variant="inverted"
                                    animation={2}
                                    maxCount={3}
                                    selectIcon={Flag}
                                    className={"font-sans"}
                                    reset={reset}
                                    onResetComplete={setReset}
                                />
                                <MultiSelect
                                    options={categoryList}
                                    onValueChange={setSelectedCategories}
                                    defaultValue={selectedCategories}
                                    placeholder="Select categories"
                                    variant="inverted"
                                    animation={2}
                                    maxCount={1}
                                    selectIcon={MessageSquareText}
                                    className={"font-sans"}
                                    reset={reset}
                                    onResetComplete={setReset}
                                />
                            </div>
                            {filteredQuestions.length > 0 && (
                                <Button
                                    variant="outline"
                                    className="uppercase rounded-3xl"
                                    onClick={handleSelectAll}
                                >
                                    {isSelectAll ? "Deselect All" : "Select All"}
                                </Button>
                            )}
                        </div>

                        <ScrollArea
                            className="h-[90vh]"
                            barOffset={filtersHeight + 24}
                            type="hover"
                        >
                            <div className="space-y-1 overflow-auto mr-2">
                                <div
                                    className="hidden tablet:block mb-6"
                                    style={{ height: `${filtersHeight}px` }}
                                ></div>
                                {filteredQuestions.length == 0 ? (
                                    <div className="flex flex-col pt-80 gap-6 items-center justify-center text-center">
                                        <p className="text-base">No questions found</p>
                                        <Button onClick={resetFilters}>Reset filters</Button>
                                    </div>
                                ) : (
                                    filteredQuestions.map((question) => (
                                        <div id="qns" key={question.id} className="relative mr-2">
                                            <Card
                                                className="rounded-lg flex items-start border-none shadow-none p-4 w-full cursor-pointer hover:bg-gray-100 transition ease-in-out duration-150"
                                                onClick={() => setSelectedViewQuestion(question)}
                                            >
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-serif font-semibold tracking-tight">
                                                        {question.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Badge
                                                            variant={
                                                                `${question.complexity}` as BadgeProps["variant"]
                                                            }
                                                        >
                                                            {question.complexity}
                                                        </Badge>
                                                        {question.categories.map((category, index) => (
                                                            <Badge key={index} variant="category">
                                                                {category}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant={question.selected ? "default" : "outline"}
                                                    className="ml-4"
                                                    onClick={() => handleSelectQuestion(question.id)}
                                                >
                                                    {question.selected ? "Selected" : "Select"}
                                                </Button>
                                            </Card>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                <div className="hidden desktop:block desktop:w-1/2 mt-8 p-4 border rounded-xl">
                    {!selectedViewQuestion ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Select a question to view</div>
                    ) : (
                        <div className="desktop:flex desktop:flex-col">
                            <h3 className="text-2xl font-serif font-medium tracking-tight">
                                {selectedViewQuestion.title}
                            </h3>
                            <div className="flex items-center gap-10 mt-3">
                                <div className="flex items-center gap-2">
                                    <Flag className="h-4 w-4 text-icon" />
                                    <Badge
                                        variant={
                                            selectedViewQuestion.complexity as BadgeProps["variant"]
                                        }
                                    >
                                        {selectedViewQuestion.complexity}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquareText className="h-4 w-4 text-icon" />
                                    {selectedViewQuestion.categories.map((category) => (
                                        <Badge
                                            key={category}
                                            variant="category"
                                            className="uppercase text-category-text bg-category-bg"
                                        >
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <p className="mt-8 text-sm text-foreground">
                                {selectedViewQuestion.description}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}