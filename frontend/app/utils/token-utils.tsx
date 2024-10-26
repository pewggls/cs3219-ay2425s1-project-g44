import { jwtDecode } from "jwt-decode";
import { getCookie } from "./cookie-manager";

interface DecodedToken {
    exp: number;
}

export function isTokenExpired(): boolean {
    const token = getCookie("token");
    if (!token) return true;

    try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    } catch (error) {
        console.error("Error decoding token:", error);
        return true;
    }
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
