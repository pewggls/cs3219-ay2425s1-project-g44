"use client";

import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { MultiSelect } from "@/components/ui/multi-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronsRight, Flag, MessageSquareText, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

export default function Questions() {
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
    
    const [isMatching, setIsMatching] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [matchTime, setMatchTime] = useState(0);
    const [redirectTime, setRedirectTime] = useState(5);
    const matchTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isMatchFoundDialogOpen, setMatchFoundDialogOpen] = useState(false);
    const [isMatchFailDialogOpen, setMatchFailDialogOpen] = useState(false);

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
                const mappedQuestions: Question[] = data.map((q: { id: number, title: string, complexity: string, category: string[], description: string, link: string, selected: boolean }) => ({
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
            const filtersRect = filtersElement.getBoundingClientRect();
            const totalHeight = filtersRect.bottom;
            setFiltersHeight(totalHeight + 16);
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

    const handleMatch = useCallback(() => {
        setIsMatching(prev => !prev);
        setIsHovering(false);
    }, []);

    useEffect(() => {
        if (isMatching) {
            setMatchTime(0);
            matchTimerRef.current = setInterval(() => {
                setMatchTime((prevTime) => {
                    if (prevTime >= 32) { // we use 32 so there is buffer
                        clearInterval(matchTimerRef.current as NodeJS.Timeout);
                        setMatchFailDialogOpen(true);
                        // setMatchFoundDialogOpen(true);  use this to open match found dialog
                        return 32;
                    }
                    return prevTime + 1;
                });
            }, 1000);
        } else {
            if (matchTimerRef.current) {
                clearInterval(matchTimerRef.current);
            }
            setMatchTime(0);
        }
    }, [isMatching]);   

    useEffect(() => {
        if (isMatchFoundDialogOpen) {
            setRedirectTime(5);
            const redirectTimer = setInterval(() => {
                setRedirectTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(redirectTimer);
                        // router.push('/questions');  Redirect to question page
                        setMatchFoundDialogOpen(false);
                        setIsMatching(false);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
    
            return () => clearInterval(redirectTimer);
        }
    }, [isMatchFoundDialogOpen, router]);
    
    useEffect(() => {
        if (isMatchFailDialogOpen) {
            setRedirectTime(5);
            const redirectTimer = setInterval(() => {
                setRedirectTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(redirectTimer);
                        setMatchFailDialogOpen(false);
                        setIsMatching(false);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
    
            return () => clearInterval(redirectTimer);
        }
    }, [isMatchFailDialogOpen, router]);

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
    }, []);

    return (
        <main className="flex min-h-screen flex-row px-4 mx-8 mt-0 pt-0 gap-4 font-sans text-black">
            <div className="flex-1 overflow-auto desktop:w-1/2 desktop:mx-auto">
                <div className="relative h-screen">
                    <div
                        id="filters"
                        className="absolute top-0 left-0 right-0 hidden tablet:flex gap-2 desktop:ml-8 desktop:mr-10 tablet:mt-16 desktop:mt-24 p-2 tablet:rounded-3xl bg-opacity-90 backdrop-blur desktop:drop-shadow-xl bg-white z-10"
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
                                {isSelectAll ? "Remove all" : "Add all"}
                            </Button>
                        )}
                    </div>

                    <ScrollArea
                        className="h-screen"
                        barOffset={filtersHeight}
                        type="hover"
                    >
                        <div className="flex flex-col gap-2 overflow-auto pl-4 pr-4 pb-4" style={{ paddingTop: `${filtersHeight}px` }}>
                            {filteredQuestions.length == 0 ? (
                                <div className="flex flex-col pt-80 gap-6 items-center justify-center text-center">
                                    <p className="text-base">No questions found</p>
                                    <Button onClick={resetFilters}>Reset filters</Button>
                                </div>
                            ) : (
                                filteredQuestions.map((question) => (
                                    <div id="qns" key={question.id} className="relative mr-2">
                                        <Card
                                            className="rounded-lg flex items-start border-none shadow-none p-4 w-full cursor-pointer hover:drop-shadow-question-card transition ease-in-out"
                                            onClick={() => setSelectedViewQuestion(question)}
                                        >
                                            <div className="flex-1">
                                                <h3 className="text-xl font-serif font-semibold tracking-tight">
                                                    {question.id}. {question.title}
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
                                                    size="sm"
                                                onClick={() => handleSelectQuestion(question.id)}
                                            >
                                                    {question.selected ? (
                                                        <div className="flex justify-center items-center"><Check className="h-4 w-4 mr-2" />Added</div>
                                                    ) : (
                                                        <div className="flex justify-center items-center"><Plus className="h-4 w-4 mr-2" />Add</div>
                                                    )}
                                            </Button>
                                        </Card>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <div className="hidden mt-24 mb-8 desktop:w-1/2 desktop:flex desktop:flex-col space-y-4 px-4">
                <div className="flex gap-4 justify-between items-end">
                    <div className="flex flex-col w-[70%] items-start text-sm">
                        <div className="font-medium pb-1.5 pl-2.5">Questions added for matching</div>
                        {questionList.filter((question) => question.selected).length == 0 ? (
                            <div className="flex p-1 h-20 w-full bg-gray-50 rounded-xl text-xs text-muted-foreground items-center justify-center">No questions added for matching</div>
                        ) : (
                            <div className="w-full p-1 h-20 bg-gray-50 rounded-xl">
                                <ScrollArea type="auto" barOffset={1} className="h-full">
                                    <div className="flex flex-wrap gap-0.5 mr-4">
                                        {questionList
                                            .filter((question) => question.selected)
                                            .map((question) => (
                                                <HoverCard key={question.id} openDelay={300}>
                                                    <HoverCardTrigger>
                                                        <Badge variant={question.complexity as BadgeProps["variant"]} className="w-fit">
                                                            {question.title}
                                                        </Badge>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="rounded-xl p-2 w-fit">
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquareText className="h-4 w-4 text-icon" />
                                                            {question.categories.map((category) => (
                                                                <Badge
                                                                    key={category}
                                                                    variant="category"
                                                                    className="uppercase text-category-text bg-category-bg"
                                                                >
                                                                    {category}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            ))}

                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                    <div className="">
                        <Button
                            variant="match"
                            className={cn(
                                "group min-w-[150px] max-w-[150px] font-brand uppercase",
                                isMatching && !isHovering && "bg-brand-600 hover:bg-brand-600 text-white",
                                isMatching && isHovering && "text-destructive-foreground hover:bg-destructive/90"
                            )}
                            onClick={handleMatch}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {isMatching 
                                ? (isHovering ? 'Cancel' : 'Matching') 
                                : 'Match'}
                            {isMatching ? (
                                isHovering ? (
                                    <X className="ml-2" />
                                ) : (
                                    <span className="ml-3 text-white/60 lowercase font-mono">{Math.min(matchTime, 30)}s</span>
                                )
                            ) : (
                                <ChevronsRight className="ml-2 group-hover:translate-x-2 transition" />
                            )}
                        </Button>
                    </div>
                </div>
                <div className="bg-white drop-shadow-question-details rounded-xl p-6 h-full">
                    {!selectedViewQuestion ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Click on a question to view its details</div>
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

                <Dialog open={isMatchFoundDialogOpen}>
                    <DialogTrigger />
                    <DialogContent
                        className="laptop:max-w-[40vw] bg-white text-black font-sans rounded-2xl [&>button]:hidden"
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onInteractOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                    >
                        <DialogHeader className="items-start">
                        <DialogTitle className="font-serif font-normal tracking-tight text-3xl">
                            Match found
                        </DialogTitle>
                        <DialogDescription className="hidden"></DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col w-full gap-2 py-4 justify-start">
                            <p>A match has been found!</p>
                            <p>Redirecting you back to the question page in {redirectTime} {redirectTime === 1 ? "second" : "seconds"}</p>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isMatchFailDialogOpen}>
                    <DialogTrigger />
                    <DialogContent
                        className="laptop:max-w-[40vw] bg-white text-black font-sans rounded-2xl [&>button]:hidden"
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onInteractOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                    >
                        <DialogHeader className="items-start">
                        <DialogTitle className="font-serif font-normal tracking-tight text-3xl">
                            Match not found
                        </DialogTitle>
                        <DialogDescription className="hidden"></DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col w-full gap-2 py-4 justify-start">
                            <p>Please try again.</p>
                            <p>Redirecting you back to the question page in {redirectTime} {redirectTime === 1 ? "second" : "seconds"}...</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </main>
    );
}