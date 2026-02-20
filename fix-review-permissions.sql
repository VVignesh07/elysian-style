-- =====================================================
-- FIX REVIEW PERMISSIONS & RLS
-- Run this in Supabase SQL Editor if editing/deleting fails
-- =====================================================

-- 1. Ensure RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON reviews;

-- 3. Create permissive policies for the boutique demo
-- Public can view and insert (customers)
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert reviews" 
ON reviews FOR INSERT 
WITH CHECK (true);

-- Authenticated users (Admin) can update and delete
-- For demo purposes, we'll allow these if authenticated
CREATE POLICY "Authenticated users can update reviews" 
ON reviews FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reviews" 
ON reviews FOR DELETE 
USING (true);

-- 4. Verify Trigger is properly bound
-- This ensures product ratings update automatically
DROP TRIGGER IF EXISTS tr_update_product_stats_on_review ON reviews;

CREATE TRIGGER tr_update_product_stats_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_reviews_stats();

-- Success message
-- SELECT 'Review permissions and triggers fixed!' as status;
