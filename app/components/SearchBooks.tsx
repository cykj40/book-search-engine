'use client'

import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/app/utils/trpc'
import Image from 'next/image'
import { Book } from '@/lib/google-books'

export function SearchBooks() {
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    // Use useCallback to prevent recreation of this function on each render
    const handleSearch = useCallback((value: string) => {
        setQuery(value)
    }, [])

    // Separate the debounce logic into useEffect to prevent infinite loops
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(query)
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [query])

    const {
        data: searchResults,
        isLoading
    } = trpc.searchBooks.useQuery(
        { query: debouncedQuery, maxResults: 12 },
        {
            enabled: debouncedQuery.length > 0,
            // Add caching and stale time to prevent unnecessary refetches
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
        }
    )

    // Create a map to deduplicate books by ID
    const uniqueBooks = searchResults?.books ?
        Array.from(new Map(searchResults.books.map(book => [book.bookId, book])).values())
        : []

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Search Books</h1>
                <input
                    type="text"
                    placeholder="Search for books..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {isLoading && debouncedQuery.length > 0 && (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueBooks.map((book: Book, index: number) => (
                    <BookCard key={`${book.bookId}-${index}`} book={book} />
                ))}
            </div>
        </div>
    )
}

function BookCard({ book }: { book: Book }) {
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
        <div className="border rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
            <div className="relative w-full aspect-[3/4] mb-4">
                {book.image ? (
                    <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain rounded-md"
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                        No Image
                    </div>
                )}
            </div>
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{book.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
                By {book.authors?.join(', ') || 'Unknown Author'}
            </p>
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {book.description || 'No description available'}
            </p>
            <div className="mt-auto flex gap-2">
                <button
                    onClick={handleSaveBook}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex-1"
                >
                    Save Book
                </button>
                {book.link && (
                    <a
                        href={book.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Buy
                    </a>
                )}
            </div>
        </div>
    )
}

export default SearchBooks 