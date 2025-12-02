-- ============================================
-- CREATE TEST STUDENT DATA
-- ============================================
-- Run this to create a test student with attendance data
-- Use this to test the student attendance page
-- ============================================

-- 1. Create a test student record
INSERT INTO students (uid, name, email, course, year, section)
VALUES ('TEST_STUDENT_001', 'Test Student', 'test.student@example.com', 'Computer Science', 2, 'A')
ON CONFLICT (uid) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    course = EXCLUDED.course,
    year = EXCLUDED.year,
    section = EXCLUDED.section;

-- 2. Create some test attendance logs (10 records)
INSERT INTO attendance_logs (student_uid, timestamp, status)
VALUES 
    ('TEST_STUDENT_001', NOW() - INTERVAL '1 day', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '2 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '3 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '4 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '5 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '6 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '7 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '8 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '9 days', 'present'),
    ('TEST_STUDENT_001', NOW() - INTERVAL '10 days', 'present')
ON CONFLICT DO NOTHING;

-- 3. Link the test student to a user account (if exists)
-- Replace 'test.student@example.com' with your actual student email
UPDATE users
SET student_uid = 'TEST_STUDENT_001'
WHERE email = 'test.student@example.com'
  AND role = 'student';

-- 4. Verify the setup
SELECT 
    '✅ Test Student Created' as status,
    s.uid,
    s.name,
    s.email,
    s.course,
    COUNT(a.id) as attendance_count,
    ROUND((COUNT(a.id)::numeric / 50) * 100, 2) as attendance_percentage
FROM students s
LEFT JOIN attendance_logs a ON s.uid = a.student_uid
WHERE s.uid = 'TEST_STUDENT_001'
GROUP BY s.uid, s.name, s.email, s.course;

-- 5. Show user link status
SELECT 
    u.email,
    u.role,
    u.student_uid,
    CASE 
        WHEN u.student_uid = 'TEST_STUDENT_001' THEN '✅ Linked'
        WHEN u.student_uid IS NULL THEN '⚠️ Not linked'
        ELSE '❌ Linked to different student'
    END as link_status
FROM users u
WHERE u.email = 'test.student@example.com'
   OR u.student_uid = 'TEST_STUDENT_001';

-- ============================================
-- USAGE INSTRUCTIONS:
-- ============================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Update line 32 with your actual student email
-- 3. Login with that student account
-- 4. Navigate to /student/attendance
-- 5. You should see 10 attendance records (20% attendance)
--
-- To create more attendance records:
-- INSERT INTO attendance_logs (student_uid, timestamp, status)
-- VALUES ('TEST_STUDENT_001', NOW(), 'present');
-- ============================================
