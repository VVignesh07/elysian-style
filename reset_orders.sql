-- =====================================================
-- RESET ORDER SYSTEM
-- This script will delete ALL existing orders and 
-- reset the sequence to start from ZF-001.
-- =====================================================

-- 1. Delete all order items first (foreign key dependency)
DELETE FROM public.order_items;

-- 2. Delete all orders
DELETE FROM public.orders;

-- 3. Reset the order number sequence to 1
-- Use RESTART WITH 1 to ensure nextval returns 1
ALTER SEQUENCE public.order_number_seq RESTART WITH 1;

-- 4. Verify sequence reset
-- SELECT nextval('public.order_number_seq'); -- This would consume 1, don't run here.

-- 5. Optional: Clear wishlist if desired (commented out by default)
-- DELETE FROM public.wishlist_items;

COMMIT;
