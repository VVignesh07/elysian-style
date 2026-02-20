-- =====================================================
-- FORCE FIX REVIEWS FOREIGN KEY
-- Run this in the Supabase SQL Editor
-- =====================================================

-- 1. CLEANUP ORPHAN DATA
-- Delete reviews that reference non-existent products
-- This is necessary because you cannot add a Foreign Key constraint 
-- if there is data violating it.
DELETE FROM public.reviews 
WHERE product_id NOT IN (SELECT id FROM public.products);

-- 2. DROP EXISTING CONSTRAINT (if any)
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

-- 3. ADD FOREIGN KEY CONSTRAINT
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- 4. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload config';

-- 5. VERIFICATION
-- Check if the constraint exists
-- SELECT conname FROM pg_constraint WHERE conname = 'reviews_product_id_fkey';
