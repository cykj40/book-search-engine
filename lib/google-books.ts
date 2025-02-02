const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

if (!GOOGLE_BOOKS_API_KEY) {
    throw new Error('Missing GOOGLE_BOOKS_API_KEY environment variable');
}

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
    saleInfo?: {
        buyLink?: string;
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

export interface Book {
    bookId: string;
    title: string;
    authors: string[];
    description: string;
    image: string;
    link: string;
    publishedDate?: string;
    publisher?: string;
    categories: string[];
    pageCount?: number;
    language?: string;
}

export async function searchBooks(query: string, maxResults: number = 12): Promise<Book[]> {
    try {
        const params = new URLSearchParams({
            q: query,
            maxResults: maxResults.toString(),
            key: GOOGLE_BOOKS_API_KEY,
            // Add saleInfo to the fields we request
            fields: 'items(id,volumeInfo(title,authors,description,imageLinks,publishedDate,publisher,categories,pageCount,language),saleInfo(buyLink))'
        });

        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Books API error:', errorText);
            throw new Error(`Google Books API error: ${response.statusText}`);
        }

        const data: GoogleBooksResponse = await response.json();

        return data.items?.map((book) => ({
            bookId: book.id,
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors || [],
            description: book.volumeInfo.description || '',
            image: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            link: book.saleInfo?.buyLink || '',
            publishedDate: book.volumeInfo.publishedDate,
            publisher: book.volumeInfo.publisher,
            categories: book.volumeInfo.categories || [],
            pageCount: book.volumeInfo.pageCount,
            language: book.volumeInfo.language,
        })) || [];
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}

export { searchBooks, type Book, type GoogleBook, type GoogleBooksResponse } 