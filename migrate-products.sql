-- =====================================================
-- MIGRATE PRODUCTS: DATA SEEDING & CATEGORY MAPPING
-- =====================================================

-- Example: Migrating products to new categories if they exist
-- This is a template for manual data migration.

/*
INSERT INTO public.products (name, slug, description, price, category_id, images, status)
SELECT name, slug, description, price, (SELECT id FROM categories WHERE slug = 'men'), images, 'Active'
FROM temp_products;
*/

-- Update product count in categories after migration
UPDATE categories c
SET product_count = (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id);
