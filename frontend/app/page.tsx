import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen w-screen gap-12 -mt-20 px-10 items-center justify-center bg-white font-sans">
            <p className="font-bold font-brand tracking-tight text-brand-700 text-5xl">PeerPrep</p>
            <p className="text-primary text-lg">Temporary landing page with all the links</p>
            <div className="flex gap-8">
                <Button asChild variant="outline" size="lg" className="border-brand-300 hover:border-brand-100 text-brand-600">
                    <Link href="/auth/login" className="text-primary">Login</Link>
                </Button>
                <Button asChild size="lg" className="bg-brand-600 hover:bg-brand-600/90">
                    <Link href="/auth/sign-up" className="text-white">Sign Up</Link>
                </Button>
            </div>
            <div className="flex gap-8">
                <Link href="/auth/forgot-password" className="text-primary underline underline-offset-4">Forgot password (enter email for OTP)</Link>
                <Link href="/profile" className="text-primary underline underline-offset-4">Profile page</Link>
            </div>
            <div className="flex gap-8">
                <Link href="/questions" className="text-primary underline underline-offset-4">Questions (user facing)</Link>
                <Link href="/question-repo" className="text-primary underline underline-offset-4">Question Repo (CRUD)</Link>
            </div>
        </div>
    )
}