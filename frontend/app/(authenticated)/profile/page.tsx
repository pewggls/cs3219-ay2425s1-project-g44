"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleX, Pencil, Save } from "lucide-react";
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
        <main className="flex items-center justify-center min-h-screen p-4 font-sans text-black">
            <Card className="-mt-80 w-full max-w-xl rounded-2xl">
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
                        <Button variant="ghost" size="icon" onClick={handleEdit} className="bg-primary text-primary-foreground border-none rounded-xl hover:bg-primary/85 hover:text-primary-foreground">
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
                            <div className="text-left">
                                <Label>Questions Attempted</Label>
                                <div className="flex items-end gap-1.5 leading-7 font-mono">
                                    <span className="text-2xl font-bold">11</span>
                                    <span>/</span>
                                    <span>20</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <Label>Total Attempts</Label>
                                <p className="text-2xl font-bold font-mono">14</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}