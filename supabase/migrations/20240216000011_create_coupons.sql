-- =====================================================
-- CREATE COUPONS TABLE
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount DECIMAL(10,2) DEFAULT 0 CHECK (min_purchase_amount >= 0),
  max_discount_amount DECIMAL(10,2) CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_coupons_updated_at ON public.coupons;
CREATE TRIGGER tr_update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION update_coupons_updated_at();

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

-- Public can view active coupons (for checkout validation)
CREATE POLICY "Public can view active coupons" ON public.coupons
FOR SELECT USING (is_active = true);

-- Admins can manage all coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL USING (is_admin());

-- Insert sample coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_until, is_active)
VALUES 
  ('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 1000, 500, 100, NOW() + INTERVAL '30 days', true),
  ('SAVE500', 'Flat ₹500 off on orders above ₹5000', 'fixed', 500, 5000, NULL, 50, NOW() + INTERVAL '15 days', true),
  ('FESTIVE20', 'Festival special - 20% off', 'percentage', 20, 2000, 1000, NULL, NOW() + INTERVAL '7 days', true)
ON CONFLICT (code) DO NOTHING;
