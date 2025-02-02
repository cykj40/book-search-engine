'use client'

import { useState } from 'react'
import { trpc } from '@/app/utils/trpc'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import Image from 'next/image'
import type { RouterOutputs } from '@/app/utils/trpc'

interface SearchResult {
    books: RouterOutputs['searchBooks']['books']
    nextPage: boolean
    currentPage: number
}

export function SearchBooks() {
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [page, setPage] = useState(0)
    const { ref, inView } = useInView()

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = trpc.searchBooks.useQuery(
        {
            query: debouncedQuery,
            maxResults: 12,
            startIndex: page * 12
        },
        {
            enabled: debouncedQuery.length > 0
        }
    ) as unknown as {
        data?: { pages: SearchResult[] }
        isLoading: boolean
        fetchNextPage: () => Promise<unknown>
        hasNextPage: boolean
        isFetchingNextPage: boolean
    }

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
            setPage((p: number) => p + 1)
        }
    }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage])

    // Handle search with debounce
    const handleSearch = (value: string) => {
        setQuery(value)
        setPage(0)
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(value)
        }, 500)
        return () => clearTimeout(timeoutId)
    }

    // Flatten all pages of results
    const books = data?.pages.flatMap((page) => page.books) || []

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Search for books..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {isLoading && <div>Loading...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book) => (
                    <BookCard key={book.bookId} book={book} />
                ))}
            </div>

            {isFetchingNextPage && <div>Loading more...</div>}
            <div ref={ref} className="h-10" /> {/* Infinite scroll trigger */}
        </div>
    )
}

// Separate BookCard component for better organization
function BookCard({ book }: { book: RouterOutputs['searchBooks']['books'][0] }) {
    const saveBookMutation = trpc.saveBook.useMutation()

    const handleSaveBook = async () => {
        try {
            await saveBookMutation.mutateAsync({
                bookId: book.bookId,
                title: book.title,
                authors: book.authors,
                description: book.description,
                image: book.image,
                link: book.link,
            })
            alert('Book saved successfully!')
        } catch (error) {
            console.error('Error saving book:', error)
            alert('Failed to save book')
        }
    }

    return (
        <div className="border rounded p-4 hover:shadow-lg transition-shadow">
            {book.image && (
                <div className="relative w-full h-48 mb-4">
                    <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className="object-cover rounded"
                    />
                </div>
            )}
            <h3 className="font-bold truncate">{book.title}</h3>
            <p className="text-sm text-gray-600 truncate">
                {book.authors?.join(', ')}
            </p>
            <p className="text-sm mt-2 line-clamp-3">
                {book.description}
            </p>
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleSaveBook}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                    Save
                </button>
                {book.link && (
                    <a
                        href={book.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
                    >
                        More Info
                    </a>
                )}
            </div>
        </div>
    )
} 