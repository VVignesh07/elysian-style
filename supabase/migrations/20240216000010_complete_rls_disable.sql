-- =====================================================
-- COMPLETE FIX: Disable ALL RLS and Policies
-- =====================================================

-- 1. Drop ALL policies on profiles
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins see all profiles" ON public.profiles;

-- 2. Disable RLS completely
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Drop ALL policies on user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;

-- 4. Disable RLS on user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 5. Verify
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles');
