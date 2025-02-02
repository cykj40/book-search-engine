import { prisma } from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'

export async function createContext({ req, res }: { req: Request; res: Response }) {
    // Get Clerk session from the request (you may need to adjust based on Clerk docs)
    const auth = getAuth(req)
    return {
        prisma,
        // session info from Clerk
        session: auth,
    }
}

export type Context = Awaited<ReturnType<typeof createContext>> 