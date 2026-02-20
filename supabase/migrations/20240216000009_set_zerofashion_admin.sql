-- =====================================================
-- SET ZEROFASHION AS ADMIN (User Roles Only)
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find the user ID for zerofashion2025@gmail.com
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'zerofashion2025@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Set as admin in user_roles table
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');
    
    -- REMOVE from profiles table (profiles are for customers only)
    DELETE FROM public.profiles WHERE id = v_user_id;
    
    RAISE NOTICE 'User zerofashion2025@gmail.com is now ADMIN (removed from profiles)';
  ELSE
    RAISE NOTICE 'User zerofashion2025@gmail.com not found in auth.users';
  END IF;
END $$;

-- Verify the change
SELECT 
  au.email, 
  ur.role as user_roles_role,
  CASE WHEN p.id IS NULL THEN 'NOT IN PROFILES' ELSE 'IN PROFILES' END as profile_status
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'zerofashion2025@gmail.com';
