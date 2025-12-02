-- ============================================
-- SIMPLE FIX - For Development Only
-- ============================================
-- This disables RLS and creates missing user records
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS on users table (development only)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Create missing user records
INSERT INTO public.users (id, email, role, student_uid)
SELECT 
  au.id,
  au.email,
  'admin' as role,
  NULL as student_uid
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Confirm all emails (development only)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Step 4: Verify it worked
SELECT 
  u.email,
  u.role,
  au.email_confirmed_at,
  'Ready to login!' as status
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- ============================================
-- DONE! RLS is disabled. Now try logging in.
-- ============================================
-- NOTE: For production, you should enable RLS with proper policies
-- But for development, this is fine.
-- ============================================
