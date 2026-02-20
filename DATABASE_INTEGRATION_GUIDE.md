# Database Integration Guide - Product Images in Admin Orders

## Quick Fix Steps

### Option 1: Run SQL Script in Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `elysian-style`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Fix Script**
   - Copy the contents of [`fix_order_items_images.sql`](file:///c:/Users/Arun/Desktop/elysian-style/fix_order_items_images.sql)
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify Results**
   - The script will show you:
     - ✅ If `image_url` column exists
     - 📊 How many order items have images
     - 🔄 Backfill missing images from products table
     - ⚠️ List any items that still don't have images

### Option 2: Use Supabase CLI (If Docker is Running)

```bash
# Reset database to apply all migrations
npx supabase db reset

# Or push specific migration
npx supabase db push
```

## What the Fix Does

### 1. Schema Verification
- Checks if `order_items.image_url` column exists
- Adds it if missing (though it should already exist from migration)

### 2. Data Backfill
- Updates existing orders that don't have `image_url`
- Pulls the first image from the related product's `images` array
- Only affects orders where:
  - `image_url` is NULL
  - `product_id` is valid
  - Product has images available

### 3. Validation
- Shows statistics on image coverage
- Lists any problematic records

## Expected Results

After running the script, you should see:

```
✅ image_url column already exists in order_items table

 column_name | data_type | is_nullable 
-------------+-----------+-------------
 image_url   | text      | YES

Updated X rows (backfilled images)

 total_order_items | items_with_images | items_without_images 
-------------------+-------------------+---------------------
              50   |        48         |          2
```

## Troubleshooting

### If images still don't show:

1. **Check RLS Policies**
   ```sql
   -- Verify users can read products table
   SELECT * FROM products LIMIT 1;
   ```

2. **Check Product Images**
   ```sql
   -- Verify products have valid image URLs
   SELECT id, name, images 
   FROM products 
   WHERE images IS NOT NULL 
   LIMIT 5;
   ```

3. **Check Order Items**
   ```sql
   -- Verify order_items have image_url or product_id
   SELECT id, product_name, image_url, product_id
   FROM order_items
   LIMIT 10;
   ```

## Database Schema Reference

### Current Schema (Correct)

```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  selected_size TEXT,
  selected_color TEXT,
  image_url TEXT  -- ✅ This field stores the product image
);
```

### Data Flow

1. **Product Detail** → User adds product to cart
   - `images[0]` extracted from product

2. **Cart** → Image stored in cart item
   - `item.image` field

3. **Checkout** → Order created
   - `image_url: item.image` saved to `order_items`

4. **Admin Orders** → Display images
   - Primary: Uses `order_items.image_url`
   - Fallback: Joins `products.images[0]`
   - Last resort: Placeholder image

## Files Reference

- **Migration**: [`supabase/migrations/20240215000009_definitive_maison_schema.sql`](file:///c:/Users/Arun/Desktop/elysian-style/supabase/migrations/20240215000009_definitive_maison_schema.sql)
- **Fix Script**: [`fix_order_items_images.sql`](file:///c:/Users/Arun/Desktop/elysian-style/fix_order_items_images.sql)
- **Admin Component**: [`src/pages/admin/AdminOrders.tsx`](file:///c:/Users/Arun/Desktop/elysian-style/src/pages/admin/AdminOrders.tsx)

## Next Steps

1. Run the SQL script in Supabase Dashboard
2. Refresh the Admin Orders page
3. Verify images are displaying
4. If issues persist, check browser console for errors
