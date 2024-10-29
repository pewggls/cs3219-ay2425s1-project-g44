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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { AlertCircle, LoaderCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import SuccessDialog from "./success-dialog"

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
    const [userInfo, setUserInfo] = useState({
        email: "",
        username: "",
        id: "",
    });
    // let userInfo = { email: "", username: "", id: "" };

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
        let isErrorSet = false;
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);
            setError(""); // Clear any previous errors
            setSuccessMessage(""); // Clear previous success message

            // register user to backend
            const { confirm, ...signUpValues } = values;
            console.log("In sign up page: call register user api");
            const signUpResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signUpValues),
            });

            if (signUpResponse.status == 400) {
                setError("Missing username, email or password.");
                isErrorSet = true;
                throw new Error("Missing username, email or password: " + signUpResponse.statusText);
            } else if (signUpResponse.status == 403) {
                const responseData = await signUpResponse.json();
                setUserInfo({
                    username: responseData.data.username,
                    email: responseData.data.email,
                    id: responseData.data.id, 
                })
                setSuccessMessage("You have already registered but haven't verified your email.");
                form.reset();
                return;
            } else if (signUpResponse.status == 409) {
                const responseMessage = await signUpResponse.json();

                if (responseMessage.message.includes("username")) {
                    setError("A user with this username already exists.");
                } else if (responseMessage.message.includes("email")) {
                    setError("This email is already registered.");
                } else {
                    setError("A user with this username or email already exists.");
                }
                isErrorSet = true;
                throw new Error("Duplicate username or email: " + signUpResponse.statusText);
            } else if (signUpResponse.status == 500) {
                setError("Database or server error. Please try again.");
                isErrorSet = true;
                throw new Error("Database or server error: " + signUpResponse.statusText);
            } else if (!signUpResponse.ok) {
                setError("There was an error signing up. Please try again.");
                throw new Error("Error signing up: " + signUpResponse.statusText);
            }

            const responseData = await signUpResponse.json();
            const { id, username, email } = responseData.data;
            setUserInfo({
                username: username,
                email: email,
                id: id, 
            })

            // Send verification email
            console.log("In sign up page: call send verification email api");
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/send-verification-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username: username, 
                    email: email, 
                    id: id,
                    type: "sign-up"
                }),
            });
            
            // Revert the creation of the previously registered user when the backend fails to send the verification email.
            console.log("In sign up page: fetch admin jwt token api");
            const adminJWT = await getAdminJWT();
            if (!emailResponse.ok) {
                console.log("In sign up page: error heppen when backend try to send email", emailResponse)
                setError("There was an error sending the verification email. Please try again.");
                isErrorSet = true;
                console.log("In sign up page: call delete user api");
                await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/${encodeURIComponent(id)}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminJWT}`,
                        'userId' : id,
                    }
                });
                throw new Error(`Failed to send verification email`);
            }

            setSuccessMessage("A verification link has been sent to your email.");
            form.reset();
        } catch (err) {
            if (!isErrorSet) {
                setError("Something went wrong on our backend. Please retry shortly.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleCloseDialog = () => {
        setSuccessMessage('');
    };

    const handleResendEmail = async () => {
        const { id, username, email } = userInfo;
        await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/send-verification-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username, 
                email: email, 
                id: id,
                type: "sign-up"
            }),
        });
    };

    return (

    <div className="min-h-screen w-screen laptop:flex">
        <div className="hidden min-h-screen bg-brand-50 -mt-12 laptop:w-screen laptop:flex laptop:items-center laptop:justify-center">
            <Link href="/" className="text-4xl font-bold font-brand tracking-tight text-brand-700" prefetch={false}>PeerPrep</Link>
        </div>

        <div className="min-h-screen laptop:w-screen text-black font-sans flex flex-col items-center justify-center gap-6 mx-auto laptop:-mt-8 py-8 w-[350px]">
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
                                        {/* <div className="flex items-center gap-2">
                                            Username
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="font-normal text-sm">Minimum 4 characters</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div> */}
                                        Username
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>Minimum 4 characters</FormDescription>
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
                                        {/* <div className="flex items-center gap-2">
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
                                        </div> */}
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        Must be at least 8 characters, include uppercase, lowercase, a number, and a special character.
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
                    href="/auth/login"
                    className="font-semibold hover:text-brand-700 transition-colors underline underline-offset-2"
                >
                    Sign in
                </Link>
            </div>
        </div>
        <SuccessDialog onClose={handleCloseDialog} onResend={handleResendEmail} message={successMessage} />
    </div>
)
}
