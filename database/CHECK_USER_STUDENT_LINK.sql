-- Check if user account is linked to student record
-- Run this to diagnose the attendance issue

-- 1. Check what student records exist
SELECT 'Students Table' as table_name, uid, name, email, created_at 
FROM students 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check what user accounts exist and their student_uid
SELECT 'Users Table' as table_name, email, role, student_uid, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check recent attendance logs
SELECT 'Attendance Logs' as table_name, student_uid, timestamp, status 
FROM attendance_logs 
ORDER BY timestamp DESC 
LIMIT 5;

-- 4. Find unlinked accounts (users without student_uid but matching email in students)
SELECT 
  u.email as user_email,
  u.role,
  u.student_uid as current_student_uid,
  s.uid as student_table_uid,
  s.name as student_name
FROM users u
LEFT JOIN students s ON u.email = s.email
WHERE u.role = 'student' AND u.student_uid IS NULL AND s.uid IS NOT NULL;

-- If you see results in query 4, you need to link them with:
-- UPDATE users 
-- SET student_uid = (SELECT uid FROM students WHERE students.email = users.email)
-- WHERE role = 'student' AND student_uid IS NULL;
