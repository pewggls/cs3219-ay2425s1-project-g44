import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/questions', '/profile', '/session', '/question-repo']
const publicRoutes = ['/auth']

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
    const token = request.cookies.get("token")?.value

    // bypass auth for users already logged in
    if (isPublicRoute && token) {
        return NextResponse.redirect(new URL('/questions', request.url))
    }

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
            // if (process.env.NODE_ENV === 'development') {
            //     return NextResponse.next()
            // }

            const currentUsername = request.cookies.get("username")?.value
            if (!currentUsername) {
                return NextResponse.redirect(new URL('/auth/login', request.url))
            }

            try {
                // get matched usernames from URL params
                const searchParams = request.nextUrl.searchParams
                const matchResult = searchParams.get('matchResult')
                
                if (!matchResult) {
                    return NextResponse.redirect(new URL('/questions', request.url))
                }
    
                const parsedMatchResult = JSON.parse(decodeURIComponent(matchResult))
                const currentParsedUsername = parsedMatchResult.currentUsername
                const peerParsedUsername = parsedMatchResult.peerUsername

                // check if current user is one of matched users
                if (currentUsername !== currentParsedUsername && currentUsername !== peerParsedUsername) {
                    return NextResponse.redirect(new URL('/questions', request.url))
                }
            } catch (error) {
                console.error('Failed to parse match result:', error)
                return NextResponse.redirect(new URL('/questions', request.url))
            }
        }
    }
    
    return NextResponse.next()
}
