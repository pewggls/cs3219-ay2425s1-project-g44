"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { AlertCircle, Info, LoaderCircle, CheckCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const formSchema = z.object({
    username: z.string().min(4, "Username requires at least 4 characters"),
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

export default function Signup() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
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

            const { confirm, ...signUpValues } = values;
            const signUpResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signUpValues),
            });

            if (signUpResponse.status == 400) {
                setError("Missing username, email or password.");
                throw new Error("Missing username, email or password: " + signUpResponse.statusText);
            } else if (signUpResponse.status == 409) {
                setError("A user with this username or email already exists.");
                throw new Error("Duplicate username or email: " + signUpResponse.statusText);
            } else if (signUpResponse.status == 500) {
                setError("Database or server error. Please try again.");
                throw new Error("Database or server error: " + signUpResponse.statusText);
            } else if (signUpResponse.status == 403) {
                setSuccessMessage("You have already registered but haven't verified your email. Please check your inbox for the verification link.");
            }else if (!signUpResponse.ok) {
                setError("There was an error signing up. Please try again.");
                throw new Error("Error signing up: " + signUpResponse.statusText);
            }


            const responseData = await signUpResponse.json();
            const id = responseData.data.id;

            // Send verification email
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/send-verification-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: values.email,
                    title: 'Confirm Your Email Address for PeerPrep',
                    body: `
                    <!DOCTYPE html>
                    <html>
                    <body>
                        <p>Hi <strong>${values.username}</strong>,</p>
                        <p>Thank you for signing up for <strong>PeerPrep</strong>! Before you can start using your account, we need to verify your email address.</p>
                        <p>Please confirm your email by clicking the button below:</p>
                        <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/EmailVerification?id=${encodeURIComponent(id)}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a>
                        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/EmailVerification?token=${encodeURIComponent(id)}">${process.env.NEXT_PUBLIC_FRONTEND_URL}/EmailVerification?token=${encodeURIComponent(id)}</a></p>
                        <p>This link will expire in [time, e.g., 24 hours].</p>
                        <p>If you didn't sign up for this account, you can safely ignore this email.</p>
                        <p>Best regards,<br>The PeerPrep Team</p>
                    </body>
                    </html>` 
                }),
            });
            console.log("email response: ", emailResponse);
            const adminJWT = await getAdminJWT();
            if (!emailResponse.ok) {
                console.log(emailResponse)
                setError("There was an error sending the verification email. Please try again.");
                await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminJWT}`,
                        'userId' : id,
                    }
                });
                throw new Error(`Failed to send verification email`);
            }

            setSuccessMessage("Thank you for signing up! A verification link has been sent to your email. Please check your inbox to verify your account.");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-screen laptop:flex">
            <div className="hidden min-h-screen bg-brand-50 laptop:w-screen laptop:flex laptop:items-center laptop:justify-center">
                <span className="text-4xl font-bold font-branding tracking-tight text-brand-700">PeerPrep</span>
            </div>
            <div className="min-h-screen laptop:w-screen text-black font-sans flex flex-col items-center justify-center gap-6 mx-auto w-[350px]">
                <div className="flex flex-col gap-2 text-center">
                    <span className="font-serif font-light text-4xl text-primary tracking-tight">
                        Create an account
                    </span>
                    <p className="text-sm text-muted-foreground">
                        Enter a username, email and password to sign up
                    </p>
                </div>
                <div className="flex flex-col gap-4 w-full laptop:w-[350px] px-10 laptop:px-0 text-black">
                    {successMessage && (
                        <Alert className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Success</AlertTitle>
                            <AlertDescription>
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Error</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
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
                                    "Sign up"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="px-8 text-center text-sm">
                    Already have an account?{" "}
                    <Link
                        href="/"
                        className="font-semibold hover:text-brand-700 transition-colors underline underline-offset-2"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
