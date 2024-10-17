"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, LoaderCircle, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
})

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (success && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCount) => prevCount - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [success, countdown]);

    useEffect(() => {
        if (countdown === 0) {
            setSuccess(false);
            setCountdown(60);
        }
    }, [countdown]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Placeholder for auth to user service
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);

            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/forgot`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.status == 400) {
                setError("Missing email.");
                throw new Error("Missing email: " + response.statusText);
            } else if (response.status == 500) {
                setError("Database or server error. Please try again.");
                throw new Error("Database or server error: " + response.statusText);
            } else if (!response.ok) {
                setError("There was an error resetting your password. Please try again.");
                throw new Error("Error sending reset link: " + response.statusText);
            }

            const responseData = await response.json();
            setSuccess(true);
            setCountdown(60);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen w-screen px-10 items-start justify-center bg-white font-sans">
            <div className="-mt-80 mx-auto flex flex-col justify-center gap-6 w-[350px]">
                <div className="pb-10">
                    <Button asChild variant="ghost" size="sm" className="pl-0 py-1 pr-2 -ml-1"><Link href="/login" className="text-muted-foreground"><ChevronLeft className="h-5 w-5" />Back to Login</Link></Button>
                </div>
                <div className="flex flex-col gap-2 text-left">
                    <span className="font-serif font-light text-4xl text-primary tracking-tight">
                        Forgot your password?
                    </span>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we will send you a link to reset your password.
                    </p>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Error</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert className="text-primary">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Check your email</AlertTitle>
                        <AlertDescription>
                            A link to reset your password has been sent to your email address.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex flex-col gap-4 text-black">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                                disabled={isLoading || (success && countdown > 0)}
                            >
                                {isLoading ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : success && countdown > 0 ? (
                                    `Try again in ${countdown}s`
                                ) : (
                                    "Send reset link"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}