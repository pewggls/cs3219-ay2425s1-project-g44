import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Login() {
    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-white font-sans">
            <div className="mx-auto flex flex-col justify-center gap-6 w-[400px]">
                <div className="flex flex-col gap-2 text-left pb-1">
                    <span className="font-serif font-light text-4xl text-primary tracking-tight">
                        Sign in
                    </span>
                </div>
                <div className="flex flex-col gap-4 text-black">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="username" className="text-sm">
                            Username
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            className="input"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password" className="text-sm">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            className="input"
                            required
                        />
                    </div>
                    <Button type="submit" className="btn btn-primary mt-4">Sign in</Button>
                    <div className="px-8 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold hover:text-brand-700 transition-colors underline underline-offset-2"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}