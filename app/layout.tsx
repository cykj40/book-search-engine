import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCProvider } from './providers'
import { MainNav } from './components/MainNav'

export const metadata = {
    title: 'Book Search Engine',
    description: 'Search and save books with a modern tech stack!',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body>
                    <TRPCProvider>
                        <MainNav />
                        <main className="min-h-screen">
                            {children}
                        </main>
                    </TRPCProvider>
                </body>
            </html>
        </ClerkProvider>
    )
} 