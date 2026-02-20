-- =====================================================
-- UPDATE ORDERS AND COUPONS LOGIC
-- =====================================================

-- 1. Add coupon_id to orders table to track usage
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id);

-- 2. Create a function to safely increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update existing policies or add new ones if needed
-- (Since RLS is currently disabled on profiles/roles, 
-- we just ensure orders policies allow this update)
