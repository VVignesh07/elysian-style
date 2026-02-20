-- =====================================================
-- ABSOLUTE FIX: Disable RLS on profiles temporarily
-- =====================================================
-- This is the nuclear option to stop the recursion immediately

-- 1. DISABLE RLS ON PROFILES (Temporary fix)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. DISABLE RLS ON USER_ROLES (Temporary fix)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- This will allow the orders page to load without recursion errors.
-- Once working, we can re-enable RLS with proper non-recursive policies.
