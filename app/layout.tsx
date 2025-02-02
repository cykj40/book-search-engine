import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCProvider } from '@/app/providers'

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
        <html lang="en">
            <body>
                <ClerkProvider>
                    <TRPCProvider>
                        {children}
                    </TRPCProvider>
                </ClerkProvider>
            </body>
        </html>
    )
} 