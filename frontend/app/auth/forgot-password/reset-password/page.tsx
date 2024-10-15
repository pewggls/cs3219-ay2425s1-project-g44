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
import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


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

export default function ResetPassword() {
    const router = useRouter(); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

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
        // Placeholder for auth to user service
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);
            setError(""); // Clear any previous errors
            setSuccessMessage(""); // Clear previous success message

            // Fetch user data with admin privileges
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/check-user?email=${values.email}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!userResponse.ok) {
                setError("No user found with the provided email address.");
                throw new Error("User not found in the database with the provided email during password reset.");
            }

            const responseData = await userResponse.json();
            const username = responseData.data.username;
            const id = responseData.data.id;
            console.log("response: ", responseData);
            const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/resetPassword?id=${encodeURIComponent(id)}`

            // Send verification email
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/send-verification-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: values.email,
                    title: 'Reset Your Password for PeerPrep',
                    body: `
                    <!DOCTYPE html>
                    <html>
                    <body>
                        <p>Hi <strong>${username}</strong>,</p>
                        <p>We received a request to reset your password for your <strong>PeerPrep</strong> account. To reset your password, click the button below:<p>
                        <a href="${resetLink}" style="background-color: #FF0000; color: white; padding: 10px 20px; text-decoration: none;">Reset Password</a>
                        <p>If the button above doesn't work, copy and paste the following link into your browser:<p>
                        ${resetLink}
                        <p>Best regards,<br>The PeerPrep Team</p>
                    </body>
                    </html>` 
                }),
            });
            
            if (!emailResponse.ok) {
                setError("There was an error sending the verification email. Please try again.");
                throw new Error(`Failed to send verification email`);
            }

            setSuccessMessage("Check your email for the reset link.");
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
                {successMessage && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Email Sent</AlertTitle>
                        <AlertDescription>
                            {successMessage} {' '}After verifying your email, proceed{' '}
                            <Link href="/" className="text-blue-600 underline">
                                here
                            </Link>{' '}
                            to log in.
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
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}