-- =====================================================
-- ELYSIAN STYLE - DATABASE SCHEMA (IDEMPOTENT)
-- Safe to run multiple times
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING OBJECTS (Clean slate)
-- =====================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_product_count_on_insert ON products;
DROP TRIGGER IF EXISTS update_product_count_on_update ON products;
DROP TRIGGER IF EXISTS update_product_count_on_delete ON products;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_category_product_count() CASCADE;

-- Drop tables (CASCADE removes dependent objects)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  display_order INTEGER DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_order ON categories(display_order);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  sku TEXT UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
  details TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_new ON products(is_new);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON categories
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER TO UPDATE PRODUCT COUNT IN CATEGORIES
-- =====================================================
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
        IF NEW.category_id IS NOT NULL THEN
            UPDATE categories 
            SET product_count = (
                SELECT COUNT(*) FROM products WHERE category_id = NEW.category_id
            )
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF (TG_OP = 'UPDATE') THEN
        -- Update old category count
        IF OLD.category_id IS NOT NULL THEN
            UPDATE categories 
            SET product_count = (
                SELECT COUNT(*) FROM products WHERE category_id = OLD.category_id
            )
            WHERE id = OLD.category_id;
        END IF;
        
        -- Update new category count
        IF NEW.category_id IS NOT NULL THEN
            UPDATE categories 
            SET product_count = (
                SELECT COUNT(*) FROM products WHERE category_id = NEW.category_id
            )
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
        IF OLD.category_id IS NOT NULL THEN
            UPDATE categories 
            SET product_count = (
                SELECT COUNT(*) FROM products WHERE category_id = OLD.category_id
            )
            WHERE id = OLD.category_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_count_on_insert 
AFTER INSERT ON products
FOR EACH ROW 
EXECUTE FUNCTION update_category_product_count();

CREATE TRIGGER update_product_count_on_update 
AFTER UPDATE OF category_id ON products
FOR EACH ROW 
EXECUTE FUNCTION update_category_product_count();

CREATE TRIGGER update_product_count_on_delete 
AFTER DELETE ON products
FOR EACH ROW 
EXECUTE FUNCTION update_category_product_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are insertable by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories are updatable by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories are deletable by authenticated users" ON categories;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

-- Categories: Public read, anyone can write (for demo purposes)
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY "Categories are insertable by authenticated users" 
ON categories FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Categories are updatable by authenticated users" 
ON categories FOR UPDATE 
USING (true);

CREATE POLICY "Categories are deletable by authenticated users" 
ON categories FOR DELETE 
USING (true);

-- Products: Public read, anyone can write (for demo purposes)
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Products are insertable by authenticated users" 
ON products FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Products are updatable by authenticated users" 
ON products FOR UPDATE 
USING (true);

CREATE POLICY "Products are deletable by authenticated users" 
ON products FOR DELETE 
USING (true);

-- =====================================================
-- SEED DATA - DEFAULT CATEGORIES
-- =====================================================
INSERT INTO categories (name, slug, description, image_url, color, display_order, status) VALUES
('Men', 'men', 'Stylish and comfortable clothing for men', 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800', '#3B82F6', 1, 'Active'),
('Women', 'women', 'Elegant fashion for modern women', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800', '#EC4899', 2, 'Active'),
('Kids', 'kids', 'Fun and playful outfits for children', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800', '#10B981', 3, 'Active'),
('Accessories', 'accessories', 'Complete your look with our accessories', 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800', '#F59E0B', 4, 'Active'),
('Footwear', 'footwear', 'Step out in style with our footwear collection', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', '#8B5CF6', 5, 'Active')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment to verify setup:
-- SELECT * FROM categories ORDER BY display_order;
-- SELECT * FROM products LIMIT 10;
