-- ============================================
-- FIX USER ROLES
-- ============================================
-- This script fixes users who were incorrectly assigned roles
-- Run this if you created student accounts but they show as admin
-- ============================================

-- 1. Show current user roles vs their metadata
SELECT 
    u.email,
    u.role as current_role,
    au.raw_user_meta_data->>'role' as metadata_role,
    u.student_uid as current_student_uid,
    au.raw_user_meta_data->>'student_uid' as metadata_student_uid,
    CASE 
        WHEN u.role != COALESCE(au.raw_user_meta_data->>'role', 'admin') THEN '❌ MISMATCH'
        ELSE '✅ OK'
    END as status
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- 2. Fix users whose role doesn't match their metadata
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

-- 3. Show results after fix
SELECT 
    '✅ FIXED!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students
FROM public.users;

-- 4. Show all users with their corrected status
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
-- DONE! All users should now have correct roles
-- Refresh your app and login again
-- ============================================
