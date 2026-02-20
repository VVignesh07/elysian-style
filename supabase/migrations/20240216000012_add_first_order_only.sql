-- =====================================================
-- ADD FIRST ORDER RESTRICTION TO COUPONS
-- =====================================================

-- Add first_order_only column to coupons table
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN DEFAULT FALSE;

-- Update WELCOME10 coupon to be first order only
UPDATE public.coupons 
SET first_order_only = TRUE 
WHERE code = 'WELCOME10';

-- Add comment for clarity
COMMENT ON COLUMN public.coupons.first_order_only IS 'If true, coupon can only be used by customers on their first order';
