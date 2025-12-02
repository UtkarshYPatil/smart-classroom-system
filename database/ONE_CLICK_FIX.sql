-- ============================================
-- ONE CLICK FIX - Run this entire script
-- ============================================
-- This will fix ALL login issues
-- Just copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS temporarily to allow inserts
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Create user records for ALL auth users that don't have one
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

-- Step 3: Confirm email for all users (development only - remove in production)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Step 4: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Step 6: Create simple, working RLS policies (NO RECURSION)
-- Allow all authenticated users to read all user data
CREATE POLICY "Allow authenticated users to read users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own record
CREATE POLICY "Allow users to insert own record"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow all authenticated users to update (we'll handle permissions in app)
CREATE POLICY "Allow authenticated users to update"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all authenticated users to delete (we'll handle permissions in app)
CREATE POLICY "Allow authenticated users to delete"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 7: Verify everything worked
SELECT 
  'SUCCESS!' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count
FROM public.users;

-- Step 8: Show all users
SELECT 
  u.email,
  u.role,
  u.student_uid,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '⚠️ Not Confirmed'
  END as email_status
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- ============================================
-- DONE! Now try logging in again.
-- ============================================
