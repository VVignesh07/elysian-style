# QUICK FIX - Do These Steps Now

## Step 1: Hard Refresh Browser
Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
This will clear cache and load the updated code that fixes the AbortError.

## Step 2: Run Database Setup
Open Supabase SQL Editor and run `complete_setup.sql`

## Step 3: Add Products
If Step 2 shows "0 products", run `migrate-products.sql`

## Step 4: Create Admin Account
1. Go to http://localhost:5173/register
2. Register: `zerofashion2025@gmail.com` / `ZeroFashion#123`
3. In Supabase SQL Editor, run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'zerofashion2025@gmail.com';
```

## Step 5: Test
1. Refresh browser again
2. Products should show on home page
3. Login at http://localhost:5173/admin/login

## If AbortError Still Shows
This is a harmless React development error. It doesn't affect functionality.
To completely remove it, disable React Strict Mode:

In `src/main.tsx`, change:
```tsx
<React.StrictMode>
  <App />
</React.StrictMode>
```
To:
```tsx
<App />
```

But this is NOT recommended for production. The error is development-only.
