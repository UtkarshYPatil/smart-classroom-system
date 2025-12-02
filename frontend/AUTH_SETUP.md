# Authentication System Setup

## Overview
The authentication system has been successfully implemented using Supabase Auth with role-based access control.

## Components Created

### 1. Supabase Client (`src/lib/supabase.js`)
- Initializes Supabase client with environment variables
- Used throughout the app for authentication and database operations

### 2. Auth Context (`src/contexts/AuthContext.jsx`)
- Provides authentication state management
- Functions: `login()`, `logout()`
- Automatically fetches user role from `users` table
- Manages loading and error states

### 3. Login Component (`src/components/Login.jsx`)
- Email and password input fields
- Client-side validation
- Error handling and display
- Loading states with spinner
- Styled with Tailwind CSS

### 4. Protected Route (`src/components/ProtectedRoute.jsx`)
- Protects routes requiring authentication
- Checks user role and redirects accordingly
- Shows loading state during authentication check

### 5. Admin Panel (`src/pages/AdminPanel.jsx`)
- Placeholder for admin features
- Accessible only to users with `role = 'admin'`

### 6. Student Panel (`src/pages/StudentPanel.jsx`)
- Placeholder for student features
- Accessible only to users with `role = 'student'`
- Displays student UID

## Environment Variables Required

Create a `.env` file in the frontend directory with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000
VITE_ENV=development
```

## Database Requirements

The authentication system expects a `users` table in Supabase with the following schema:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    student_uid TEXT REFERENCES students(uid),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Routing Structure

- `/` - Root redirect (redirects to appropriate panel based on role)
- `/login` - Login page
- `/admin` - Admin panel (protected, admin role only)
- `/student` - Student panel (protected, student role only)

## Usage

### Login Flow
1. User enters email and password
2. System authenticates with Supabase Auth
3. System fetches user role from `users` table
4. User is redirected to appropriate panel based on role

### Logout Flow
1. User clicks logout button
2. System signs out from Supabase
3. User is redirected to login page

## Next Steps

The following features will be implemented in subsequent tasks:
- Admin Panel: Student registration, attendance logs, room allocation, timetable management
- Student Panel: Personal attendance view, timetable view, current lecture information
