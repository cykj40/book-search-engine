import { createNextRouteHandler } from '@trpc/server/adapters/next'
import { appRouter } from '@/server/trpc/router'
import { createContext } from '@/server/trpc/context'

// export API handler
export const { GET, POST } = createNextRouteHandler({
    router: appRouter,
    createContext,
}) 