import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
    matcher: [
        // Match all paths except static files and user profile pages
        "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico|users/.*).*)",
    ]
} 