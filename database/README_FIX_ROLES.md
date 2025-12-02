# Fix User Role Issues

## Problem
When creating a student account, the user is assigned an admin role and sees the admin dashboard instead of the student dashboard.

## Root Cause
The database trigger that automatically creates user records from auth.users metadata may not be set up correctly, or existing users were created before the trigger was properly configured.

## Solution

### Option 1: Complete Fresh Setup (Recommended)
Run this script to set up everything correctly from scratch:

```sql
-- Run in Supabase SQL Editor
-- File: database/COMPLETE_SETUP.sql
```

This script will:
1. Create the users table if needed
2. Set up the trigger to handle new signups
3. Fix all existing users by syncing their roles from auth metadata
4. Confirm all emails (for development)
5. Grant necessary permissions

### Option 2: Fix Existing Users Only
If you just need to fix users who already have wrong roles:

```sql
-- Run in Supabase SQL Editor
-- File: database/FIX_USER_ROLES.sql
```

This script will:
1. Show which users have mismatched roles
2. Update all users to match their auth metadata
3. Display the corrected user list

### Option 3: Manual Fix for Specific User
If you know which user needs to be fixed:

```sql
-- Replace 'student@example.com' with the actual email
UPDATE public.users u
SET 
    role = 'student',
    student_uid = au.raw_user_meta_data->>'student_uid'
FROM auth.users au
WHERE u.id = au.id
  AND u.email = 'student@example.com';
```

## Verification

After running any fix script, verify the results:

```sql
-- Check all users and their roles
SELECT 
    u.email,
    u.role,
    u.student_uid,
    au.raw_user_meta_data->>'role' as metadata_role,
    au.raw_user_meta_data->>'student_uid' as metadata_student_uid
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;
```

Expected results:
- `role` should match `metadata_role`
- `student_uid` should match `metadata_student_uid` for students
- Admin users should have `role = 'admin'` and `student_uid = NULL`
- Student users should have `role = 'student'` and a valid `student_uid`

## Testing

1. **Create a new student account:**
   - Go to `/create-account`
   - Select "Student" as account type
   - Enter a student UID (e.g., "TEST123")
   - Create account

2. **Login with student account:**
   - Should redirect to `/student` (Student Panel)
   - Should NOT see admin dashboard

3. **Create a new admin account:**
   - Go to `/create-account`
   - Select "Admin" as account type
   - Create account

4. **Login with admin account:**
   - Should redirect to `/admin` (Admin Panel)
   - Should NOT see student dashboard

## Prevention

To prevent this issue in the future:

1. **Always run COMPLETE_SETUP.sql first** when setting up a new database
2. **Don't modify the trigger function** unless you know what you're doing
3. **Use the frontend signup form** instead of manually creating users in Supabase
4. **Check the console logs** during signup to see if roles are being set correctly

## Troubleshooting

### Issue: User still sees wrong dashboard after fix
**Solution:** 
1. Logout completely
2. Clear browser cache/cookies
3. Login again

### Issue: Trigger not firing for new signups
**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If not found, run COMPLETE_SETUP.sql
```

### Issue: Permission denied when inserting users
**Solution:**
```sql
-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
```

### Issue: Email confirmation required
**Solution:**
```sql
-- Disable email confirmation (development only)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

## Database Schema

The `users` table should have this structure:

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    student_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

The trigger function should look like this:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
```

## Support

If you continue to have issues:
1. Check the browser console for error messages
2. Check Supabase logs for database errors
3. Verify the trigger is set up correctly
4. Ensure RLS policies are not blocking access (disable RLS for development)
