# Account Creation Feature

## Overview
The account creation feature allows users to register for the Smart Classroom Management System. Both admin and student accounts can be created through two methods:

1. **Public Registration** - Available at `/create-account` for self-registration
2. **Admin User Management** - Available at `/admin/users` for admins to create accounts for others

## Features Implemented

### 1. Public Account Creation (`/create-account`)
- **Location**: `frontend/src/components/CreateAccount.jsx`
- **Access**: Public (no authentication required)
- **Features**:
  - Email and password registration
  - Role selection (Admin or Student)
  - Student UID field (required for student accounts)
  - Password confirmation
  - Form validation
  - Success/error messaging
  - Auto-redirect to login after successful registration
  - Link to login page for existing users

### 2. Admin User Management (`/admin/users`)
- **Location**: `frontend/src/pages/admin/UserManagement.jsx`
- **Access**: Admin only (protected route)
- **Features**:
  - Create new user accounts (admin or student)
  - View all existing users in a table
  - Delete user accounts
  - Display user details (email, role, student UID, creation date)
  - Real-time user list updates
  - Success/error notifications

### 3. Updated AuthContext
- **Location**: `frontend/src/contexts/AuthContext.jsx`
- **New Function**: `signup(email, password, role, studentUid)`
  - Creates Supabase auth user
  - Creates corresponding record in `users` table
  - Handles errors and loading states
  - Returns success/error status

### 4. Updated Login Component
- **Location**: `frontend/src/components/Login.jsx`
- **Enhancement**: Added link to create account page

### 5. Updated Admin Layout
- **Location**: `frontend/src/components/AdminLayout.jsx`
- **Enhancement**: Added "User Management" navigation item

## User Flow

### Self-Registration Flow
1. User visits `/create-account`
2. Fills out registration form:
   - Email address
   - Account type (Admin/Student)
   - Student UID (if student)
   - Password
   - Confirm password
3. Submits form
4. System creates Supabase auth account
5. System creates user record in database
6. Success message displayed
7. Auto-redirect to login page after 3 seconds

### Admin-Created Account Flow
1. Admin logs in and navigates to `/admin/users`
2. Fills out user creation form
3. Submits form
4. New account is created
5. User appears in the users list
6. New user can log in with provided credentials

## Validation Rules

### Email
- Required field
- Must be valid email format
- Must be unique (enforced by Supabase)

### Password
- Required field
- Minimum 6 characters
- Must match confirmation (public registration only)

### Role
- Required field
- Must be either "admin" or "student"

### Student UID
- Required only for student accounts
- Must match an existing student UID in the students table

## Database Schema

The feature uses the existing `users` table:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    student_uid TEXT REFERENCES students(uid),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Routes Added

- `/create-account` - Public account creation page
- `/admin/users` - Admin user management page (protected)

## Security Considerations

1. **Password Security**: Passwords are handled by Supabase Auth and never stored in plain text
2. **Role-Based Access**: User Management page is protected and only accessible to admins
3. **Email Verification**: Supabase can be configured to require email verification
4. **Input Validation**: All inputs are validated on the client side before submission
5. **Error Handling**: Detailed error messages help users correct issues

## Usage Examples

### Creating an Admin Account (Public)
1. Navigate to `/create-account`
2. Enter email: `admin@example.com`
3. Select role: `Admin`
4. Enter password: `securepass123`
5. Confirm password: `securepass123`
6. Click "Create Account"

### Creating a Student Account (Public)
1. Navigate to `/create-account`
2. Enter email: `student@example.com`
3. Select role: `Student`
4. Enter student UID: `ABC123XYZ`
5. Enter password: `studentpass123`
6. Confirm password: `studentpass123`
7. Click "Create Account"

### Creating Accounts as Admin
1. Log in as admin
2. Navigate to `/admin/users`
3. Fill out the form with user details
4. Click "Create Account"
5. New user appears in the list below

## Future Enhancements

Potential improvements for future iterations:
- Email verification requirement
- Password reset functionality
- Bulk user import from CSV
- User role modification
- Account suspension/activation
- Password strength indicator
- Two-factor authentication
- User activity logs
- Profile editing for users
