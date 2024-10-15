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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirm: z.string().min(8, "Passwords do not match"),
}).refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
});

export default function ResetPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "", // Prefill from email link/backend
            password: "",
            confirm: "",
        },
    });

    const watchPassword = form.watch("password");
    useEffect(() => {
        if (watchPassword) {
            form.trigger("password");
        }
    }, [watchPassword, form]);

    const watchConfirm = form.watch("confirm");
    useEffect(() => {
        if (watchConfirm) {
            form.trigger("confirm");
        }
    }, [watchConfirm, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Placeholder for auth to user service
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);

            const { confirm, ...resetValues } = values;
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/reset`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resetValues),
            });

            if (response.status == 400) {
                setError("Missing email.");
                throw new Error("Missing email: " + response.statusText);
            } else if (response.status == 500) {
                setError("Database or server error. Please try again.");
                throw new Error("Database or server error: " + response.statusText);
            } else if (!response.ok) {
                setError("There was an error resetting your password. Please try again.");
                throw new Error("Error resetting password: " + response.statusText);
            }

            const responseData = await response.json();
            setSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen w-screen px-10 items-start justify-center bg-white font-sans">
            <div className="-mt-40 mx-auto flex flex-col justify-center gap-6 w-[350px]">
                <div className="flex flex-col gap-2 text-left">
                    <span className="font-serif font-light text-4xl text-primary tracking-tight">
                        Reset your password
                    </span>
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
                    <Alert className="border-green-500 text-green-700">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Password has been reset</AlertTitle>
                        <AlertDescription>
                            <Link href="/login" className="underline underline-offset-2">Login here</Link> with your new password.
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
                                            <Input {...field} className="cursor-default" readOnly />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        <FormDescription>
                                            <span>Password must have at least:</span>
                                            <ul className="list-disc ml-3">
                                                <li>8 characters</li>
                                                <li>1 uppercase character</li>
                                                <li>1 lowercase character</li>
                                                <li>1 number</li>
                                                <li>1 special character</li>
                                            </ul>
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="btn btn-primary w-full mt-2 disabled:opacity-80"
                                disabled={isLoading || success}
                            >
                                {isLoading ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    "Reset password"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}