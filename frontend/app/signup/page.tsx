"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useState } from "react"
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
import { LoaderCircle } from "lucide-react"

const formSchema = z.object({
    username: z.string().min(4, "Username requires at least 4 characters"),
    email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
    password: z.string().min(6, "Password requires at least 6 characters"),
    confirm: z.string().min(6, "Passwords do not match"),
}).refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
});

export default function Signup() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirm: "",
        },
    })

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

            if (signUpResponse.status == 409) {
                throw new Error("Duplicate username or email: " + signUpResponse.statusText);
            } else if (signUpResponse.status == 500) {
                throw new Error("Database or server error: " + signUpResponse.statusText);
            } else if (!signUpResponse.ok) {
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

            if (loginResponse.status == 401) {
                throw new Error("Incorrect email or password: " + loginResponse.statusText);
            } else if (loginResponse.status == 500) {
                throw new Error("Database or server error: " + loginResponse.statusText);
            } else if (!loginResponse.ok) {
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
        <div className="min-h-screen w-full bg-white laptop:grid laptop:min-h-screen laptop:grid-cols-2">
            <div className="hidden bg-brand-50 laptop:flex laptop:items-center laptop:justify-center">
                <span className="text-4xl font-bold font-branding tracking-tight text-brand-700">PeerPrep</span>
            </div>
            <div className="bg-white font-sans flex flex-col items-center justify-center px-4 py-auto">
                <div className="mx-auto flex flex-col justify-center gap-6 w-[400px] text-black">
                    <div className="flex flex-col gap-2 text-center">
                        <span className="font-serif font-light text-4xl text-primary tracking-tight">
                            Create an account
                        </span>
                        <p className="text-sm text-muted-foreground">
                            Enter a username, email and password to sign up
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 text-black">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
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
                                            <FormLabel>Password</FormLabel>
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
        </div>
    )
}
