# API Documentation

## Overview

This is a Next.js book search and management application that allows users to search for books using the Google Books API, save books to their personal collection, and manage their saved books. The application uses tRPC for type-safe API calls, Prisma for database management, and Clerk for authentication.

## Architecture

- **Frontend**: Next.js 13+ with App Router, React, TypeScript, Tailwind CSS
- **Backend**: tRPC server with Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **External APIs**: Google Books API

---

## 📚 React Components

### MainNav

Navigation component that provides the main header and navigation links.

**Location**: `app/components/MainNav.tsx`

#### Props
- None (uses Clerk hooks internally)

#### Usage
```tsx
import { MainNav } from '@/app/components/MainNav'

export default function Layout() {
  return (
    <div>
      <MainNav />
      {/* Rest of your app */}
    </div>
  )
}
```

#### Features
- Conditional rendering based on authentication status
- Sign-in/Sign-up buttons for unauthenticated users
- User profile button and saved books link for authenticated users
- Responsive design with Tailwind CSS

#### Dependencies
- `@clerk/nextjs` - Authentication hooks and components
- `next/link` - Client-side navigation

---

### SearchBooks

Main search interface for finding books using the Google Books API.

**Location**: `app/components/SearchBooks.tsx`

#### Props
- None (self-contained component)

#### Usage
```tsx
import { SearchBooks } from '@/app/components/SearchBooks'

export default function SearchPage() {
  return <SearchBooks />
}
```

#### Features
- **Debounced search**: 500ms delay to prevent excessive API calls
- **Real-time results**: Updates as user types
- **Book deduplication**: Removes duplicate books by ID
- **Responsive grid layout**: Adapts to screen sizes
- **Save functionality**: Allows users to save books to their collection
- **External links**: Direct links to purchase books

#### Internal Components
- `BookCard`: Individual book display and interaction component

#### State Management
- `query`: Current search input
- `debouncedQuery`: Debounced search term for API calls
- Uses tRPC hooks for data fetching and mutations

---

### SavedBooks

Displays user's saved book collection with management capabilities.

**Location**: `app/components/SavedBooks.tsx`

