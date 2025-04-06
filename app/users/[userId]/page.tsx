'use client'

import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/app/utils/trpc'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function UserBooksPage() {
    const { userId } = useParams()
    const router = useRouter()
    const { user: currentUser, isLoaded } = useUser()
    const [error, setError] = useState<string | null>(null)

    const {
        data: userBooks,
        isLoading,
        error: queryError
    } = trpc.getUserBooks.useQuery(
        { userId: userId as string },
        {
            // Only run the query if this is the user's own profile
            enabled: isLoaded && currentUser?.id === userId,
            retry: false,
            onError: (err) => {
                setError(err.message)
            }
        }
    )

    // Redirect to own profile if trying to access another user's profile
    useEffect(() => {
        if (isLoaded && currentUser && currentUser.id !== userId) {
            setError('You can only view your own book collection')
            // Could redirect here if desired:
            // router.push(`/users/${currentUser.id}`)
        }
    }, [isLoaded, currentUser, userId, router])

    // Loading state
    if (!isLoaded || isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
            </div>
        )
    }

    // Handle authentication error
    if (!currentUser) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="text-center py-10">
                    <h2 className="text-xl font-medium text-gray-600">
                        You need to be signed in to view book collections
                    </h2>
                    <div className="mt-4 flex justify-center gap-4">
                        <Link
                            href="/sign-in"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Back to Search
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Handle permission error 
    if (error || currentUser.id !== userId) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="text-center py-10">
                    <h2 className="text-xl font-medium text-red-600">
                        {error || 'You can only view your own book collection'}
                    </h2>
                    <div className="mt-4 flex justify-center gap-4">
                        {currentUser && (
                            <Link
                                href={`/users/${currentUser.id}`}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                View Your Collection
                            </Link>
                        )}
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Back to Search
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Handle empty collection
    if (!userBooks || userBooks.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="text-center py-10">
                    <h2 className="text-xl font-medium text-gray-600">
                        You haven't saved any books yet
                    </h2>
                    <div className="mt-4">
                        <Link href="/" className="text-blue-500 hover:underline">
                            Return to search
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Display books (only reached for your own collection)
    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Your Book Collection
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {userBooks.length} {userBooks.length === 1 ? 'book' : 'books'} saved
                    </p>
                </div>

                <Link
                    href="/"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Back to Search
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBooks.map((book) => (
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
                            {book.link && (
                                <a
                                    href={book.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors flex-1 text-center"
                                >
                                    Buy Book
                                </a>
                            )}

                            <Link
                                href="/saved"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex-1 text-center"
                            >
                                Manage Collection
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 