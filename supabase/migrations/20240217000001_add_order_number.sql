-- Migration to add custom order numbering starting from ZF-001
-- 1. Create or Reset sequence for order numbers
DROP SEQUENCE IF EXISTS public.order_number_seq;
CREATE SEQUENCE public.order_number_seq START 1;

-- 2. Add order_number column if it doesn't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- 3. Function to generate the order number (ZF-001 format)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ZF-' || LPAD(nextval('public.order_number_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to automatically set order_number on insert
DROP TRIGGER IF EXISTS tr_set_order_number ON public.orders;
CREATE TRIGGER tr_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- 5. Backfill existing orders (This will set ZF-001, ZF-002, etc. in order of creation)
UPDATE public.orders 
SET order_number = 'ZF-' || LPAD(nextval('public.order_number_seq')::TEXT, 3, '0') 
WHERE order_number IS NULL;
