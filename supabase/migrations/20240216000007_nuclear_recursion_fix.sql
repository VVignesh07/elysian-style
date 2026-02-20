-- =====================================================
-- NUCLEAR FIX: Break Infinite Recursion Loop
-- =====================================================
-- The problem: Line 216 in definitive schema creates recursion
-- Solution: Separate user and admin policies for profiles

-- 1. DROP THE PROBLEMATIC POLICY
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can see all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- 2. CREATE TWO SEPARATE POLICIES (No OR condition with is_admin)
-- Policy 1: Users see their own profile (NO is_admin check)
CREATE POLICY "Users see own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Policy 2: Admins see all profiles (ONLY is_admin check)
CREATE POLICY "Admins see all profiles" ON profiles
FOR SELECT USING (is_admin());

-- 3. Fix user_roles to ensure it has proper RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users read own role" ON user_roles
FOR SELECT USING (user_id = auth.uid());

-- 4. DONE - The recursion is broken because:
-- - Users checking their own profile: auth.uid() = id (no is_admin call)
-- - Admins checking all profiles: is_admin() -> user_roles (no profile check)
