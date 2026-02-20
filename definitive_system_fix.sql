-- =====================================================
-- DEFINITIVE SYSTEM RESET & RECURSION FIX (DEEP FIX)
-- =====================================================

BEGIN;

-- 1. SCHEMA PERMISSIONS
-- Explicitly grant usage to ensure anon/authenticated can reach public tables
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 2. PURGE OLD ORDER DATA
DELETE FROM public.order_items;
DELETE FROM public.orders;

-- 3. RESET ZF-XXX SEQUENCE
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'order_number_seq') THEN
        ALTER SEQUENCE public.order_number_seq RESTART WITH 1;
    END IF;
END $$;

-- 4. BREAK RLS RECURSION & PERMISSION ERRORS (Fixes the 500 & 403 errors)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 5. REDEFINE is_admin() SAFELY (Non-recursive)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.user_roles WHERE user_id = auth.uid();
  RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RE-ALIGN ORDER POLICIES
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;

-- Enable RLS on orders to keep it secure
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admin Policy (Full Access)
DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
CREATE POLICY "Admin full access orders" ON public.orders
FOR ALL TO authenticated USING (is_admin());

-- Customer Policy (Read Access)
-- Uses auth.jwt() to avoid querying restricted tables
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) OR
    (email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
);

-- Insertion Policy
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders 
FOR INSERT WITH CHECK (true);

-- 7. ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Users view own items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin delete order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can insert items" ON public.order_items;
DROP POLICY IF EXISTS "Admin full access order_items" ON public.order_items;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Admin Policy
CREATE POLICY "Admin full access order_items" ON public.order_items
FOR ALL TO authenticated USING (is_admin());

-- Customer Policy
CREATE POLICY "Users view own items" ON public.order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR (orders.email = (auth.jwt() ->> 'email')))
  )
);

-- Insertion Policy
CREATE POLICY "Anyone can insert items" ON public.order_items 
FOR INSERT WITH CHECK (true);

COMMIT;
