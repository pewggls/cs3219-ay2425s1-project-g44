"use client"

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteAllCookies, getCookie } from "../utils/cookie-manager";
import { isTokenExpired } from "../utils/token-utils";
import { ClientConfig } from "agora-rtc-react";
import AgoraRTCProvider from "./AgoraRTCProvider";

export default function SessionLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    const router = useRouter();

    useEffect(() => {
        const authenticateUser = async () => {
            const token = getCookie('token');
            if (!token || await isTokenExpired(token)) {
                deleteAllCookies();
                router.push('/auth/login');
                return;
            }
        };

        authenticateUser();
    }, [pathname, router]);

    const client:ClientConfig = { mode: "rtc", codec: "vp8" };

    return (
        <div className="min-h-screen bg-white">
            <AgoraRTCProvider clientConfig={client}>
                {children}
            </AgoraRTCProvider>
        </div>
    );
}
