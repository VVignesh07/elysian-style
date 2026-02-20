-- =====================================================
-- FIX: Infinite Recursion in Policies
-- =====================================================

-- 1. Redefine is_admin safely
-- checks user_roles (not profiles) and uses SECURITY DEFINER
create or replace function is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role = 'admin'
  );
end;
$$;

-- 2. Fix user_roles policies (Break the loop)
-- Ensure user_roles doesn't check is_admin() for "read own"
alter table public.user_roles enable row level security;

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- 3. Fix profiles policies
-- Now safe to use is_admin() because it looks at user_roles (which is safe)
alter table public.profiles enable row level security;

DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;

-- Allow users to see their own profile
CREATE POLICY "Users can see own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Allow admins to see ALL profiles
CREATE POLICY "Admins can see all profiles" ON public.profiles
FOR SELECT USING (is_admin());

-- 4. Fix Orders Policies (Just in case)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);
