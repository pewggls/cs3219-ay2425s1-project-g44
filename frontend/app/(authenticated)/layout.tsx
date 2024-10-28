"use client"

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, FileText, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AuthenticatedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-white relative">
            <header className="flex items-center justify-between px-8 py-4 fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="text-2xl font-bold font-brand tracking-tight text-brand-700"
                        prefetch={false}
                    >
                        PeerPrep
                    </Link>
                    {process.env.NODE_ENV == "development" && (
                        <Badge variant="dev" className="ml-2 font-brand">
                            DEV
                        </Badge>
                    )}
                </div>
                <div className="hidden desktop:flex items-center gap-4">
                    <nav className="flex items-center gap-10 font-brand">
                        <Link 
                            href="/questions" 
                            className={`text-lg font-semibold uppercase transition duration-100
                            ${pathname === '/questions' 
                                ? 'text-gray-700 drop-shadow-md' 
                                : 'text-gray-700/50 hover:text-gray-700'
                            }`} prefetch={false}
                        >
                            Questions
                        </Link>
                        <Link 
                            href="/question-repo" 
                            className={`text-lg font-semibold uppercase transition duration-100
                                ${pathname === '/question-repo' 
                                    ? 'text-gray-700 drop-shadow-md' 
                                    : 'text-gray-700/50 hover:text-gray-700'
                                }`}
                            prefetch={false}
                        >
                            Repository
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full text-gray-400 transition duration-100 hover:text-gray-400 hover:bg-white hover:border-2"
                                >
                                    <User className="" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="font-sans">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile/question-history" className="cursor-pointer"> <FileText className="mr-2 h-4 w-4" />Attempt History</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild onClick={(e) => {
                                    // e.preventDefault();
                                    localStorage.removeItem("token");
                                }}>
                                    <Link href="/" className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Log out</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>
            </header>
            {children}
        </div>
    );
}