#### Props
- None (fetches user's saved books automatically)

#### Usage
```tsx
import { SavedBooks } from '@/app/components/SavedBooks'

export default function SavedPage() {
  return <SavedBooks />
}
```

#### Features
- **Grid layout**: Responsive display of saved books
- **Book removal**: Delete books from collection
- **Purchase links**: Direct links to buy books
- **Empty state**: Friendly message when no books are saved
- **Loading states**: Spinner during data fetching

#### API Integration
- Uses `trpc.getSavedBooks.useQuery()` for data fetching
- Uses `trpc.deleteBook.useMutation()` for book removal

---

### UserProfile

User profile component showing user information and collection statistics.

**Location**: `app/components/UserProfile.tsx`

#### Props
- None (uses Clerk user context)

#### Usage
```tsx
import { UserProfile } from '@/app/components/UserProfile'

export default function ProfilePage() {
  return <UserProfile />
}
```

#### Features
- **User information**: Displays name, username, and avatar
- **Collection stats**: Shows number of saved books
- **Navigation links**: Links to saved books and personal dashboard
- **Authentication prompts**: Sign-in/sign-up buttons for unauthenticated users
- **Loading states**: Skeleton loader while user data loads

#### Dependencies
- `@clerk/nextjs` - User authentication and profile data
- `next/link` - Navigation

---

## 🔧 Server APIs (tRPC)

### searchBooks

Searches for books using the Google Books API.

**Location**: `server/trpc/router.ts`

#### Input Schema
```typescript
{
  query: string          // Search query (minimum 1 character)
  maxResults: number     // Number of results (1-40, default: 12)
}
```

#### Output Schema
```typescript
{
  books: Book[]          // Array of book objects
  nextPage: boolean      // Whether more results are available
  currentPage: number    // Current page number (always 1)
}
```

#### Usage
```typescript
// Client-side usage
const { data, isLoading } = trpc.searchBooks.useQuery({
  query: "javascript",
  maxResults: 20
})
```

#### Error Handling
- Returns `INTERNAL_SERVER_ERROR` if Google Books API fails
- Validates input parameters with Zod

---

### saveBook

Saves a book to the user's collection.

**Location**: `server/trpc/router.ts`

#### Input Schema
```typescript
{
  bookId: string         // Google Books ID
  title: string          // Book title
  authors: string[]      // Array of author names
  description?: string   // Book description (optional)
  image?: string         // Cover image URL (optional)
  link?: string          // Purchase link (optional)
}
```

#### Output Schema
```typescript
Book // Prisma Book model with all fields
```

#### Usage
```typescript
// Client-side usage
const saveBookMutation = trpc.saveBook.useMutation({
  onSuccess: () => {
    alert('Book saved successfully!')
  }
})

await saveBookMutation.mutateAsync({
  bookId: "abc123",
  title: "JavaScript: The Good Parts",
  authors: ["Douglas Crockford"],
  description: "A book about JavaScript...",
  image: "https://...",
  link: "https://..."
})
```

#### Error Handling
- Returns `UNAUTHORIZED` if user is not authenticated
- Returns `CONFLICT` if book is already saved by the user
- Prevents duplicate saves per user

---

### getSavedBooks

Retrieves all books saved by the current user.

**Location**: `server/trpc/router.ts`

#### Input Schema
- None (uses authenticated user context)

#### Output Schema
```typescript
Book[] // Array of saved books ordered by creation date (newest first)
```

#### Usage
```typescript
// Client-side usage
const { data: savedBooks, isLoading } = trpc.getSavedBooks.useQuery()

// With data transformation
const { data: bookCount } = trpc.getSavedBooks.useQuery(undefined, {
  select: (data) => data.length
})
```

#### Error Handling
- Returns `UNAUTHORIZED` if user is not authenticated
- Returns empty array if no books are saved

---

### deleteBook

Removes a book from the user's collection.

**Location**: `server/trpc/router.ts`

#### Input Schema
```typescript
{
  bookId: string // Google Books ID of the book to remove
}
```

#### Output Schema
```typescript
{ count: number } // Number of deleted records
```

#### Usage
```typescript
// Client-side usage
const deleteMutation = trpc.deleteBook.useMutation({
  onSuccess: () => {
    refetch() // Refresh the books list
  }
})

await deleteMutation.mutateAsync({ bookId: "abc123" })
```

#### Error Handling
- Returns `UNAUTHORIZED` if user is not authenticated
- Only deletes books owned by the current user

---

### getUserBooks

Retrieves books for a specific user (currently restricted to own books only).

**Location**: `server/trpc/router.ts`

#### Input Schema
```typescript
{
  userId: string // User ID to fetch books for
}
```

#### Output Schema
```typescript
Book[] // Array of books ordered by creation date (newest first)
```

#### Usage
```typescript
// Client-side usage
const { data: userBooks } = trpc.getUserBooks.useQuery({
  userId: "user_123"
})
```

#### Error Handling
- Returns `UNAUTHORIZED` if user is not authenticated
- Returns `FORBIDDEN` if trying to access another user's books
- Currently implements strict privacy policy

---

## 📖 Library Functions

### Google Books API Integration

**Location**: `lib/google-books.ts`

#### searchBooks Function

Searches the Google Books API and returns formatted results.

```typescript
async function searchBooks(
  query: string,
  maxResults: number = 12
): Promise<Book[]>
```

#### Parameters
- `query`: Search query string
- `maxResults`: Maximum number of results (default: 12)

#### Return Type
```typescript
interface Book {
  bookId: string
  title: string
  authors: string[]
  description: string
  image: string
  link: string
  publishedDate?: string
  publisher?: string
  categories: string[]
  pageCount?: number
  language?: string
}
```

#### Usage
```typescript
import { searchBooks } from '@/lib/google-books'

const books = await searchBooks("javascript", 20)
```

#### Error Handling
- Throws error if `GOOGLE_BOOKS_API_KEY` is not set
- Handles API rate limiting and network errors
- Logs detailed error information

#### Type Definitions

```typescript
interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail: string
      smallThumbnail: string
    }
    infoLink?: string
    publishedDate?: string
    publisher?: string
    categories?: string[]
    pageCount?: number
    language?: string
  }
  saleInfo?: {
    buyLink?: string
  }
}
```

---

### Prisma Database Client

**Location**: `lib/prisma.ts`

#### Configuration
Global singleton Prisma client with connection pooling and query logging.

```typescript
export const prisma: PrismaClient
```

#### Usage
```typescript
import { prisma } from '@/lib/prisma'

// Find user books
const books = await prisma.book.findMany({
  where: { userId: "user_123" },
  orderBy: { createdAt: 'desc' }
})

// Create a new book
const book = await prisma.book.create({
  data: {
    bookId: "abc123",
    title: "Book Title",
    authors: ["Author Name"],
    userId: "user_123"
  }
})
```

#### Features
- **Development logging**: Query logging enabled in development
- **Global singleton**: Prevents multiple client instances
- **Connection pooling**: Efficient database connections

---

## 🗄️ Database Models

### User Model

**Location**: `prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  books     Book[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Fields
- `id`: Unique identifier (CUID)
- `email`: User's email address (unique)
- `username`: Username (unique)
- `books`: One-to-many relationship with Book model
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

---

### Book Model

**Location**: `prisma/schema.prisma`

```prisma
model Book {
  id          String   @id @default(cuid())
  bookId      String   // Google Books ID
  title       String
  authors     String[]
  description String?
  image       String?
  link        String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

#### Fields
- `id`: Unique identifier (CUID)
- `bookId`: Google Books API identifier
- `title`: Book title
- `authors`: Array of author names
- `description`: Book description (optional)
- `image`: Cover image URL (optional)
- `link`: Purchase link (optional)
- `userId`: Foreign key to User model
- `user`: Many-to-one relationship with User model
- `createdAt`: Save timestamp
- `updatedAt`: Last update timestamp

#### Indexes
- `userId` index for efficient user book queries

---

## 🔐 Authentication & Context

### tRPC Context

**Location**: `server/trpc/context.ts`

Provides authentication and database context for tRPC procedures.

```typescript
export async function createContext({ req }: FetchCreateContextFnOptions): Promise<Context>
```

#### Context Object
```typescript
interface Context {
  session: {
    userId: string | null
  }
  prisma: PrismaClient
}
```

#### Usage
```typescript
// In tRPC procedures
t.procedure.query(async ({ ctx }) => {
  const userId = ctx.session.userId
  const books = await ctx.prisma.book.findMany({
    where: { userId }
  })
})
```

---

### Client-side tRPC

**Location**: `app/utils/trpc.ts`

Type-safe tRPC client for React components.

```typescript
export const trpc = createTRPCReact<AppRouter>()
export type RouterOutputs = inferRouterOutputs<AppRouter>
```

#### Usage
```typescript
import { trpc } from '@/app/utils/trpc'

function Component() {
  const { data, isLoading } = trpc.searchBooks.useQuery({
    query: "javascript",
    maxResults: 12
  })
}
```

---

## 🎨 Styling & UI

### Tailwind CSS Classes

Common utility classes used throughout the application:

#### Layout
- `max-w-6xl mx-auto`: Centered container with max width
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`: Responsive grid
- `flex items-center justify-between`: Flex layout with space between

#### Buttons
- `bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md`: Primary button
- `bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md`: Danger button
- `bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md`: Secondary button

#### Cards
- `border rounded-lg shadow-md hover:shadow-lg transition-shadow p-4`: Card layout
- `aspect-[3/4]`: Book cover aspect ratio

#### Loading States
- `animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500`: Loading spinner
- `animate-pulse h-10 w-48 bg-gray-200 rounded-md`: Skeleton loader

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Books API key
- Clerk account for authentication

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Google Books API
GOOGLE_BOOKS_API_KEY="your_api_key_here"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

### Installation
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 📝 Usage Examples

### Complete Book Search Flow

```typescript
import { SearchBooks } from '@/app/components/SearchBooks'

export default function SearchPage() {
  return (
    <div className="container mx-auto">
      <h1>Find Your Next Book</h1>
      <SearchBooks />
    </div>
  )
}
```

### User's Saved Books

```typescript
import { SavedBooks } from '@/app/components/SavedBooks'

export default function SavedPage() {
  return (
    <div className="container mx-auto">
      <h1>My Book Collection</h1>
      <SavedBooks />
    </div>
  )
}
```

### Custom tRPC Usage

```typescript
import { trpc } from '@/app/utils/trpc'

export function BookStats() {
  const { data: books } = trpc.getSavedBooks.useQuery()
  const bookCount = books?.length || 0
  
  return (
    <div>
      <h2>Collection Stats</h2>
      <p>You have saved {bookCount} books</p>
    </div>
  )
}
```

---

## 🔧 Extending the API

### Adding New tRPC Procedures

```typescript
// In server/trpc/router.ts
export const appRouter = t.router({
  // ... existing procedures
  
  markAsRead: t.procedure
    .input(z.object({ bookId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Must be logged in'
        })
      }
      
      return ctx.prisma.book.update({
        where: { 
          bookId: input.bookId,
          userId: ctx.session.userId 
        },
        data: { isRead: true }
      })
    })
})
```

### Adding New Components

```typescript
// Create new component
export function BookRecommendations() {
  const { data: books } = trpc.getRecommendations.useQuery()
  
  return (
    <div className="recommendations">
      {books?.map(book => (
        <BookCard key={book.bookId} book={book} />
      ))}
    </div>
  )
}
```

---

## 🐛 Error Handling

### Common Error Types

1. **Authentication Errors**
   - `UNAUTHORIZED`: User not logged in
   - `FORBIDDEN`: Insufficient permissions

2. **Validation Errors**
   - Invalid input parameters
   - Missing required fields

3. **External API Errors**
   - Google Books API rate limits
   - Network connectivity issues

4. **Database Errors**
   - Constraint violations
   - Connection issues

### Error Handling Patterns

```typescript
// In components
const mutation = trpc.saveBook.useMutation({
  onError: (error) => {
    if (error.data?.code === 'CONFLICT') {
      alert('Book already saved!')
    } else {
      alert('Failed to save book')
    }
  }
})
```

---

## 📊 Performance Considerations

### Optimization Features

1. **Query Caching**: tRPC with React Query provides automatic caching
2. **Image Optimization**: Next.js Image component with proper sizing
3. **Debounced Search**: Prevents excessive API calls
4. **Database Indexing**: Indexed queries for better performance

### Recommended Practices

- Use `select` option to transform data client-side
- Implement proper loading states
- Add error boundaries for graceful error handling
- Use React.memo for expensive components

---

This documentation covers all public APIs, functions, and components in the application. Each section includes comprehensive examples, error handling, and usage instructions for developers working with this codebase.