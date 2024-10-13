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
import { AlertCircle, Info, LoaderCircle } from "lucide-react"
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Placeholder for auth to user service
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);

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
            } else if (!signUpResponse.ok) {
                setError("There was an error signing up. Please try again.");
                throw new Error("Error signing up: " + signUpResponse.statusText);
            }

            // Sign up doesn't return JWT token so we need to login after signing up
            const { username, ...loginValues } = values;
            const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/login`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginValues),
            });

            if (loginResponse.status == 400) {
                setError("Missing email or password.");
                throw new Error("Missing email or password: " + loginResponse.statusText);
            } else if (loginResponse.status == 401) {
                setError("Incorrect email or password.");
                throw new Error("Incorrect email or password: " + loginResponse.statusText);
            } else if (loginResponse.status == 500) {
                setError("Database or server error. Please try again.");
                throw new Error("Database or server error: " + loginResponse.statusText);
            } else if (!loginResponse.ok) {
                setError("There was an error logging in. Please try again.");
                throw new Error("Error logging in: " + loginResponse.statusText);
            }

            const responseData = await loginResponse.json();
            console.log(responseData.data["accessToken"]);
            router.push("/question-repo");
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
