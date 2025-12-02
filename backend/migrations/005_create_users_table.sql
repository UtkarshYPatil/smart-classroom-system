-- Migration: Create users table
-- Description: Creates the users table for authentication with role constraints
-- Requirements: 8.1, 9.1

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    student_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role enum constraint (admin/student)
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'student'));

-- Add foreign key to students.uid for student role
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
