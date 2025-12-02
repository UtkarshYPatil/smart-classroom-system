-- ============================================
-- COMPLETE DATABASE SETUP
-- ============================================
-- Run this script ONCE to set up everything correctly
-- This includes tables, triggers, and policies
-- ============================================

-- 1. Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    student_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into the users table with role from metadata
  INSERT INTO public.users (id, email, role, student_uid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    NEW.raw_user_meta_data->>'student_uid'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    student_uid = EXCLUDED.student_uid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix existing users (sync from auth.users metadata)
INSERT INTO public.users (id, email, role, student_uid)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'admin') as role,
    au.raw_user_meta_data->>'student_uid' as student_uid
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    student_uid = EXCLUDED.student_uid;

-- 5. Update existing users who have wrong roles
UPDATE public.users u
SET 
    role = COALESCE(au.raw_user_meta_data->>'role', u.role),
    student_uid = COALESCE(au.raw_user_meta_data->>'student_uid', u.student_uid)
FROM auth.users au
WHERE u.id = au.id
  AND (
    u.role != COALESCE(au.raw_user_meta_data->>'role', u.role)
    OR u.student_uid IS DISTINCT FROM (au.raw_user_meta_data->>'student_uid')
  );

-- 6. Confirm ALL emails (development only - remove in production)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 7. Disable RLS for development (enable in production)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- 8. Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

-- 9. Verify setup
SELECT 
    '✅ SETUP COMPLETE!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students
FROM public.users;

-- 10. Show all users with their status
SELECT 
    u.email,
    u.role,
    u.student_uid,
    au.raw_user_meta_data->>'role' as metadata_role,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Ready'
        ELSE '⚠️ Email not confirmed'
    END as status,
    u.created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- ============================================
-- DONE! 
-- - Trigger is set up for new signups
-- - Existing users are fixed
-- - All emails are confirmed (dev mode)
-- ============================================
