'use client'

// Modern Next.js with Server Components
import { SearchBooks } from './components/SearchBooks'
import { UserProfile } from './components/UserProfile'

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-center">Book Search Engine</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <UserProfile />
                </div>

                <div className="md:col-span-3">
                    <SearchBooks />
                </div>
            </div>
        </div>
    )
} 