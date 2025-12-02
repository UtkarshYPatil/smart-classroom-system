-- ============================================
-- Smart Classroom Management System
-- Database Setup: Auth Trigger
-- ============================================
-- This script sets up automatic user record creation
-- when a new auth user signs up
-- ============================================

-- Step 1: Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into the users table
  INSERT INTO public.users (id, email, role, student_uid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'student_uid'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a trigger that fires after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Update RLS policies for the users table
-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Allow admins to view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Allow admins to insert new users (for admin user management)
CREATE POLICY "Admins can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Allow admins to delete users
CREATE POLICY "Admins can delete users"
  ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Allow service role to insert (for signup function)
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Step 4: Disable email confirmation (OPTIONAL - for development only)
-- Run this in Supabase Dashboard > Authentication > Settings
-- Or via SQL (requires superuser):
-- UPDATE auth.config SET enable_signup = true;
-- UPDATE auth.config SET enable_email_confirmations = false;

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. After running this script, new signups will automatically
--    create a record in the users table
--
-- 2. For existing users without a users record, you can run:
--    INSERT INTO public.users (id, email, role)
--    SELECT id, email, 'admin' FROM auth.users
--    WHERE id NOT IN (SELECT id FROM public.users);
--
-- 3. To disable email verification (development only):
--    Go to Supabase Dashboard > Authentication > Settings
--    Disable "Enable email confirmations"
--
-- 4. The trigger uses raw_user_meta_data to get role and student_uid
--    These are set during signup in the frontend code
-- ============================================
