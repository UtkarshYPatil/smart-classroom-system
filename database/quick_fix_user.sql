-- ============================================
-- Quick Fix: Add User Record Manually
-- ============================================
-- Use this if you created an account but can't login
-- ============================================

-- Step 1: Find your auth user ID
-- Run this query and copy your user ID
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'utkarshpatil2399@gmail.com';  -- Replace with your email

-- Step 2: Confirm your email (if email_confirmed_at is NULL)
-- Option A: Do this in Supabase Dashboard > Authentication > Users
-- Option B: Run this (replace USER_ID):
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE id = 'd7ea1c5d-5f06-415a-a729-d0bc94b120bc';  -- Replace with ID from Step 1

-- Step 3: Create user record in public.users
-- Replace the values below with your information
INSERT INTO public.users (id, email, role, student_uid)
VALUES (
  'd7ea1c5d-5f06-415a-a729-d0bc94b120bc',     -- ID from Step 1
  'utkarshpatil2399@gmail.com',       -- Your email
  'admin',                 -- Change to 'student' if needed
  NULL                     -- Add student UID if role is 'student'
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  student_uid = EXCLUDED.student_uid;

-- Step 4: Verify the user record was created
SELECT 
  u.id,
  u.email,
  u.role,
  u.student_uid,
  au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'utkarshpatil2399@gmail.com';  -- Replace with your email

-- ============================================
-- Example for creating an admin user:
-- ============================================
-- INSERT INTO public.users (id, email, role, student_uid)
-- VALUES (
--   'abc123-def456-ghi789',
--   'admin@example.com',
--   'admin',
--   NULL
-- );

-- ============================================
-- Example for creating a student user:
-- ============================================
-- INSERT INTO public.users (id, email, role, student_uid)
-- VALUES (
--   'xyz789-uvw456-rst123',
--   'student@example.com',
--   'student',
--   'RFID_UID_HERE'
-- );

-- ============================================
-- After running this, you should be able to login!
-- ============================================
