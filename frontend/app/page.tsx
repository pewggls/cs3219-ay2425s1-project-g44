"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { Flag, MessageSquareText } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const difficultyList: Array<{ value: string; label: string; badgeVariant: BadgeProps["variant"] }> = [
  { value: "easy", label: "Easy", badgeVariant: "diffEasy" },
  { value: "medium", label: "Medium", badgeVariant: "diffMedium" },
  { value: "hard", label: "Hard", badgeVariant: "diffHard" },
];

const topicList: Array<{ value: string; label: string; badgeVariant: BadgeProps["variant"] }> = [
  { value: "algorithms", label: "Algorithms", badgeVariant: "topic" },
  { value: "arrays", label: "Arrays", badgeVariant: "topic" },
  { value: "bitmanipulation", label: "Bit Manipulation", badgeVariant: "topic" },
  { value: "brainteaser", label: "Brain Teaser", badgeVariant: "topic" },
  { value: "databases", label: "Databases", badgeVariant: "topic" },
  { value: "datastructures", label: "Data Structures", badgeVariant: "topic" },
  { value: "recursion", label: "Recursion", badgeVariant: "topic" },
  { value: "strings", label: "Strings", badgeVariant: "topic" },
];

const questionList = [
  {
    id: 1,
    title: "Question 1",
    difficulty: difficultyList.find(diff => diff.value === "easy")?.label,
    topics: [topicList.find(topic => topic.value === "algorithms")?.label],
    summary: "Short summary of question 1",
    selected: false,
  },
  {
    id: 2,
    title: "Question 2 with a long title which might take 2 lines or more",
    difficulty: difficultyList.find(diff => diff.value === "hard")?.label,
    topics: [topicList.find(topic => topic.value === "arrays")?.label, topicList.find(topic => topic.value === "algorithms")?.label],
    summary: "Short summary of question 2",
    selected: true,
  },
  {
    id: 3,
    title: "Question 3",
    difficulty: difficultyList.find(diff => diff.value === "medium")?.label,
    topics: [topicList.find(topic => topic.value === "brainteaser")?.label],
    summary: "Slightly longer but still short summary of question 3",
    selected: true,
  },
  {
    id: 4,
    title: "Question 4",
    difficulty: difficultyList.find(diff => diff.value === "easy")?.label,
    topics: [topicList.find(topic => topic.value === "datastructures")?.label],
    summary: "Short summary of question 4",
    selected: false,
  },
  {
    id: 5,
    title: "Question 5",
    difficulty: difficultyList.find(diff => diff.value === "hard")?.label,
    topics: [topicList.find(topic => topic.value === "databases")?.label],
    summary: "Short summary of question 5",
    selected: false,
  },
  {
    id: 6,
    title: "Question 6",
    difficulty: difficultyList.find(diff => diff.value === "easy")?.label,
    topics: [topicList.find(topic => topic.value === "strings")?.label, topicList.find(topic => topic.value === "algorithms")?.label],
    summary: "Short summary of question 6",
    selected: false,
  },
  {
    id: 7,
    title: "Question 7",
    difficulty: difficultyList.find(diff => diff.value === "medium")?.label,
    topics: [topicList.find(topic => topic.value === "arrays")?.label, topicList.find(topic => topic.value === "datastructures")?.label],
    summary: "Short summary of question 7",
    selected: true,
  },
  {
    id: 8,
    title: "Question 8",
    difficulty: difficultyList.find(diff => diff.value === "hard")?.label,
    topics: [topicList.find(topic => topic.value === "algorithms")?.label],
    summary: "Short summary of question 8",
    selected: false,
  },
  {
    id: 9,
    title: "Question 9",
    difficulty: difficultyList.find(diff => diff.value === "easy")?.label,
    topics: [topicList.find(topic => topic.value === "strings")?.label, topicList.find(topic => topic.value === "recursion")?.label],
    summary: "Short summary of question 9",
    selected: false,
  },
  {
    id: 10,
    title: "Question 10",
    difficulty: difficultyList.find(diff => diff.value === "medium")?.label,
    topics: [topicList.find(topic => topic.value === "arrays")?.label],
    summary: "Short summary of question 10",
    selected: true,
  },
];

