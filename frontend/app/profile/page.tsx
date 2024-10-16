"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input"; // Shadcn Input component
import { Button } from "@/components/ui/button"; // Shadcn Button component
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Shadcn Avatar component
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from '@/components/ui/dialog';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, LoaderCircle } from 'lucide-react';

const formSchema = z.object({
    username: z.string().min(4, "Username requires at least 4 characters"),
    email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
});

const UserProfile = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const userId = useRef(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
        },
    });

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
                
                setUsername(data.username);
                setEmail(data.email);
                form.setValue("username", data.username);
                form.setValue("email", data.email);
                userId.current = data.id;
            } catch (error) {
                console.error('Error during authentication:', error);
                router.push('/login'); // Redirect to login in case of any error
            }
    };

    authenticateUser();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let isErrorSet = false;
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);
            setError(""); // Clear any previous errors

            // update user to backend
            console.log("In user profile page: call update user api");
            const signUpResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/${userId.current}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(values),
            });
            
            if (signUpResponse.status == 409) {
                const responseMessage = (await signUpResponse.json()).message;
                if (responseMessage.includes("username")) {
                    setError("Username already in use. Please choose a different one");
                    isErrorSet = true;
                    throw new Error("username already exists " + signUpResponse.statusText);
                } else {
                    setError("Email already in use. Please choose a different one");
                    isErrorSet = true;
                    throw new Error("email already exist " + signUpResponse.statusText);
                }
            } else if (!signUpResponse.ok) {
                setError("Failed to update profile.");
                isErrorSet = true;
                throw new Error("User not found" + signUpResponse.statusText);
            } 
        } catch(err) {
            if (!isErrorSet) {
                setError("Something went wrong on our backend. Please retry shortly.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
  
    return (
        <div className="min-h-screen p-4 flex flex-col bg-white">
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
                        <Link href="/questions" className="text-lg font-semibold uppercase text-gray-700/50 hover:text-gray-700 transition duration-150" prefetch={false}>
                            Questions
                        </Link>
                        <Link href="/question-repo" className="text-lg font-semibold uppercase text-gray-700 drop-shadow-md" prefetch={false}>
                            Repository
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

            <main className="flex flex-grow justify-center items-center">
                <Card className="w-full max-w-md p-4">
                    <CardHeader>
                        <CardTitle className="text-center">User Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center mb-4">
                            <Avatar className="w-24 h-24 mb-4">
                            <AvatarImage src="https://via.placeholder.com/150" alt="User Avatar" />
                            <AvatarFallback>UserProfile</AvatarFallback>
                            </Avatar>
                            <h2 className="text-lg font-semibold">{username}</h2>
                            <p className="text-gray-500">{email}</p>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <div className="flex items-center gap-2">
                                                    Username
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="font-normal text-sm">Minimum 4 characters</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="btn btn-primary w-full mt-2 disabled:opacity-80"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        "Update Profile"
                                    )}
                                </Button>
                            </form>
                         </Form>
                    </CardContent>
                </Card>
            </main>

            {error && (
                <Dialog open={!!error} onOpenChange={() => setError('')}>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                        <DialogDescription>
                            {error}
                        </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                        <Button onClick={() => setError('')}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default UserProfile;
