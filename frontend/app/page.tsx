"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Flag, MessageSquareText } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const difficultyList = [
  { value: "easy", label: "Easy", className: "bg-diff-easy-bg text-diff-easy-text" },
  { value: "medium", label: "Medium", className: "bg-diff-medium-bg text-diff-medium-text" },
  { value: "hard", label: "Hard", className: "bg-diff-hard-bg text-diff-hard-text" },
];

const topicList = [
  { value: "algorithms", label: "Algorithms", className: "bg-topic-bg text-topic-text" },
  { value: "arrays", label: "Arrays", className: "bg-topic-bg text-topic-text" },
  { value: "bitmanipulation", label: "Bit Manipulation", className: "bg-topic-bg text-topic-text" },
  { value: "brainteaser", label: "Brain Teaser", className: "bg-topic-bg text-topic-text" },
  { value: "databases", label: "Databases", className: "bg-topic-bg text-topic-text" },
  { value: "datastructures", label: "Data Structures", className: "bg-topic-bg text-topic-text" },
  { value: "recursion", label: "Recursion", className: "bg-topic-bg text-topic-text" },
  { value: "strings", label: "Strings", className: "bg-topic-bg text-topic-text" },
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
            <Button variant="outline">SELECT ALL</Button>
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
