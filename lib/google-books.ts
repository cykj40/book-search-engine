const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: {
            thumbnail: string;
            smallThumbnail: string;
        };
        infoLink?: string;
        publishedDate?: string;
        publisher?: string;
        categories?: string[];
        pageCount?: number;
        language?: string;
    };
}

export interface GoogleBooksResponse {
    items: GoogleBook[];
    totalItems: number;
}

interface SearchOptions {
    maxResults?: number;
    startIndex?: number;
}

export async function searchGoogleBooks(query: string, options: SearchOptions = {}) {
    const { maxResults = 12, startIndex = 0 } = options;

    try {
        const params = new URLSearchParams({
            q: query,
            key: GOOGLE_BOOKS_API_KEY!,
            maxResults: maxResults.toString(),
            startIndex: startIndex.toString(),
        });

        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.statusText}`);
        }

        const data: GoogleBooksResponse = await response.json();

        // Transform and validate the response
        return data.items?.map((book) => ({
            bookId: book.id,
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors || [],
            description: book.volumeInfo.description || '',
            image: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            link: book.volumeInfo.infoLink || '',
            publishedDate: book.volumeInfo.publishedDate,
            publisher: book.volumeInfo.publisher,
            categories: book.volumeInfo.categories || [],
            pageCount: book.volumeInfo.pageCount,
            language: book.volumeInfo.language,
        })) || [];
    } catch (error) {
        console.error('Error searching Google Books:', error);
        throw error;
    }
} 