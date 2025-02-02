import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/trpc/router'
import { inferRouterOutputs } from '@trpc/server'

export const trpc = createTRPCReact<AppRouter>()

// Export type helpers
export type RouterOutputs = inferRouterOutputs<AppRouter> 