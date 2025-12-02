-- ============================================================================
-- Smart Classroom Management System - Complete Database Schema
-- ============================================================================
-- This file contains all migrations in the correct order.
-- Run this entire file in Supabase SQL Editor to set up the complete schema.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MIGRATION 001: Create students table
-- ============================================================================

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    uid TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    dob DATE,
    course TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on uid field
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_uid_unique;
ALTER TABLE students ADD CONSTRAINT students_uid_unique UNIQUE (uid);

-- Create index on uid column for fast lookups
CREATE INDEX IF NOT EXISTS idx_students_uid ON students(uid);

-- Add comment to table
COMMENT ON TABLE students IS 'Stores student information with RFID tag UID mapping';
COMMENT ON COLUMN students.uid IS 'Unique RFID tag identifier for the student';

-- ============================================================================
-- MIGRATION 002: Create attendance_logs table
-- ============================================================================

-- Create attendance_logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
    id SERIAL PRIMARY KEY,
    student_uid TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'present'
);

-- Add foreign key reference to students.uid with cascade delete
ALTER TABLE attendance_logs DROP CONSTRAINT IF EXISTS fk_attendance_student;
ALTER TABLE attendance_logs 
ADD CONSTRAINT fk_attendance_student 
FOREIGN KEY (student_uid) 
REFERENCES students(uid) 
ON DELETE CASCADE;

-- Create index on student_uid for fast lookups by student
CREATE INDEX IF NOT EXISTS idx_attendance_student_uid ON attendance_logs(student_uid);

-- Create index on timestamp for chronological queries
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance_logs(timestamp);

-- Add comments to table
COMMENT ON TABLE attendance_logs IS 'Stores timestamped attendance records for students';
COMMENT ON COLUMN attendance_logs.student_uid IS 'References the RFID UID from students table';
COMMENT ON COLUMN attendance_logs.status IS 'Attendance status: present or absent';

-- ============================================================================
-- MIGRATION 003: Create rooms table
-- ============================================================================

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_no TEXT NOT NULL,
    is_busy BOOLEAN DEFAULT FALSE,
    current_class TEXT,
    professor_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on room_no
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_room_no_unique;
ALTER TABLE rooms ADD CONSTRAINT rooms_room_no_unique UNIQUE (room_no);

-- Create index on is_busy column for fast availability queries
CREATE INDEX IF NOT EXISTS idx_rooms_is_busy ON rooms(is_busy);

-- Add comments to table
COMMENT ON TABLE rooms IS 'Stores classroom information and availability status';
COMMENT ON COLUMN rooms.room_no IS 'Unique room number identifier';
COMMENT ON COLUMN rooms.is_busy IS 'Current availability status of the room';
COMMENT ON COLUMN rooms.current_class IS 'Subject currently being taught in the room';
COMMENT ON COLUMN rooms.professor_name IS 'Name of professor currently using the room';

-- ============================================================================
-- MIGRATION 004: Create timetable table
-- ============================================================================

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    course TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject TEXT NOT NULL,
    room_no TEXT,
    professor_name TEXT NOT NULL
);

-- Add foreign key to rooms.room_no
ALTER TABLE timetable DROP CONSTRAINT IF EXISTS fk_timetable_room;
ALTER TABLE timetable 
ADD CONSTRAINT fk_timetable_room 
FOREIGN KEY (room_no) 
REFERENCES rooms(room_no) 
ON DELETE SET NULL;

-- Create index on course column for fast course-based queries
CREATE INDEX IF NOT EXISTS idx_timetable_course ON timetable(course);

-- Create composite index for efficient current lecture queries
CREATE INDEX IF NOT EXISTS idx_timetable_course_day_time ON timetable(course, day_of_week, start_time, end_time);

-- Add comments to table
COMMENT ON TABLE timetable IS 'Stores class schedule information with room assignments';
COMMENT ON COLUMN timetable.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN timetable.room_no IS 'References room_no from rooms table';

-- ============================================================================
-- MIGRATION 005: Create users table
-- ============================================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    student_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role enum constraint (admin/student)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'student'));

-- Add foreign key to students.uid for student role
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_student;
ALTER TABLE users 
ADD CONSTRAINT fk_users_student 
FOREIGN KEY (student_uid) 
REFERENCES students(uid) 
ON DELETE SET NULL;

-- Create index on email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add check constraint: student role must have student_uid
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_student_uid_check;
ALTER TABLE users 
ADD CONSTRAINT users_student_uid_check 
CHECK (
    (role = 'student' AND student_uid IS NOT NULL) OR 
    (role = 'admin')
);

-- Add comments to table
COMMENT ON TABLE users IS 'Stores user authentication and role information';
COMMENT ON COLUMN users.role IS 'User role: admin or student';
COMMENT ON COLUMN users.student_uid IS 'References students.uid, required for student role';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Uncomment these to verify the schema after running migrations

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- List all indexes
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- List all foreign keys
-- SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' ORDER BY tc.table_name;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Uncomment to insert sample data

-- INSERT INTO rooms (room_no, is_busy) VALUES
-- ('101', false), ('102', false), ('103', false), ('201', false), ('202', false);

-- INSERT INTO students (name, uid, email, phone, dob, course) VALUES
-- ('John Doe', 'A1B2C3D4', 'john@example.com', '1234567890', '2000-01-15', 'Computer Science');

-- INSERT INTO users (email, role) VALUES ('admin@example.com', 'admin');

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================

SELECT 'Database schema created successfully!' AS status;
