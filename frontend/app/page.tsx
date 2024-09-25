"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flag, MessageSquareText } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type Question = {
  id: number;
  title: string;
  difficulty: string | undefined;
  topics: (string | undefined)[];
  summary: string | null;
  description: string;
  selected: boolean;
};

const difficultyList: Array<{
  value: string;
  label: string;
  badgeVariant: BadgeProps["variant"];
}> = [
  { value: "easy", label: "Easy", badgeVariant: "easy" },
  { value: "medium", label: "Medium", badgeVariant: "medium" },
  { value: "hard", label: "Hard", badgeVariant: "hard" },
];

const topicList: Array<{
  value: string;
  label: string;
  badgeVariant: BadgeProps["variant"];
}> = [
  { value: "algorithms", label: "Algorithms", badgeVariant: "topic" },
  { value: "arrays", label: "Arrays", badgeVariant: "topic" },
  {
    value: "bitmanipulation",
    label: "Bit Manipulation",
    badgeVariant: "topic",
  },
  { value: "brainteaser", label: "Brainteaser", badgeVariant: "topic" },
  { value: "databases", label: "Databases", badgeVariant: "topic" },
  { value: "datastructures", label: "Data Structures", badgeVariant: "topic" },
  { value: "recursion", label: "Recursion", badgeVariant: "topic" },
  { value: "strings", label: "Strings", badgeVariant: "topic" },
];

export default function Home() {
  const [selectedDifficuties, setSelectedDifficuties] = useState<string[]>(
    difficultyList.map((diff) => diff.value)
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    topicList.map((topic) => topic.value)
  );
  const [filtersHeight, setFiltersHeight] = useState(0);
  const [questionList, setQuestionList] = useState<Question[]>([]); // Complete list of questions
  const [selectedViewQuestion, setSelectedViewQuestion] =
    useState<Question | null>(null);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [reset, setReset] = useState(false);

  // Fetch questions from backend API
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("http://localhost:5000/questions", {
          cache: "no-store",
        });
        const data = await response.json();

        // Map backend data to match the frontend Question type
        const mappedQuestions: Question[] = data.questions.map((q: any) => ({
          id: q.id,
          title: q.title,
          difficulty: difficultyList.find(
            (diff) => diff.value === q.complexity.toLowerCase()
          )?.value,
          topics: q.category,
          summary: q.summary,
          description: q.description,
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

  // Handle filtered questions based on user-selected difficulties and topics
  const filteredQuestions = questionList.filter((question) => {
    const selectedTopicLabels = selectedTopics.map(
      (topicValue) =>
        topicList.find((topic) => topic.value === topicValue)?.label
    );

    const matchesDifficulty =
      selectedDifficuties.length === 0 ||
      (question.difficulty &&
        selectedDifficuties.includes(question.difficulty));

    const matchesTopics =
      selectedTopics.length === 0 ||
      selectedTopicLabels.some((topic) => question.topics.includes(topic));

    return matchesDifficulty && matchesTopics;
  });

  // Function to reset filters
  const resetFilters = () => {
    setSelectedDifficuties(difficultyList.map((diff) => diff.value));
    setSelectedTopics(topicList.map((topic) => topic.value));
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
    filteredQuestions.length == 0 ? setSelectedViewQuestion(null) : null;
  }, [filteredQuestions]);


  useEffect(() => {
    console.log("Selected difficulties:", selectedDifficuties);
  }, [selectedDifficuties]); // This effect runs every time selectedDifficulties change 

  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="min-h-screen p-4 bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {/* <CodeIcon className="w-6 h-6 text-purple-600" /> */}
          <Link
            href="#"
            className="text-2xl font-bold font-branding text-brand-700"
            prefetch={false}
          >
            PeerPrep
          </Link>
          {process.env.NODE_ENV == "development" && (
            <Badge variant="dev" className="ml-2">
              DEV
            </Badge>
          )}
        </div>
        <div className="hidden desktop:flex items-center gap-4">
          <nav className="flex items-center gap-4 font-branding">
            <Link href="#" className="text-lg font-bold" prefetch={false}>
              QUESTIONS
            </Link>
            <Link
              href="#"
              className="text-lg font-medium text-muted-foreground"
              prefetch={false}
            >
              SOLUTIONS
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="CR" />
                <AvatarFallback className="font-branding">CR</AvatarFallback>
              </Avatar>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex flex-col desktop:flex-row p-2 desktop:p-8 gap-4 font-sans text-black">
        <div className="flex-1 overflow-auto desktop:w-1/2 desktop:mx-auto">
          <div className="relative h-[80vh]">
            <div
              id="filters"
              className="absolute top-0 left-0 right-0 hidden tablet:flex gap-2 desktop:ml-8 desktop:mr-10 desktop:mt-2 p-2 desktop:rounded-3xl bg-opacity-90 backdrop-blur desktop:drop-shadow-xl bg-white z-10"
            >
              
              <div className="flex grow flex-col gap-2 2xl:flex-row">
                <MultiSelect
                  options={difficultyList}
                  onValueChange={setSelectedDifficuties}
                  defaultValue={selectedDifficuties}
                  placeholder="Select difficulties"
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                  selectIcon={Flag}
                  className={"font-sans"}
                  reset={reset}
                  onResetComplete={setReset}
                />
                <MultiSelect
                  options={topicList}
                  onValueChange={setSelectedTopics}
                  defaultValue={selectedTopics}
                  placeholder="Select topics"
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
              className="h-[80vh]"
              barOffset={filtersHeight + 24}
              type="hover"
            >
              <div className="space-y-1 overflow-auto mr-2">
                <div
                  className="hidden tablet:block mb-6"
                  style={{ height: `${filtersHeight}px` }}
                ></div>
                {filteredQuestions.length == 0 ? (
                  <div className="empty-state flex flex-col items-center justify-center text-center">
                    <img
                      src="/images/NoResult.png"
                      alt="No questions found"
                      className="w-48 max-w-xs h-auto mx-auto mt-10 mb-4"
                    />
                    <p className="text-2xl mb-8">No Questions Found</p>
                    <Button onClick={resetFilters}>Reset Filters</Button>
                  </div>
                ) : (
                  filteredQuestions.map((question) => (
                    <div id="qns" key={question.id} className="relative mr-2">
                      <Card
                        className="flex items-start border-none shadow-none p-4 w-full cursor-pointer hover:bg-gray-100 transition ease-in-out duration-150"
                        onClick={() => setSelectedViewQuestion(question)}
                      >
                        <div className="flex-1">
                          <h3 className="text-xl font-serif font-semibold">
                            {question.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                `${question.difficulty}` as BadgeProps["variant"]
                              }
                            >
                              {question.difficulty}
                            </Badge>
                            {question.topics.map((topic, index) => (
                              <Badge key={index} variant="topic">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {question.summary}
                          </p>
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
        <div className="hidden desktop:block desktop:w-1/2 p-4 border rounded-md">
          {!selectedViewQuestion ? (
            <p>No question is selected.</p>
          ) : (
            <>
              <h3 className="text-xl font-serif font-semibold">
                {selectedViewQuestion.title}
              </h3>
              <div className="flex items-center gap-10 mt-2">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-icon" />
                  <Badge
                    variant={
                      selectedViewQuestion.difficulty as BadgeProps["variant"]
                    }
                  >
                    {selectedViewQuestion.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-icon" />
                  {selectedViewQuestion.topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="topic"
                      className="uppercase text-topic-text bg-topic-bg"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="mt-8 text-sm text-foreground">
                {selectedViewQuestion.description}
              </p>
            </>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a> */}
      </footer>
    </div>
  );
}
