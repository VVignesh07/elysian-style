-- =====================================================
-- FIX: Enable Order Deletion for Admins
-- =====================================================

-- 1. Policies for Orders
-- Allow admins to delete orders
DROP POLICY IF EXISTS "Admin delete orders" ON orders;
CREATE POLICY "Admin delete orders" ON orders FOR DELETE USING (is_admin());

-- 2. Policies for Order Items
-- Allow admins to delete order items (important for cascade or direct cleanup)
DROP POLICY IF EXISTS "Admin delete order items" ON order_items;
CREATE POLICY "Admin delete order items" ON order_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND is_admin())
);
