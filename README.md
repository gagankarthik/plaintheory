# Plain Theory

A newspaper-style blog with hidden authentication and a private notes dashboard built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Newspaper-Style Landing Page**: Classic newspaper design featuring AI-related articles
- **Hidden Authentication**: Click the "Plain Theory" logo 5 times to access the sign-up/sign-in page
- **Private Notes Dashboard**: Secure dashboard for creating and managing personal notes
- **Document Management**: Upload and attach documents to your notes
- **Supabase Authentication**: Secure user authentication and data storage

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the query to create tables and policies

### 5. Set Up Storage Bucket

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `documents`
3. Set the bucket to public or configure RLS policies as needed

### 6. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## How It Works

### Landing Page
- Features a classic newspaper layout with AI-themed articles
- **Secret Access**: Click the "Plain Theory" title 5 times to reveal the authentication page

### Authentication
- Sign up with email and password
- Sign in to access your private dashboard
- Supabase handles all authentication and session management

### Dashboard
- Create, edit, and delete notes
- Rich text content with auto-save functionality
- Upload documents and attach them to notes
- Download or delete attached documents
- All data is private and secured with Row Level Security (RLS)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication & Database**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
plaintheory/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (newspaper blog)
│   │   ├── auth/
│   │   │   └── page.tsx          # Authentication page
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Notes dashboard
│   │   └── layout.tsx
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.ts         # Client-side Supabase
│   │       ├── server.ts         # Server-side Supabase
│   │       └── middleware.ts     # Middleware client
│   └── middleware.ts             # Route middleware
├── supabase-schema.sql           # Database schema
└── package.json
```

## Database Schema

### Notes Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `title`: Text
- `content`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Documents Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `note_id`: UUID (foreign key to notes)
- `file_name`: Text
- `file_url`: Text
- `file_type`: Text
- `file_size`: Integer
- `created_at`: Timestamp

Both tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## License

MIT
