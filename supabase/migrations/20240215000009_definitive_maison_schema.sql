-- =====================================================
-- MAISON DEFINITIVE DATABASE SCHEMA (v2.0)
-- Consolidated & Idempotent Integration
-- Covers: Auth, Roles, Inventory, Categories, Orders
-- =====================================================

-- 1. BASE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES SETUP
-- Profiles: Extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles: For Admin/Customer distinction
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
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

-- Products
CREATE TABLE IF NOT EXISTS public.products (
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

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address JSONB NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  selected_size TEXT,
  selected_color TEXT,
  image_url TEXT
);

-- 3. TRIGGERS & FUNCTIONS
-- A. Update Updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- B. Handle New User (Auth Sync)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  -- Default to 'customer' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Category Product Count
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.category_id IS NOT NULL THEN
            UPDATE categories SET product_count = (SELECT COUNT(*) FROM products WHERE category_id = NEW.category_id) WHERE id = NEW.category_id;
        END IF;
    END IF;
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF OLD.category_id IS NOT NULL THEN
            UPDATE categories SET product_count = (SELECT COUNT(*) FROM products WHERE category_id = OLD.category_id) WHERE id = OLD.category_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- D. Stock Management
CREATE OR REPLACE FUNCTION reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_id IS NOT NULL THEN
        UPDATE products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_stock_on_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
        UPDATE products p SET stock_quantity = p.stock_quantity + oi.quantity
        FROM order_items oi WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. BIND TRIGGERS
-- Updated_at
DROP TRIGGER IF EXISTS tr_update_profiles_updated_at ON profiles;
CREATE TRIGGER tr_update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_update_products_updated_at ON products;
CREATE TRIGGER tr_update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_update_orders_updated_at ON orders;
CREATE TRIGGER tr_update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Category Count
DROP TRIGGER IF EXISTS tr_update_category_count ON products;
CREATE TRIGGER tr_update_category_count AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

-- Stock
DROP TRIGGER IF EXISTS on_order_item_created_reduce_stock ON order_items;
CREATE TRIGGER on_order_item_created_reduce_stock AFTER INSERT ON order_items FOR EACH ROW EXECUTE FUNCTION reduce_stock_on_order();

DROP TRIGGER IF EXISTS on_order_cancelled_restore_stock ON orders;
CREATE TRIGGER on_order_cancelled_restore_stock AFTER UPDATE OF status ON orders FOR EACH ROW EXECUTE FUNCTION restore_stock_on_cancellation();

-- 5. RLS HARDENING
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper Function for Admin Check
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- A. Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());

-- B. Products/Categories
DROP POLICY IF EXISTS "Public Select" ON products;
CREATE POLICY "Public Select" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All" ON products;
CREATE POLICY "Admin All" ON products FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Public Select" ON categories;
CREATE POLICY "Public Select" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All" ON categories;
CREATE POLICY "Admin All" ON categories FOR ALL USING (is_admin());

-- C. Orders
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update orders" ON orders;
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (is_admin());

-- D. Order Items
DROP POLICY IF EXISTS "Users view own items" ON order_items;
CREATE POLICY "Users view own items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
);

DROP POLICY IF EXISTS "Anyone can insert items" ON order_items;
CREATE POLICY "Anyone can insert items" ON order_items FOR INSERT WITH CHECK (true);

-- 6. FINAL CLEANUP & DATA INTEGRITY
-- Ensure an admin role check exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer'))
);

-- 7. HERO SLIDES
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 9. ADDITIONAL RLS
-- Hero Slides
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Hero Slides" ON hero_slides;
CREATE POLICY "Public Read Hero Slides" ON hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Hero Slides" ON hero_slides;
CREATE POLICY "Admin Manage Hero Slides" ON hero_slides FOR ALL USING (is_admin());

-- Wishlist
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own wishlist" ON wishlist_items;
CREATE POLICY "Users view own wishlist" ON wishlist_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist_items;
CREATE POLICY "Users manage own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- 10. ADDITIONAL TRIGGERS
DROP TRIGGER IF EXISTS tr_update_hero_slides_updated_at ON hero_slides;
CREATE TRIGGER tr_update_hero_slides_updated_at BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


