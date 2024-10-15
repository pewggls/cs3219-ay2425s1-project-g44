"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleX, LogOut, Pencil, Save, User } from "lucide-react";
import Link from "next/link";
import React, { ChangeEvent, useState } from "react";

export default function Home() {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        username: "johndoe",
        email: "john@example.com",
        password: "abcdefgh",
    });

    const handleEdit = () => {
        if (isEditing) {
            console.log("Saving changes:", userData);
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUserData(prev => ({ ...prev, [id]: value }));
    };
    
    return (
        <div className="min-h-screen bg-white relative">
            <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-8">
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
                        <Link href="/questions" className="text-lg font-semibold uppercase text-gray-700/50 hover:text-gray-700 transition duration-100" prefetch={false}>
                            Questions
                        </Link>
                        <Link href="/question-repo" className="text-lg font-semibold uppercase text-gray-700/50 hover:text-gray-700 transition duration-100" prefetch={false}>
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
                                <DropdownMenuLabel>Username</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link href="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>
            </header>

            <main className="flex items-center justify-center min-h-screen p-2 pt-16 font-sans text-black">
                <Card className="w-full max-w-xl rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-serif font-normal tracking-tight text-3xl">Profile</CardTitle>
                        {isEditing ? (
                            <div>
                                <Button variant="ghost" size="icon" onClick={handleEdit} className="border-none rounded-l-xl rounded-r-none text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-800">
                                    <CircleX className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleEdit} className="border-none rounded-l-none rounded-r-xl text-white bg-green-600 hover:bg-green-700 hover:text-white">
                                    <Save className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button variant="default" size="icon" onClick={handleEdit} className="border rounded-xl rounded-r-xl hover:hover:bg-primary/85">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input 
                                    id="username" 
                                    value={userData.username} 
                                    disabled={!isEditing}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={userData.email} 
                                    disabled={!isEditing}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={userData.password} 
                                    disabled={!isEditing}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <Label>Questions Attempted</Label>
                                    <p className="text-2xl font-bold">42</p>
                                </div>
                                <div>
                                    <Label>Questions Completed</Label>
                                    <p className="text-2xl font-bold">38</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}