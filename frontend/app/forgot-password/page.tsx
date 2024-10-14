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
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    let adminJWT: string | null = null;
    let tokenTimestamp: number | null = null;
    async function getAdminJWT() {
        // Check if the token is cached and not expired
        const tokenValidFor = 24 * 60 * 60 * 1000;
        const currentTime = Date.now();
      
        if (adminJWT && tokenTimestamp && (currentTime - tokenTimestamp < tokenValidFor)) {
            return adminJWT;
        }
      
        // If no token or token expired, login as admin to get a new token
        const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": process.env.NEXT_PUBLIC_EMAIL_USER,
                "password": process.env.NEXT_PUBLIC_EMAIL_PASS
            }),
        });
      
        if (!loginResponse.ok) {
            setError("Failed to reset password. Please try again.");
            throw new Error(`Failed to fetch admin JWT token. Status: ${loginResponse.status}, Message: ${loginResponse.statusText}`);
        }
      
        const loginData = await loginResponse.json();
        adminJWT = loginData.data.accessToken;
        tokenTimestamp = currentTime;
        return adminJWT;
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Placeholder for auth to user service
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);
            setError(""); // Clear any previous errors
            setSuccessMessage(""); // Clear previous success message

            // Get admin JWT token (cached or freshly fetched)
            const adminJWT = await getAdminJWT();

            // Fetch user data with admin privileges
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminJWT}`
                }
            });

            if (!userResponse.ok) {
                setError("Failed to reset password. Please try again.");
                throw new Error(`Failed to fetch users from user service to reset password. Status: ${userResponse.status}, Message: ${userResponse.statusText}`);
            }

            // check if the email exists in db
            const userMatch = (await userResponse.json()).data.filter((user: {
                id: string;
                username: string;
                email: string;
                isAdmin: boolean;
                createdAt: string;
              }) => values.email == user.email)
            
            if (userMatch.length == 0) {
                setError("No user found with the provided email address.");
                throw new Error("User not found in the database with the provided email during password reset.");
            } 

            // Send verification email
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/send-verification-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: values.email, 
                    link: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/resetPassword/username=${encodeURIComponent(userMatch.username)}` 
                }),
            });
            
            if (!emailResponse.ok) {
                setError("There was an error sending the verification email. Please try again.");
                throw new Error(`Failed to send verification email`);
            }

            setSuccessMessage("A link has been sent to your email. Please check your inbox to reset your password.");
        } catch (error) {
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
                        Password Reset
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
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </Form>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </div>
            </div>
        </div>
    )
}