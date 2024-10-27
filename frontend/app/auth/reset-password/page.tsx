"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

const formSchema = z.object({
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

function ResetPassword() {
    const router = useRouter(); 
    const searchParams = useSearchParams();
    const param_email = searchParams.get("email");
    const param_token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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
        let isErrorSet = false;
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);
            setError(""); // Clear any previous errors

            // Verify code with backend
            console.log("In reset password page: call api to reset passwsord");
            const verifyTokenResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/reset-password`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: param_email,
                    token: param_token,
                    newPassword: values.password
                })
            });

            // handle error response
            if (verifyTokenResponse.status == 404) {
                setError("We couldn't find an account with that email. It looks like the email is missing in the link. Please check and try again");
                isErrorSet = true;
                throw new Error("Missing email: " + verifyTokenResponse.statusText);
            } else if (verifyTokenResponse.status == 400) {
                const responseMessage = (await verifyTokenResponse.json()).message;
                if (responseMessage.includes("expired")) {
                    setError("The reset link has expired. Please request a new one.");
                    isErrorSet = true;
                } else if (responseMessage.includes("not match")) {
                    setError("The reset link is invalid. Please request a new password reset link.");
                    isErrorSet = true;
                } else if (responseMessage.includes("old password")) {
                    setError("You cannot reuse your previous password. Please choose a new one.");
                    isErrorSet = true;
                } else {
                    setError("It seems you haven’t requested a password reset. Please request a reset if needed.");
                    isErrorSet = true;
                } 
                throw new Error("Error during verification: " + verifyTokenResponse.statusText);
            } else if (verifyTokenResponse.status == 500) {
                setError("Something went wrong on our end. Please try again later.");
                isErrorSet = true;
                throw new Error("Database or server error: " + verifyTokenResponse.statusText);
            } else if (!verifyTokenResponse.ok) {
                setError("There was an error when resetting your password.");
                isErrorSet = true;
                throw new Error("Error resetting password: " + verifyTokenResponse.statusText);
            }

            router.push(`/auth/reset-password/success`);
        } catch (err) {
            if (!isErrorSet) {
                setError("Something went wrong. Please retry shortly.");
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-screen px-10 items-center justify-center bg-white font-sans">
            <div className="mx-auto flex flex-col justify-center gap-6 w-[350px]">
                <div className="flex flex-col gap-2 text-left pb-1">
                    <span className="font-serif font-light text-4xl text-primary tracking-tight">
                        Reset your password
                    </span>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Error</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex flex-col gap-4 text-black">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <div className="flex items-center gap-2">
                                            Password
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                    <TooltipContent>
                                                        <span>Password must have at least:</span>
                                                        <ul className="list-disc ml-3">
                                                            <li>8 characters</li>
                                                            <li>1 uppercase character</li>
                                                            <li>1 lowercase character</li>
                                                            <li>1 number</li>
                                                            <li>1 special character</li>
                                                        </ul>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
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
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    "Reset"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPassword />
        </Suspense>
    )
}