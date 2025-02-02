import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'
import { z } from 'zod'
import { searchBooks } from '@/lib/google-books'

const t = initTRPC.context<Context>().create()

const saveBookInput = z.object({
    bookId: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    description: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
})

export const appRouter = t.router({
    searchBooks: t.procedure
        .input(z.object({
            query: z.string().min(1),
            maxResults: z.number().min(1).max(40).default(12),
        }))
        .query(async ({ input }) => {
            try {
                const books = await searchBooks(input.query, input.maxResults)
                return { books }
            } catch (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to search books',
                    cause: error
                })
            }
        }),

    saveBook: t.procedure
        .input(saveBookInput)
        .mutation(async ({ input, ctx }) => {
            if (!ctx.session.userId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Must be logged in to save books'
                })
            }

            return ctx.prisma.book.create({
                data: {
                    ...input,
                    userId: ctx.session.userId,
                }
            })
        }),

    getSavedBooks: t.procedure
        .query(async ({ ctx }) => {
            if (!ctx.session.userId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Must be logged in to view saved books'
                })
            }

            return ctx.prisma.book.findMany({
                where: {
                    userId: ctx.session.userId,
                },
                orderBy: {
                    createdAt: 'desc',
                }
            })
        }),

    deleteBook: t.procedure
        .input(z.object({ bookId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            if (!ctx.session.userId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Must be logged in to delete books'
                })
            }

            return ctx.prisma.book.deleteMany({
                where: {
                    bookId: input.bookId,
                    userId: ctx.session.userId,
                }
            })
        }),

    // You can add more procedures here (e.g., removeBook, searchBooks)
})

export type AppRouter = typeof appRouter 