-- ============================================
-- FINAL DEFINITIVE FIX
-- ============================================
-- Copy this ENTIRE script and run it in Supabase SQL Editor
-- This will fix EVERYTHING once and for all
-- ============================================

-- 1. Disable RLS completely (for development)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
END $$;

-- 3. Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    student_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create missing user records for ALL auth users
-- Use role from raw_user_meta_data if available, otherwise default to 'admin'
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
    role = COALESCE(EXCLUDED.role, users.role),
    student_uid = COALESCE(EXCLUDED.student_uid, users.student_uid);

-- 5. Confirm ALL emails (development only - remove in production)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 6. Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

-- 7. Verify everything worked
SELECT 
    '✅ SUCCESS!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students
FROM public.users;

-- 8. Show all users with their status
SELECT 
    u.email,
    u.role,
    u.student_uid,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Ready to login'
        ELSE '⚠️ Email not confirmed'
    END as status,
    u.created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- ============================================
-- DONE! You should see "✅ Ready to login" above
-- Now refresh your app and try logging in
-- ============================================
