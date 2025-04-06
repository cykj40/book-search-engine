'use client'

import { trpc } from '@/app/utils/trpc'
import Image from 'next/image'

export function SavedBooks() {
    const { data: savedBooks, isLoading, refetch } = trpc.getSavedBooks.useQuery()

    // Handle book deletion
    const deleteMutation = trpc.deleteBook.useMutation({
        onSuccess: () => {
            refetch()
        }
    })

    const handleDeleteBook = async (bookId: string) => {
        try {
            await deleteMutation.mutateAsync({ bookId })
        } catch (error) {
            console.error('Error deleting book:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        )
    }

    if (!savedBooks || savedBooks.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-medium text-gray-600">You haven&apos;t saved any books yet</h2>
                <p className="mt-2 text-gray-500">Search for books and click &quot;Save&quot; to add them to your collection.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBooks.map((book) => (
                <div key={book.bookId} className="border rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
                    <div className="relative w-full aspect-[3/4] mb-4">
                        {book.image ? (
                            <Image
                                src={book.image}
                                alt={book.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain rounded-md"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                                No Image
                            </div>
                        )}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        By {book.authors?.join(', ') || 'Unknown Author'}
                    </p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                        {book.description || 'No description available'}
                    </p>
                    <div className="mt-auto flex gap-2">
                        <button
                            onClick={() => handleDeleteBook(book.bookId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex-1"
                        >
                            Remove
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
            ))}
        </div>
    )
} 