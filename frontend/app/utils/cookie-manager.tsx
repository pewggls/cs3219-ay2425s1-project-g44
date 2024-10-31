// only work on client side

export function setCookie(name: string, value: string, options: { [key: string]: string } = {}) {
    if (typeof window === 'undefined') return;
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    for (const optionKey in options) {
        cookieString += `; ${optionKey}`;
        const optionValue = options[optionKey];
        if (optionValue !== '') {
            cookieString += `=${optionValue}`;
        }
    }
    document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

export function deleteCookie(name: string) {
    if (typeof window === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
    console.log(name + ' cookie deleted');
}

export function deleteAllCookies() {
    deleteCookie('token');
    deleteCookie('userId');
    deleteCookie('username');
    deleteCookie('isAdmin');
}

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return getCookie('token');
}

export function getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return getCookie('userId');
}

export function getUsername(): string | null {
    if (typeof window === 'undefined') return null;
    return getCookie('username');
}

export function isUserAdmin(): boolean {
    if (typeof window === 'undefined') return false;
    const isAdmin = getCookie('isAdmin');
    return isAdmin === 'true';
}