export default function Home() {
  const [selectedDifficuties, setSelectedDifficuties] = useState<string[]>(["easy", "medium", "hard"]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["arrays", "strings"]);
  
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="min-h-screen p-4 bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {/* <CodeIcon className="w-6 h-6 text-purple-600" /> */}
          <Link href="#" className="text-2xl font-bold font-branding text-brand-700" prefetch={false}>PeerPrep</Link>
          {process.env.NODE_ENV == "development" && (<Badge variant="dev" className="ml-2">DEV</Badge>)}
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 font-branding">
            <Link href="#" className="text-lg font-bold" prefetch={false}>
              QUESTIONS
            </Link>
            <Link href="#" className="text-lg font-medium text-muted-foreground" prefetch={false}>
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

      <main className="flex flex-col md:flex-row p-4 md:p-8 gap-8 font-sans text-black">
        <div className="flex-1 overflow-auto md:w-1/2 md:mx-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex flex-col gap-2 2xl:flex-row">
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
              />
              <MultiSelect
                options={topicList}
                onValueChange={setSelectedTopics}
                defaultValue={selectedTopics}
                placeholder="Select topics"
                variant="inverted"
                animation={2}
                maxCount={2}
                selectIcon={MessageSquareText}
                className={"font-sans"}
              />
            </div>
            <Button variant="outline" className="uppercase">Select All</Button>
          </div>
          <div className="space-y-4 overflow-auto h-[75vh]">
            {questionList.map((question) => (
              <div key={question.id} className="relative">
                <Card className="flex items-start p-4 w-full cursor-pointer">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-semibold">{question.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={`diff${question.difficulty}` as BadgeProps["variant"]}>{question.difficulty}</Badge>
                      {question.topics.map((topic, index) => (
                        <Badge key={index} variant="topic">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{question.summary}</p>
                  </div>
                  <Button variant={question.selected ? "default" : "outline"} className="ml-4">
                    {question.selected ? "Selected" : "Select"}
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2 p-4 border rounded-md">
          <h3 className="text-xl font-serif font-semibold">Question 2 with a long title which might take 2 lines or more</h3>
          <div className="flex items-center gap-10 mt-2">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-icon" />
              <Badge variant="default" className="uppercase text-diff-hard-text bg-diff-hard-bg">
                Hard
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-icon" />
              <Badge variant="default" className="uppercase text-topic-text bg-topic-bg">
                Arrays
              </Badge>
              <Badge variant="default" className="uppercase text-topic-text bg-topic-bg">
                Algorithms
              </Badge>
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground">Long description of question 2</p>
          <p className="mt-2 text-sm text-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque enim est, fermentum sit amet varius a,
            vehicula eget ipsum. Fusce pharetra venenatis urna eget aliquet. Etiam vel mi sapien. Morbi elementum semper
            mauris, eget venenatis nibh dictum sit amet. Quisque sodales magna id turpis commodo volutpat. Donec congue
            erat erat, gravida scelerisque justo pharetra eu. Morbi lacinia viverra scelerisque. Maecenas augue nisl,
            tristique ut ultricies quis, bibendum dictum quam. Nam iaculis mauris et efficitur imperdiet. Quisque
            pretium blandit varius. Suspendisse non sapien fringilla, pellentesque sapien sit amet, porttitor felis. Sed
            commodo, ante a vehicula ullamcorper, felis lacus pulvinar velit, et auctor ipsum metus et enim. Etiam
            efficitur consectetur egestas.
            <br></br>
            Quisque id eros at ante efficitur pharetra. Aliquam maximus, orci et vulputate rhoncus, est nisl malesuada
            turpis, nec ullamcorper turpis est sit amet libero. Nunc sed enim elementum, lobortis tortor in, ultrices
            lacus. Nam leo eros, ullamcorper vitae gravida nec, sagittis sed metus. Praesent diam ante, blandit id odio
            sit amet, viverra posuere eros. Praesent tempor bibendum vestibulum. Duis at lacinia felis, vel interdum
            odio. Etiam ullamcorper sagittis purus vitae tristique. Proin posuere elit sed augue aliquam eleifend. In
            vitae ante id augue posuere finibus eget at magna. Praesent sit amet magna at purus pretium egestas. Mauris
            cursus tincidunt interdum.
            <br></br>
            Duis sapien nunc, tristique et ligula ut, lacinia lacinia velit. Nulla vel varius nulla. Pellentesque eget
            odio sapien. Nullam vitae ex diam. In at cursus ex, vel placerat sem. Aliquam augue odio, tincidunt quis
            congue eget, consequat eu turpis. Integer volutpat, orci eget gravida efficitur, mi est bibendum nisl, non
            bibendum velit nisi et purus. Maecenas in purus vel metus ullamcorper sodales. Integer scelerisque, nunc ac
            volutpat tincidunt, tortor urna bibendum orci, eget auctor nisi orci ut risus. Donec a mi euismod, pulvinar
            erat at, tincidunt arcu. Nam sit amet odio ut ante tincidunt rutrum. Suspendisse potenti. Cras suscipit,
            eros id lacinia tincidunt, velit justo suscipit lorem, at mollis quam mi ut velit.
          </p>
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
