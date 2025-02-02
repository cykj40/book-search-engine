'use client'

import { trpc } from '@/app/utils/trpc'
import Image from 'next/image'

export function SavedBooks() {
    const { data: books, isLoading } = trpc.getSavedBooks.useQuery()
    const deleteBook = trpc.deleteBook.useMutation()

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books?.map((book) => (
                <div key={book.id} className="border rounded-lg shadow-md p-4">
                    {book.image && (
                        <div className="relative w-full h-48 mb-4">
                            <Image
                                src={book.image}
                                alt={book.title}
                                fill
                                className="object-cover rounded-md"
                            />
                        </div>
                    )}
                    <h3 className="font-bold mb-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        By {book.authors.join(', ')}
                    </p>
                    <div className="flex justify-between items-center">
                        {book.link && (
                            <a
                                href={book.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                            >
                                Buy
                            </a>
                        )}
                        <button
                            onClick={() => deleteBook.mutate({ bookId: book.bookId })}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
} 