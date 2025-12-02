-- Migration: Create attendance_logs table
-- Description: Creates the attendance_logs table with foreign key to students and indexes
-- Requirements: 3.5, 5.2, 5.5

-- Create attendance_logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
    id SERIAL PRIMARY KEY,
    student_uid TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'present'
);

-- Add foreign key reference to students.uid with cascade delete
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
