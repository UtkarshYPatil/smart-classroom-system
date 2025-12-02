-- ============================================
-- Fix Current User - Quick Solution
-- ============================================
-- This script will create user records for all auth users
-- that don't have a corresponding record in public.users
-- ============================================

-- Step 1: Check which auth users are missing from public.users
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN u.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- Step 2: Create missing user records (with admin role by default)
INSERT INTO public.users (id, email, role, student_uid)
SELECT 
  au.id,
  au.email,
  'admin' as role,
  NULL as student_uid
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify all users now have records
SELECT 
  au.id,
  au.email,
  u.role,
  u.student_uid,
  au.email_confirmed_at
FROM auth.users au
JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- ============================================
-- If you need to change a specific user's role:
-- ============================================
-- UPDATE public.users
-- SET role = 'student', student_uid = 'YOUR_RFID_UID'
-- WHERE email = 'user@example.com';

-- ============================================
-- After running this, try logging in again!
-- ============================================
