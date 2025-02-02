import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'
import { z } from 'zod'
import { searchGoogleBooks } from '@/lib/google-books'

const t = initTRPC.context<Context>().create()

const saveBookInput = z.object({
    bookId: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    description: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
})

// Input validation schema for search
const searchBooksInput = z.object({
    query: z.string().min(1, "Search query cannot be empty"),
    maxResults: z.number().min(1).max(40).default(12),
    startIndex: z.number().min(0).default(0),
})

export const appRouter = t.router({
    saveBook: t.procedure
        .input(saveBookInput)
        .mutation(async ({ input, ctx }: { input: z.infer<typeof saveBookInput>; ctx: Context }) => {
            // Ensure the user is authenticated via Clerk:
            if (!ctx.session.userId) {
                throw new Error('Not authenticated')
            }

            const book = await ctx.prisma.book.create({
                data: {
                    ...input,
                    userId: ctx.session.userId,
                },
            })
            return book
        }),

    // Enhanced search procedure
    searchBooks: t.procedure
        .input(searchBooksInput)
        .query(async ({ input }) => {
            try {
                const books = await searchGoogleBooks(input.query, {
                    maxResults: input.maxResults,
                    startIndex: input.startIndex,
                })
                return {
                    books,
                    nextPage: books.length === input.maxResults,
                    currentPage: Math.floor(input.startIndex / input.maxResults) + 1
                }
            } catch (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to search books',
                    cause: error
                })
            }
        }),

    // Get user's saved books with pagination
    getSavedBooks: t.procedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(10),
            cursor: z.string().nullish(),
        }))
        .query(async ({ ctx, input }) => {
            if (!ctx.session.userId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to view saved books'
                })
            }

            const { limit, cursor } = input

            const books = await ctx.prisma.book.findMany({
                take: limit + 1,
                where: {
                    userId: ctx.session.userId,
                },
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    createdAt: 'desc',
                },
            })

            let nextCursor: typeof cursor = undefined
            if (books.length > limit) {
                const nextItem = books.pop()
                nextCursor = nextItem!.id
            }

            return {
                books,
                nextCursor,
            }
        }),

    // You can add more procedures here (e.g., removeBook, searchBooks)
})

export type AppRouter = typeof appRouter 