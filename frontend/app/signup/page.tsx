import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Signup() {
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
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username" className="text-sm">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                className="input"
                                spellCheck="false"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email" className="text-sm">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
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
                        <Button type="submit" className="w-full">
                            Sign up
                        </Button>
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
