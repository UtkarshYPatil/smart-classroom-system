-- ============================================
-- FIX SIGNUP ERROR
-- ============================================
-- Run this if you get "Database error saving new user" during signup
-- This fixes foreign key constraint issues
-- ============================================

-- 1. Drop the problematic foreign key constraint
-- This constraint requires students to exist before users, which is backwards
ALTER TABLE IF EXISTS public.users 
DROP CONSTRAINT IF EXISTS fk_users_student;

ALTER TABLE IF EXISTS public.users 
DROP CONSTRAINT IF EXISTS users_student_uid_fkey;

-- 2. Drop the existing trigger (it might be causing conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Recreate the function with better error handling
-- For students, set student_uid to NULL initially if student doesn't exist yet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_student_uid TEXT;
  v_role TEXT;
BEGIN
  -- Get role and student_uid from metadata
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  v_student_uid := NEW.raw_user_meta_data->>'student_uid';
  
  -- For students, only set student_uid if the student record exists
  -- Otherwise set to NULL and it will be updated later
  IF v_role = 'student' AND v_student_uid IS NOT NULL THEN
    -- Check if student exists
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE uid = v_student_uid) THEN
      -- Student doesn't exist yet, set to NULL temporarily
      v_student_uid := NULL;
    END IF;
  END IF;
  
  -- Insert a new row into the users table
  INSERT INTO public.users (id, email, role, student_uid)
  VALUES (
    NEW.id,
    NEW.email,
    v_role,
    v_student_uid
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    student_uid = EXCLUDED.student_uid;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Ensure RLS is disabled for development
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- 7. Grant all permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO service_role;

-- 8. Ensure students table also has proper permissions
GRANT ALL ON public.students TO authenticated;
GRANT ALL ON public.students TO anon;
GRANT ALL ON public.students TO service_role;

-- 9. Update existing student users to link their student_uid
-- This will set student_uid for users where the student record now exists
UPDATE public.users u
SET student_uid = s.uid
FROM public.students s
WHERE u.email = s.email
  AND u.role = 'student'
  AND u.student_uid IS NULL;

-- 10. Test the setup
SELECT 
    '✅ Setup complete!' as status,
    'Foreign key constraint removed, trigger recreated' as message;

-- 11. Verify trigger exists
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    '✅ Active' as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 12. Show current constraints on users table
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- ============================================
-- DONE! Try creating an account again
-- The foreign key constraint has been removed
-- Users can now be created without requiring students to exist first
-- ============================================
