-- Enable RLS on reviews table
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view reviews (Public Select)
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT
    USING (true);

-- Policy: Allow anyone to submit reviews (Public Insert)
-- This allows guest users to leave reviews
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.reviews;
CREATE POLICY "Anyone can submit reviews" ON public.reviews
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow admins to manage reviews (Admin All)
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews" ON public.reviews
    FOR ALL
    USING (is_admin());
