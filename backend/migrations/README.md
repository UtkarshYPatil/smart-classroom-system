# Database Migrations

This directory contains SQL migration files for the Smart Classroom Management System database schema.

## Migration Files

The migrations should be executed in the following order:

1. **001_create_students_table.sql** - Creates the students table with RFID UID mapping
2. **002_create_attendance_logs_table.sql** - Creates attendance logs with foreign key to students
3. **003_create_rooms_table.sql** - Creates rooms table for classroom management
4. **004_create_timetable_table.sql** - Creates timetable with room relationships
5. **005_create_users_table.sql** - Creates users table for authentication

## How to Run Migrations

### Option 1: Supabase SQL Editor (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order
5. Click **Run** to execute each migration
6. Verify success in the **Table Editor**

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

### Option 3: Run All Migrations Script

Use the provided script to run all migrations at once:

```bash
node run-migrations.js
```

## Database Schema Overview

### students
- Stores student information with RFID tag mapping
- Unique constraint on `uid` field
- Indexed on `uid` for fast lookups

### attendance_logs
- Timestamped attendance records
- Foreign key to `students.uid` with cascade delete
- Indexed on `student_uid` and `timestamp`

### rooms
- Classroom availability and allocation
- Unique constraint on `room_no`
- Indexed on `is_busy` for availability queries

### timetable
- Class schedule with room assignments
- Foreign key to `rooms.room_no`
- Indexed on `course` for fast course queries

### users
- Authentication and role-based access control
- Role constraint: 'admin' or 'student'
- Foreign key to `students.uid` for student users
- Check constraint: students must have `student_uid`

## Verification

After running migrations, verify the schema:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check students table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students';

-- Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('students', 'attendance_logs', 'rooms', 'timetable', 'users');

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## Rollback

If you need to rollback migrations:

```sql
-- Drop tables in reverse order (respects foreign keys)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS students CASCADE;
```

## Sample Data

After running migrations, you can insert sample data for testing:

```sql
-- Insert sample rooms
INSERT INTO rooms (room_no, is_busy) VALUES
('101', false),
('102', false),
('103', false),
('201', false),
('202', false);

-- Insert sample student
INSERT INTO students (name, uid, email, phone, dob, course) VALUES
('John Doe', 'A1B2C3D4', 'john@example.com', '1234567890', '2000-01-15', 'Computer Science');

-- Insert sample admin user
INSERT INTO users (email, role) VALUES
('admin@example.com', 'admin');

-- Insert sample student user (after creating student)
INSERT INTO users (email, role, student_uid) VALUES
('john@example.com', 'student', 'A1B2C3D4');
```

## Troubleshooting

### Error: relation "students" does not exist
- Ensure migrations are run in the correct order
- Run 001_create_students_table.sql first

### Error: constraint violation
- Check that foreign key references exist
- Verify data types match between tables

### Error: permission denied
- Ensure you're using the service_role key for migrations
- Check Supabase project permissions

## Notes

- All timestamps use `TIMESTAMPTZ` for timezone awareness
- Foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately
- Indexes are created for frequently queried columns
- Check constraints ensure data integrity
