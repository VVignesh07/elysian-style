-- =====================================================
-- FIX: FORCE RESOLVE INFINITE RECURSION & ADMIN ACCESS
-- =====================================================

-- 1. DROP EVERYTHING THAT CAUSES RECURSION
-- We drop policies first to ensure no old buggy code remains.
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

-- 2. REDEFINE is_admin() SAFELY
-- It MUST match the signature of any existing function to replace it.
-- We ensure it ONLY looks at user_roles, never profiles.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 3. RE-APPLY POLICIES (NON-RECURSIVE VERSION)
-- user_roles: User can see their own role. (No is_admin check)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own role" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- profiles: Admin can see all, User can see own.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User sees own profile (Simple check)
CREATE POLICY "Users can see own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Admin sees ALL profiles (Uses is_admin -> user_roles -> Safe)
CREATE POLICY "Admins can see all profiles" ON public.profiles
FOR SELECT USING (is_admin());


-- 4. EMERGENCY ADMIN PROMOTION
-- If you are logged in as 'arunanimator88@gmail.com' but not an admin in DB, fix it.
DO $$
DECLARE
  target_email TEXT := 'arunanimator88@gmail.com';
  v_user_id UUID;
BEGIN
  -- Find the user ID for the email
  SELECT id INTO v_user_id FROM auth.users WHERE email = target_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Ensure they are in public.user_roles as admin
    -- We use ON CONFLICT to update if exists, or insert if active
    -- But since user_roles has no unique constraint on (user_id) potentially in some schemas, we do a delete/insert to be safe.
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');
    
    RAISE NOTICE 'User % has been promoted to ADMIN.', target_email;
  ELSE
    RAISE NOTICE 'User % not found. Please register first.', target_email;
  END IF;
END $$;
