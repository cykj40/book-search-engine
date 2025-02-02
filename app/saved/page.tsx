import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SavedBooks } from '../components/SavedBooks'

export default async function SavedPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Saved Books</h1>
            <SavedBooks />
        </div>
    )
} 