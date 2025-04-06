'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { trpc } from '@/app/utils/trpc'

export function UserProfile() {
    const { user, isLoaded } = useUser()
    const { data: bookCount } = trpc.getSavedBooks.useQuery(undefined, {
        select: (data) => data.length
    })

    if (!isLoaded) {
        return <div className="animate-pulse h-10 w-48 bg-gray-200 rounded-md"></div>
    }

    if (!user) {
        return (
            <div className="text-center p-4 border rounded-lg bg-gray-50">
                <p className="mb-4">Sign in to create your collection</p>
                <div className="flex justify-center space-x-4">
                    <Link
                        href="/sign-in"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/sign-up"
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 border rounded-lg shadow-sm bg-white">
            <div className="flex items-center gap-4 mb-4">
                {user.imageUrl && (
                    <img
                        src={user.imageUrl}
                        alt={user.fullName || 'User'}
                        className="w-16 h-16 rounded-full"
                    />
                )}
                <div>
                    <h2 className="text-xl font-bold">{user.fullName || user.username}</h2>
                    <p className="text-gray-600">@{user.username || user.id.substring(0, 8)}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span>Books saved</span>
                    <span className="font-bold">{bookCount || 0}</span>
                </div>

                <Link
                    href="/saved"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-center mt-2"
                >
                    View Your Collection
                </Link>

                <Link
                    href={`/users/${user.id}`}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-center"
                >
                    Personal Dashboard
                </Link>
            </div>
        </div>
    )
} 