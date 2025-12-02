# Smart Classroom Management System - Backend

Backend API for the Smart Classroom Management System built with Supabase (PostgreSQL) and Node.js.

## Overview

This backend provides REST API endpoints for:
- Student registration and management
- Attendance logging and tracking
- Room allocation and availability
- Timetable management
- Authentication and authorization

## Technology Stack

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: REST endpoints via Supabase client
- **Runtime**: Node.js (optional for custom middleware)

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account (free tier available)

## Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: smart-classroom-management
   - Database Password: (save this securely)
   - Region: (choose closest to you)
5. Wait for project to be created (~2 minutes)

### 2. Get API Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 4. Run Database Migrations

Execute the SQL migrations in Supabase SQL Editor:

1. Go to SQL Editor in Supabase dashboard
2. Run the migration files in order:
   - `migrations/001_create_students_table.sql`
   - `migrations/002_create_attendance_logs_table.sql`
   - `migrations/003_create_rooms_table.sql`
   - `migrations/004_create_timetable_table.sql`
   - `migrations/005_create_users_table.sql`

### 5. Install Dependencies

```bash
npm install
```

### 6. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Database Schema

### students
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `uid` (TEXT, Unique) - RFID card UID
- `email` (TEXT)
- `phone` (TEXT)
- `dob` (DATE)
- `course` (TEXT)
- `created_at` (TIMESTAMPTZ)

### attendance_logs
- `id` (SERIAL, Primary Key)
- `student_uid` (TEXT, Foreign Key → students.uid)
- `timestamp` (TIMESTAMPTZ)
- `status` (TEXT) - 'present' or 'absent'

### rooms
- `id` (SERIAL, Primary Key)
- `room_no` (TEXT, Unique)
- `is_busy` (BOOLEAN)
- `current_class` (TEXT)
- `professor_name` (TEXT)
- `updated_at` (TIMESTAMPTZ)

### timetable
- `id` (SERIAL, Primary Key)
- `course` (TEXT)
- `day_of_week` (INTEGER) - 0=Sunday, 6=Saturday
- `start_time` (TIME)
- `end_time` (TIME)
- `subject` (TEXT)
- `room_no` (TEXT, Foreign Key → rooms.room_no)
- `professor_name` (TEXT)

### users
- `id` (UUID, Primary Key)
- `email` (TEXT, Unique)
- `role` (TEXT) - 'admin' or 'student'
- `student_uid` (TEXT, Foreign Key → students.uid)
- `created_at` (TIMESTAMPTZ)

## API Endpoints

### Attendance Endpoints

#### POST /api/attendance
Log attendance from ESP32 device.

**Request Body**:
```json
{
  "uid": "A1B2C3D4"
}
```

**Response**: `200 OK`

#### GET /api/attendance
Get all attendance logs (Admin only).

**Response**:
```json
[
  {
    "id": 1,
    "student_uid": "A1B2C3D4",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "present",
    "student_name": "John Doe"
  }
]
```

#### GET /api/attendance/:uid
Get attendance logs for specific student.

**Response**: Array of attendance logs

### Student Endpoints

#### POST /api/students
Register new student (Admin only).

**Request Body**:
```json
{
  "name": "John Doe",
  "uid": "A1B2C3D4",
  "email": "john@example.com",
  "phone": "1234567890",
  "dob": "2000-01-15",
  "course": "Computer Science"
}
```

#### GET /api/students
List all students (Admin only).

#### GET /api/students/:uid
Get student details.

#### PUT /api/students/:uid
Update student information (Admin only).

#### DELETE /api/students/:uid
Delete student (Admin only).

#### GET /api/students/latest-scan
Get most recently scanned RFID UID.

### Room Endpoints

#### GET /api/rooms
List all rooms.

#### GET /api/rooms/available
Get available rooms (is_busy = false).

#### POST /api/rooms/allocate
Allocate a room (Admin only).

**Request Body**:
```json
{
  "room_no": "101",
  "subject": "Data Structures",
  "professor_name": "Dr. Smith"
}
```

#### PUT /api/rooms/:id/release
Release a room (Admin only).

### Timetable Endpoints

#### GET /api/timetable/:course
Get timetable for a course.

#### POST /api/timetable
Create timetable entry (Admin only).

#### GET /api/timetable/current/:course
Get current lecture information.

## Authentication & Authorization

The system uses Supabase Auth with JWT tokens and role-based access control (RBAC).

### User Roles

- **Admin**: Full access to all endpoints (create, read, update, delete)
- **Student**: Read-only access to personal data only

