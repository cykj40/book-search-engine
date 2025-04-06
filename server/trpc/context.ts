import { getAuth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { prisma } from '@/lib/prisma'

export async function createContext({ req }: FetchCreateContextFnOptions) {
    const auth = getAuth({ headers: req.headers } as NextRequest)

    return {
        session: {
            userId: auth.userId,
        },
        prisma,
    }
}

export type Context = Awaited<ReturnType<typeof createContext>> 