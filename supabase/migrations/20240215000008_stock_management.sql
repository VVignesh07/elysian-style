-- =====================================================
-- STOCK MANAGEMENT: AUTOMATED INVENTORY REDUCTION
-- =====================================================

-- 1. TRIGGER FUNCTION TO REDUCE STOCK
CREATE OR REPLACE FUNCTION reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Only attempt to reduce stock if product_id is provided
    IF NEW.product_id IS NOT NULL THEN
        -- Check if enough stock exists (optional: prevents going negative)
        -- For now, we allow it but you could add a CHECK here.
        
        UPDATE products
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id;
        
        -- Log warning if stock goes below zero (standard in many systems)
        -- In Supabase, this would show up in the Postgres logs.
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. APPLY TRIGGER TO order_items
-- This will run every time a new row is inserted into order_items
DROP TRIGGER IF EXISTS on_order_item_created_reduce_stock ON order_items;

CREATE TRIGGER on_order_item_created_reduce_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION reduce_stock_on_order();

-- 3. (OPTIONAL) RESTORE STOCK ON CANCELLATION
-- This function handles the case where an order is cancelled
CREATE OR REPLACE FUNCTION restore_stock_on_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes to 'Cancelled'
    IF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
        -- Loop through order items and restore stock
        UPDATE products p
        SET stock_quantity = p.stock_quantity + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_cancelled_restore_stock ON orders;

CREATE TRIGGER on_order_cancelled_restore_stock
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cancellation();
