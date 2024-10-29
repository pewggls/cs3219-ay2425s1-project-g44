import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/questions', '/profile', '/session', '/question-repo']
// const publicRoutes = ['/auth']

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    // const isPublicRoute = publicRoutes.includes(path)
    const token = request.cookies.get("token")?.value

    // we leave API token verification to routes layout.tsx, just check token existence here
    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // if non-admin user tries to access repo, redirect user to question page
        const isUserAdmin = request.cookies.get("isAdmin")?.value
        if (!isUserAdmin && path.startsWith('/question-repo')) {
            return NextResponse.redirect(new URL('/questions', request.url))
        }

        // session validation
        if (path.startsWith('/session')) {
            // ignore session validation in dev
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.next()
            }

            // const sessionId = pathname.split('/')[2]
            // const response = await fetch(`${process.env.NEXT_PUBLIC_COLLAB_API_URL}/validate-session`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ sessionId })
            // })

            // if (!response.ok) {
            //     return NextResponse.redirect(new URL('/questions', request.url))
            // }
        }
    }
    
    return NextResponse.next()
}
