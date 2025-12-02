-- Fix: Link user accounts to student records
-- This script links users table to students table based on matching email

-- Update users table to set student_uid from students table
UPDATE users 
SET student_uid = (
  SELECT uid 
  FROM students 
  WHERE students.email = users.email
)
WHERE role = 'student' 
  AND student_uid IS NULL
  AND EXISTS (
    SELECT 1 
    FROM students 
    WHERE students.email = users.email
  );

-- Verify the fix
SELECT 
  u.email,
  u.role,
  u.student_uid,
  s.name as student_name,
  s.uid as student_uid_from_table
FROM users u
LEFT JOIN students s ON u.student_uid = s.uid
WHERE u.role = 'student';
