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
import { useRouter } from "next/navigation"
import { useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
})

export default function ForgottenPassword() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let isErrorSet = false;
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);
            setError(""); // Clear any previous errors

            // Verify user exists in db
            console.log("In forgot password page: call api to check user exist in db");
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/check?email=${values.email}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!userResponse.ok) {
                setError("No user found with the provided email address.");
                isErrorSet = true;
                throw new Error("User not found in the database with the provided email during password reset.");
            }

            const responseData = await userResponse.json();
            const username = responseData.data.username;
            const email = values.email;

            // Call API to generate OTP and sent its to user via email
            console.log("In forgot password page: call api to sent otp email");
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/send-otp-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email })
            });
            if (!emailResponse.ok) {
                setError("There was an error sending the verification email. Please try again.");
                isErrorSet = true;
                throw new Error(`Failed to send verification email`);
            }

            router.push(`/auth/forgot-password/verify-code?email=${encodeURIComponent(email)}`);
        } catch (err) {
            if (!isErrorSet) {
                setError("An unexpected error occurred when connecting to the backend. Please try again.");
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
                        Reset Password
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enter you email:</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
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
                                    "Send Verification Code"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}