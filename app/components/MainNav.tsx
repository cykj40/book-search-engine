'use client'

import Link from 'next/link'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'

export function MainNav() {
    const { isSignedIn } = useUser()

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/"
                        className="text-gray-900 hover:text-gray-600 transition-colors"
                    >
                        Search
                    </Link>
                    {isSignedIn && (
                        <Link
                            href="/saved"
                            className="text-gray-900 hover:text-gray-600 transition-colors"
                        >
                            Saved Books
                        </Link>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {!isSignedIn ? (
                        <>
                            <SignInButton mode="modal">
                                <button className="text-gray-600 hover:text-gray-900">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </>
                    ) : (
                        <UserButton afterSignOutUrl="/" />
                    )}
                </div>
            </div>
        </nav>
    )
} 