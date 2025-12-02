-- Migration: Create students table
-- Description: Creates the students table with unique UID constraint and index
-- Requirements: 2.5, 5.1, 5.4

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
ALTER TABLE students ADD CONSTRAINT students_uid_unique UNIQUE (uid);

-- Create index on uid column for fast lookups
CREATE INDEX IF NOT EXISTS idx_students_uid ON students(uid);

-- Add comment to table
COMMENT ON TABLE students IS 'Stores student information with RFID tag UID mapping';
COMMENT ON COLUMN students.uid IS 'Unique RFID tag identifier for the student';