### Authentication Flow

1. User logs in via Supabase Auth (frontend)
2. Supabase returns JWT access token
3. Frontend includes token in `Authorization: Bearer <token>` header
4. Backend middleware verifies token and fetches user role
5. Role-based middleware checks permissions

### Middleware Functions

The system provides four middleware functions in `middleware/auth.js`:

#### `authenticate(req, res, next)`
Verifies JWT token and attaches user info to request.

**Usage**: Required for all protected endpoints
```javascript
router.get('/protected', authenticate, async (req, res) => {
  // req.user contains: { id, email, role, studentUid }
});
```

#### `requireAdmin(req, res, next)`
Ensures user has admin role.

**Usage**: Admin-only endpoints
```javascript
router.post('/students', authenticate, requireAdmin, async (req, res) => {
  // Only admins can access
});
```

#### `requireStudent(req, res, next)`
Ensures user has student role (or admin).

**Usage**: Student-accessible endpoints
```javascript
router.get('/my-data', authenticate, requireStudent, async (req, res) => {
  // Students and admins can access
});
```

#### `requireOwnData(req, res, next)`
Ensures students can only access their own data (admins can access any).

**Usage**: Endpoints with `:uid` parameter
```javascript
router.get('/students/:uid', authenticate, requireOwnData, async (req, res) => {
  // Students can only access their own UID
  // Admins can access any UID
});
```

### Protected Endpoints

#### Public Endpoints (No Authentication)
- `POST /api/attendance` - ESP32 device endpoint

#### Authenticated Endpoints (Any Role)
- `GET /api/rooms`
- `GET /api/rooms/available`
- `GET /api/timetable/:course`
- `GET /api/timetable/current/:course`

#### Admin-Only Endpoints
- `POST /api/students` - Register student
- `GET /api/students` - List all students
- `PUT /api/students/:uid` - Update student
- `DELETE /api/students/:uid` - Delete student
- `GET /api/students/scan/latest` - Get latest RFID scan
- `GET /api/attendance` - View all attendance logs
- `POST /api/rooms/allocate` - Allocate room
- `PUT /api/rooms/:id/release` - Release room
- `POST /api/rooms` - Create room
- `POST /api/timetable` - Create timetable entry

#### Student/Admin Endpoints (Own Data Only)
- `GET /api/students/:uid` - Get student details
- `GET /api/attendance/:uid` - Get student attendance

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```javascript
// Example: Fetch student data
fetch('http://localhost:3000/api/students/A1B2C3D4', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```

### Error Responses

**401 Unauthorized** - No token or invalid token
```json
{
  "error": "Unauthorized - No token provided"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "error": "Forbidden - Admin access required"
}
```

**403 Forbidden** - Accessing other student's data
```json
{
  "error": "Forbidden - Can only access own data"
}
```

## Error Handling

Standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `422` - Unprocessable Entity (invalid data format)
- `500` - Internal Server Error
- `503` - Service Unavailable

## Testing

Run tests:
```bash
npm test
```

## Deployment

### Supabase Hosting

Supabase provides built-in API hosting. No additional deployment needed for basic CRUD operations.

### Custom Backend (Optional)

If you need custom middleware or business logic:

1. Deploy to Vercel, Heroku, or Railway
2. Set environment variables
3. Update frontend API URL

## Project Structure

```
backend/
├── migrations/              # SQL migration files
│   ├── 001_create_students_table.sql
│   ├── 002_create_attendance_logs_table.sql
│   ├── 003_create_rooms_table.sql
│   ├── 004_create_timetable_table.sql
│   └── 005_create_users_table.sql
├── .env.example            # Environment variables template
├── .env                    # Environment variables (gitignored)
├── package.json            # Dependencies
└── README.md               # This file
```

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use service_role key carefully** - Only for admin operations
3. **Enable Row Level Security (RLS)** in Supabase
4. **Validate all inputs** - Prevent SQL injection
5. **Use HTTPS** - Always in production
6. **Rate limiting** - Prevent abuse
7. **CORS configuration** - Restrict allowed origins

## Troubleshooting

### Connection Issues
- Verify Supabase URL and keys are correct
- Check network connectivity
- Ensure Supabase project is active

### Migration Errors
- Run migrations in correct order
- Check for syntax errors in SQL
- Verify table dependencies

### Authentication Errors
- Verify JWT token is valid
- Check user role in users table
- Ensure RLS policies are configured

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review error logs in Supabase dashboard
3. Check API logs for detailed error messages
