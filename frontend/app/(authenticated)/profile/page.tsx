"use client";

import { deleteCookie, getCookie, setCookie } from "@/app/utils/cookie-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CircleX, Pencil, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

export default function Home() {
    const router = useRouter();
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        username: "johndoe",
        email: "john@example.com",
        password: "abcdefgh",
        totalAttempt: 0,
        questionAttempt: 0,
        totalQuestion: 20,
    });
    const initialUserData = useRef({
        username: "johndoe",
        email: "john@example.com",
        password: "abcdefgh",
        totalAttempt: 0,
        questionAttempt: 0,
        totalQuestion: 20,
    })
    const userId = useRef(null);

    useEffect(() => {
        const authenticateUser = async () => {
            try {
                const token = getCookie('token');

                if (!token) {
                    router.push('/auth/login'); // Redirect to login if no token
                    return;
                }

                // Call the API to verify the token
                const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/verify-token`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    deleteCookie('token'); // remove invalid token from browser
                    router.push('/auth/login'); // Redirect to login if not authenticated
                    return;
                }

                const data = (await response.json()).data;
                if (!getCookie('userId')) {
                    userId.current = data.id;
                    setCookie('userId', data.id, { 'max-age': '86400', 'path': '/', 'SameSite': 'Strict' });
                }
                // placeholder for password *Backend wont expose password via any API call
                const password = "";
                
                // Call the API to fetch user question history stats
                const questionHistoryResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_HISTORY_URL}/${data.id}/stats`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!questionHistoryResponse.ok) {
                    setError(true);
                }

                const stats = await questionHistoryResponse.json();
                console.log("stats", stats)
                setUserData({
                    username: data.username,
                    email: data.email,
                    password: password,
                    totalAttempt: stats?.totalAttempts,
                    questionAttempt: stats?.questionsAttempted,
                    totalQuestion: stats?.totalQuestionsAvailable,
                })
                initialUserData.current = {
                    username: data.username,
                    email: data.email,
                    password: password,
                    totalAttempt: stats?.totalAttempts,
                    questionAttempt: stats?.questionsAttempted,
                    totalQuestion: stats?.totalQuestionsAvailable,
                };
            } catch (error) {
                console.error('Error during authentication:', error);
                router.push('/auth/login'); // Redirect to login in case of any error
            }
    };

    authenticateUser();
    }, [router]);

     // Validate the password before making the API call
    const validatePassword = (password: string) => {
        let errorMessage = "";
        if (!/[A-Z]/.test(password)) {
            errorMessage += "Must contain at least one uppercase letter.\n";
        }
        if (!/[a-z]/.test(password)) {
            errorMessage += "Must contain at least one lowercase letter.\n";
        }
        if (!/[0-9]/.test(password)) {
            errorMessage += "Must contain at least one number.\n";
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            errorMessage += "Must contain at least one special character.\n";
        }
        return errorMessage;
    };

    const handleEdit = async () => {
        let isErrorSet = false;
        // Create an object to store only changed fields
        // const updatedFields: any = {};
        try {
            setFeedback({ message: '', type: '' });
            if (userData.username !== initialUserData.current.username) {
                // updatedFields.username = userData.username;
                const signUpResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/${userId.current}`, {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${getCookie('token')}`
                    },
                    body: JSON.stringify({ username: userData.username }),
                });
                if (signUpResponse.status == 409) {
                    const responseMessage = (await signUpResponse.json()).message;
                    if (responseMessage.includes("username")) {
                        setFeedback({ message: "Username already in use. Please choose a different one", type: "error"});
                        isErrorSet = true;
                        throw new Error("username already exists " + signUpResponse.statusText);
                    } else {
                        setFeedback({ message: 'Email already in use. Please choose a different one', type: 'error' });
                        isErrorSet = true;
                        throw new Error("email already exist " + signUpResponse.statusText);
                    }
                } else if (!signUpResponse.ok) {
                    setFeedback({ message: 'Failed to update profile.', type: 'error' });
                    isErrorSet = true;
                    throw new Error("User not found" + signUpResponse.statusText);
                } else {
                    initialUserData.current.username = userData.username; // update username new value
                    setCookie('username', userData.username, { 'max-age': '86400', 'path': '/', 'SameSite': 'Strict' });
                }
            }
            if (userData.email !== initialUserData.current.email) {
                console.log("In user profile page: call api to check email exist in db");
                const userResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/check?email=${userData.email}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (userResponse.status == 200) {
                    console.log("duplicate email")
                    setFeedback({ message: "This email is already in use. Please choose another one.", type: 'error' });
                    isErrorSet = true;
                    throw new Error("Email already exists in the database when user update their profile.");
                } else if (userResponse.status !== 404) {
                    throw new Error("Error happen when calling API to detect duplicate email")
                }

                const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_EMAIL_URL}/send-verification-email`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: userId.current,
                        type: 'email-update',
                        email: userData.email,
                        username: userData.username 
                    }),
                })

                if (emailResponse.ok) {
                    initialUserData.current.email = userData.email;
                    setFeedback({ message: `An email has been sent to your new address ${userData.email} for verification. Please check your inbox or spam folder.`, type: "email-verification" });
                } else {
                    setFeedback({ message: "There was an error sending the verification email.", type: 'error' });
                    throw new Error("Error during email verification process.");
                }                
            }

            if (userData.password !== initialUserData.current.password) {
                console.log("detect password change: original:", initialUserData.current.password, " new pw: ", userData.password)
                // Check for password validity
                const passwordError = validatePassword(userData.password);
                if (passwordError) {
                    setFeedback({ message: `Password does not meet requirements:\n${passwordError}`, type: "error" });
                    isErrorSet = true;
                    throw new Error("Password update failed");
                }
                const passwordResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_API_USERS_URL}/${userId.current}`, {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${getCookie('token')}`,
                    },
                    body: JSON.stringify({ password: userData.password }),
                });
                if (!passwordResponse.ok) {
                    setFeedback({ message: "Failed to update password.", type: "error" });
                    isErrorSet = true;
                    throw new Error("Password update failed");
                } else {
                    initialUserData.current.password = userData.password;
                }
            }

            setIsEditing(!isEditing);
        } catch(err) {
            if (!isErrorSet) {
                setFeedback({ message: "Something went wrong on our backend. Please retry shortly.", type: 'error' });
            }
            console.error(err);
        } 
    };
    

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUserData(prev => ({ ...prev, [id]: value }));
    };

    const handleClose = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/verify-token`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('token')}`,
            },
        });

        if (!response.ok) {
            deleteCookie("token"); // remove invalid token from browser
            router.push('/auth/login'); // Redirect to login if not authenticated
            return;
        }

        const data = (await response.json()).data;
        
        setUserData(prevData => ({
            ...prevData,
            username: data.username,
            email: data.email,
            password: data.password,
        }));

        setFeedback({ message: '', type: '' });
        setIsEditing(!isEditing);
    }

    return (
        <main className="flex items-start justify-center min-h-screen p-4 font-sans text-black">
            <Card className="mt-40 w-full max-w-xl rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-serif font-normal tracking-tight text-3xl">Profile</CardTitle>
                    {isEditing ? (
                        <div>
                            <Button variant="ghost" size="icon" onClick={handleClose} className="border-none rounded-l-xl rounded-r-none text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-800">
                                <CircleX className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleEdit} className="border-none rounded-l-none rounded-r-xl text-white bg-green-600 hover:bg-green-700 hover:text-white">
                                <Save className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} className="bg-primary text-primary-foreground border-none rounded-xl hover:bg-primary/85 hover:text-primary-foreground">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {feedback.message && (
                        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-semibold">
                                {feedback.type === 'error' ? 'Error' : 'Check your email'}
                            </AlertTitle>
                            <AlertDescription>
                                {feedback.message.split('\n').map((line, index, arr) => (
                                    line && (
                                        <span key={index}>
                                            {line}
                                            {index < arr.length - 1 && <br />} {/* Only add <br /> if it's not the last line */}
                                        </span>
                                    )
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}
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

                        { !error &&
                        <div className="flex justify-between">
                            <div className="text-left">
                                <Label>Questions Attempted</Label>
                                <div className="flex items-end gap-1.5 leading-7 font-mono">
                                    <span className="text-2xl font-bold">{userData.questionAttempt}</span>
                                    <span>/</span>
                                    <span>{userData.totalQuestion}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <Label>Total Attempts</Label>
                                <p className="text-2xl font-bold font-mono">{userData.totalAttempt}</p>
                            </div>
                        </div>
                        }
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}