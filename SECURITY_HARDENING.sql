-- =====================================================
-- ZERO FASHION - COMPREHENSIVE SECURITY HARDENING
-- =====================================================
-- This script unifies administrative logic and enforces 
-- strict RLS across the entire database.

BEGIN;

-- 1. UNIFY ADMIN CHECK LOGIC
-- SECURITY DEFINER allows this function to check user_roles even when RLS is enabled on it.
-- SET search_path = public resolves the "role mutable search path" security warning.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.user_roles WHERE user_id = auth.uid();
  RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search path for other identified critical functions
ALTER FUNCTION public.notify_admin_on_order() SET search_path = public;

-- If generate_order_number exists, fix its search path too
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_order_number') THEN
        ALTER FUNCTION public.generate_order_number() SET search_path = public;
    END IF;
END $$;

-- If generate_order_number exists, fix its search path too
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_order_number') THEN
        ALTER FUNCTION public.generate_order_number() SET search_path = public;
    END IF;
END $$;

-- 2. RESET OVERLY BROAD PERMISSIONS
-- Narrowing down permissions to ensure RLS is the primary guard.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.orders, public.order_items TO anon; -- Allow guest checkout

-- 3. HARDENING PUBLIC TABLES (Public Read, Admin All)
DO $$
DECLARE
  t TEXT;
  tables_to_harden TEXT[] := ARRAY['products', 'categories', 'hero_slides', 'app_settings', 'coupons'];
BEGIN
  FOREACH t IN ARRAY tables_to_harden LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public Read %s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "Public Read %s" ON public.%I FOR SELECT USING (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin Manage %s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "Admin Manage %s" ON public.%I FOR ALL TO authenticated USING (is_admin());', t, t);
  END LOOP;
END $$;

-- 4. HARDENING SENSITIVE DATA (Profiles & Roles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles: Own read/update, Admin all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
CREATE POLICY "Admins manage all profiles" ON public.profiles 
FOR ALL TO authenticated USING (is_admin());

-- User Roles: Admins only
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
CREATE POLICY "Admins manage all roles" ON public.user_roles 
FOR ALL TO authenticated USING (is_admin());

-- 5. HARDENING TRANSACTIONAL DATA (Orders & Items)
-- Orders: Own read (Auth ID or JWT Email), Anyone can insert (Guest Checkout), Admin all
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
CREATE POLICY "Admin full access orders" ON public.orders
FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) OR
    (email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Guest and Auth insert orders" ON public.orders;
CREATE POLICY "Guest and Auth insert orders" ON public.orders 
FOR INSERT WITH CHECK (true);

-- Order Items: Consistent with parent order
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access order_items" ON public.order_items;
CREATE POLICY "Admin full access order_items" ON public.order_items
FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Users view own items" ON public.order_items;
CREATE POLICY "Users view own items" ON public.order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR (orders.email = (auth.jwt() ->> 'email')))
  )
);

DROP POLICY IF EXISTS "Guest and Auth insert items" ON public.order_items;
CREATE POLICY "Guest and Auth insert items" ON public.order_items 
FOR INSERT WITH CHECK (true);

-- 6. HARDENING CUSTOMER DATA (Wishlist)
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items 
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all wishlists" ON public.wishlist_items;
CREATE POLICY "Admins manage all wishlists" ON public.wishlist_items 
FOR ALL TO authenticated USING (is_admin());

-- 7. HARDENING ADMIN SYSTEMS (Notifications)
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin All Notifications" ON public.admin_notifications;
CREATE POLICY "Admin All Notifications" ON public.admin_notifications 
FOR ALL TO authenticated USING (is_admin());

-- 8. FINAL CLEANUP
-- Now that all policies using is_admin_user() have been replaced, we can safely drop it.
-- We also drop the specific policies mentioned in the error to be sure.
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;

COMMIT;

-- VERIFICATION:
-- SELECT polname, tablename, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public';
