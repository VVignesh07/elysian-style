-- =====================================================
-- FIX PRODUCTS: DATA INTEGRITY & SLUG SYNC
-- =====================================================

-- 1. Ensure all products have valid slugs
UPDATE public.products 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- 2. Ensure prices are positive
UPDATE public.products
SET price = ABS(price)
WHERE price < 0;

-- 3. Ensure stock is not negative (unless allowed)
UPDATE public.products
SET stock_quantity = 0
WHERE stock_quantity < 0;

-- 4. Clean up any orphaned categories
UPDATE public.products
SET category_id = NULL
WHERE category_id NOT IN (SELECT id FROM public.categories);
