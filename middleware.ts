import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
    matcher: [
        // Match all paths except static files
        "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
    ]
} 