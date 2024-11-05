"use client"

import React, { Suspense, useEffect, useState } from 'react';
import { Clock3, Flag, MessageSquareText, MicIcon, MicOffIcon, OctagonXIcon } from 'lucide-react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import SessionLoading from '../loading';
import { getCookie } from '@/app/utils/cookie-manager';

const DynamicCodeEditor = dynamic(() => import('../code-editor/code-editor'), { ssr: false });
const DynamicTextEditor = dynamic(() => import('../text-editor'), { ssr: false });

type Question = {
    id: number;
    title: string;
    complexity: string | undefined;
    category: (string | undefined)[];
    description: string;
};

export default function Session() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [isRequestSent, setIsRequestSent] = useState(false); // Flag to track if API call has been made
    const [isEndingSession, setIsEndingSession] = useState(false);
    const [controller, setController] = useState<AbortController | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        const timerInterval = setInterval(() => {
            setTimeElapsed((prevTime) => prevTime + 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    const [sessionEnded, setSessionEnded] = useState(false);

    const [question, setQuestion] = useState<Question | null>(null);

    const params = useParams<{ id: string }>()
    const searchParams = useSearchParams()
    const matchResultParam = searchParams.get('matchResult')
    
    let matchResult = null;
    let questionId = null;
    let peerUsername = null;

    if (matchResultParam) {
        try {
            matchResult = JSON.parse(decodeURIComponent(matchResultParam));
            questionId = matchResult.agreedQuestion;
            peerUsername = matchResult.peerUsername;
        } catch (error) {
            console.error('Failed to parse matchResult:', error);
        }
    }

    useEffect(() => {
        setIsClient(true);

        const fetchQuestionDetails = async (id: string) => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_QUESTION_API_BASE_URL}/byId/${questionId}`, {
                    cache: "no-store",
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch question details');
                }
    
                const data = await response.json();
                setQuestion(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load question details');
            }
        };

        if (questionId) {
            fetchQuestionDetails(questionId);
        }
    }, [questionId]);

    // const ws = new WebSocket('ws://localhost:3003');
    // ws.onopen = () => {
    //     ws.send(JSON.stringify({ type: 'join', roomId: `room-${params.id}` }));
    // };
    // ws.onmessage = (event) => {
    //     const message = JSON.parse(event.data);
    //     if (message.type === 'sessionEnded') {
    //         console.log("Session ended");
    //         setSessionEnded(true);
    //     }
    // };

    // if (sessionEnded) {
    //     ws.send(JSON.stringify({ type: 'leave', roomId: `room-${params.id}` }));
    //     ws.close();

    //     toast.info('The session has ended', {
    //         description: 'Returning you to the question page...',
    //         duration: Infinity,
    //     });

    //     setTimeout(() => {
    //         router.push('/questions');
    //     }, 3000);
    // }

    if (!isClient) {
        return SessionLoading();
    }

    const handleMicToggle = () => {
        setIsMicEnabled(!isMicEnabled);
        if (!isMicEnabled) {
            toast('Your mic is now unmuted', {
                className: "justify-center font-sans text-sm",
                duration: 1500,
                icon: <MicIcon className="h-4 w-4 mr-2 text-green-500" />,
            });
        } else {
            toast('Your mic is now muted', {
                className: "justify-center font-sans text-sm",
                duration: 1500,
                icon: <MicOffIcon className="h-4 w-4 mr-2 text-red-500" />,
            });
        }
    };

    // Update user question history before the page being unloaded
    const callUserHistoryAPI = async () => {
        if (isRequestSent) return;

        const abortController = new AbortController();
        setController(abortController);
        setIsEndingSession(true); 

        try {
            console.log('In session page: Call api to udate user question history');
            await fetch(`${process.env.NEXT_PUBLIC_USER_API_HISTORY_URL}/${getCookie('userId')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`,
                },
                body: JSON.stringify({
                    userId: getCookie('userId'),
                    questionId: "1", // TODO: one question id that user has attempted
                    timeSpent: timeElapsed,
                }),
                signal: abortController.signal,
            });
            setIsRequestSent(true);
        } catch (error) {
            console.error('Failed to update question history:', error);
        } finally {
            setIsEndingSession(false);
            setController(null);
        }
    };

    async function endSession() {
        await callUserHistoryAPI().then(() => {
            router.push('/questions');
        });
    }

    function handleCancel() {
        if (controller) {
            controller.abort(); // Cancel the API call
            setIsEndingSession(false);
        }
    }

    return (
        <Suspense fallback={SessionLoading()}>
            <div className="flex flex-col gap-8 min-h-screen">
                <div className="flex justify-between text-black bg-white drop-shadow mt-20 mx-8 p-4 rounded-xl relative">
                    <div className="flex items-center gap-2 text-sm">
                        <span>Session</span>
                        <div className="flex justify-center items-center bg-brand-200 text-brand-800 py-2 px-3 font-semibold rounded-lg"><Clock3 className="h-4 w-4 mr-2" /><div className="flex justify-center w-[40px]">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</div></div>
                        <span>with</span>
                        <span className="font-semibold">{peerUsername}</span>
                    </div>
                    <div className="mr-[52px]">
                        <Toggle 
                            onPressedChange={handleMicToggle}
                            >
                            {isMicEnabled ? (
                                <MicIcon className="size-5 text-green-500" />
                            ) : (
                                <MicOffIcon className="size-5 text-red-500" />
                            )}
                        </Toggle>
                    </div>
                    <div className="">
                        <Dialog>
                            <DialogTrigger><Button><OctagonXIcon className="size-4 mr-2" />End Session</Button></DialogTrigger>
                            <DialogContent
                                className="laptop:max-w-[40vw] bg-white text-black font-sans rounded-2xl"
                            >
                                <DialogHeader className="items-start">
                                <DialogTitle className="font-serif font-normal tracking-tight text-3xl">
                                    End your session?
                                </DialogTitle>
                                <DialogDescription className="hidden"></DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col w-full gap-1 py-4 justify-start">
                                    <p>Are you sure you want to end your session?</p>
                                </div>
                                <DialogFooter className="flex items-end">
                                    <DialogClose asChild>
                                        <Button
                                            variant="ghost"
                                            className="rounded-lg"
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        className="rounded-lg bg-brand-700 hover:bg-brand-600"
                                        onClick={endSession}
                                        disabled={isEndingSession}
                                    >
                                        End session
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <ResizablePanelGroup direction="horizontal" className="flex-grow">
                    <ResizablePanel defaultSize={50} minSize={35} maxSize={65}>
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={50} minSize={35} maxSize={65}>
                                <div className="h-[calc(100%-2rem)] overflow-auto text-black bg-white drop-shadow-question-details p-6 mx-8 rounded-xl">
                                    <h3 className="text-2xl font-serif font-medium tracking-tight">
                                        {question && question.title}
                                    </h3>
                                    <div className="flex items-center gap-10 mt-3">
                                        <div className="flex items-center gap-2">
                                            <Flag className="h-4 w-4 text-icon" />
                                            <Badge
                                                variant={
                                                    question && question.complexity!.toLowerCase() as BadgeProps["variant"]
                                                }
                                            >
                                                {question && question.complexity}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageSquareText className="h-4 w-4 text-icon" />
                                            {question && question.category.map((category) => (
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
                                        {question && question.description}
                                    </p>
                                </div>
                            </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={35} maxSize={65}>
                            <div className="h-[calc(100%-4rem)] bg-white drop-shadow-question-details rounded-xl m-8">
                                {/* <DynamicTextEditor sessionId={params.id} /> */}
                            </div>
                        </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={35} maxSize={65}>
                        <DynamicCodeEditor sessionId={params.id} />
                    </ResizablePanel>
                    <Toaster position="top-center" closeButton offset={"16px"} visibleToasts={2} gap={8} />
                </ResizablePanelGroup>
            </div>
        </Suspense>
    );
}
function callUserHistoryAPI() {
    throw new Error('Function not implemented.');
}

