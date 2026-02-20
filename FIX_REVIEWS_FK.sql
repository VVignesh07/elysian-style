-- =====================================================
-- FIX REVIEWS FOREIGN KEY
-- Run this in the Supabase SQL Editor to fix the 400 Bad Request error
-- =====================================================

-- 1. Explicitly drop the constraint if it exists (to ensure clean slate)
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

-- 2. Re-add the Foreign Key constraint explicitly
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- 3. Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload config';

-- 4. Verify the link works
-- This query simulates what the frontend is doing
-- SELECT *, products(name) FROM reviews LIMIT 1;
