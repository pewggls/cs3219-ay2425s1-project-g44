import { jwtDecode } from "jwt-decode";
import { getCookie } from "./cookie-manager";

interface DecodedToken {
    exp: number;
}

export async function isTokenExpired(inputToken: string | undefined): Promise<boolean> {
    const token = inputToken || getCookie("token");
    if (!token) return true;

    try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) return true;
    } catch (error) {
        console.error("Error decoding token:", error);
        return true;
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/verify-token`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return true;
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        return true;
    }

    return false;
}

export function getTokenExpirationTime(): number | null {
    const token = getCookie("token");
    if (!token) return null;

    try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        return decodedToken.exp;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}
