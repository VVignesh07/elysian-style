# Complete Setup Guide - Zero Fashion E-Commerce

## 🎯 Overview
This guide will help you set up the complete Supabase + Cloudinary integration for the Zero Fashion e-commerce platform.

---

## 📋 Prerequisites
- Supabase account with project created
- Cloudinary account with credentials
- Node.js and npm installed

---

## 🔧 Step 1: Supabase Database Setup

### 1.1 Access Supabase SQL Editor
1. Go to: https://utoukqzikoldefjvzzhy.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### 1.2 Run Database Schema
1. Open the file: `supabase-schema.sql` in your project
2. Copy **ALL** the contents
3. Paste into the Supabase SQL Editor
4. Click **RUN** (or press Ctrl+Enter)

✅ **Expected Result**: You should see "Success. No rows returned" message

### 1.3 Verify Tables Created
1. Click **Table Editor** in the left sidebar
2. You should see two tables:
   - `categories` (with 5 default categories)
   - `products` (empty for now)

---

## ☁️ Step 2: Cloudinary Setup

### 2.1 Create Upload Preset
1. Go to: https://console.cloudinary.com/
2. Click **Settings** (gear icon) → **Upload** tab
3. Scroll to **Upload presets** section
4. Click **Add upload preset**

### 2.2 Configure Preset
Fill in these settings:
- **Preset name**: `elysian_unsigned`
- **Signing mode**: **Unsigned** ⚠️ (Important!)
- **Folder**: `elysian-style`
- **Use filename**: ✓ Enabled
- **Unique filename**: ✓ Enabled
- **Access mode**: **Public**

### 2.3 Save
Click **Save** at the bottom

✅ **Expected Result**: Preset `elysian_unsigned` appears in your list with "Unsigned" mode

---

## 🧪 Step 3: Test the Integration

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test Category Management
1. Open browser: `http://localhost:5173/admin/categories`
2. Click **"Add Category"** button
3. Fill in the form:
   - **Name**: "Test Category"
   - **Description**: "This is a test"
   - **Upload an image** (any JPG/PNG)
   - **Pick a color**
4. Click **"Add Category"**

✅ **Expected Result**: 
- Success toast appears
- Category card appears in the grid
- Image is visible

### 3.3 Verify Database
1. Go back to Supabase → **Table Editor** → `categories`
2. You should see your new category with:
   - Name, slug, description
   - `image_url` pointing to Cloudinary
   - Status = "Active"

### 3.4 Check Frontend Display
1. Go to homepage: `http://localhost:5173/`
2. Scroll to "Shop by Category" section
3. Your new category should appear!

✅ **Expected Result**: Category displays on homepage with the uploaded image

---

## 🎨 Step 4: Test Product Management

### 4.1 Add a Product
1. Go to: `http://localhost:5173/admin/products`
2. Click **"Add Product"**
3. Fill in product details:
   - Name, description, price
   - Select the category you created
   - Upload product images
   - Add sizes, colors, stock
4. Click **"Save Product"**

✅ **Expected Result**: Product appears in admin products list

### 4.2 Verify on Shop Page
1. Go to: `http://localhost:5173/shop`
2. Your product should be visible
3. Click on it to see product details

---

## 🐛 Troubleshooting

### Issue: "Failed to upload image"
**Solution**: 
- Verify Cloudinary upload preset is named exactly `elysian_unsigned`
- Make sure signing mode is **Unsigned**
- Check `.env` file has correct Cloudinary credentials

### Issue: "Failed to create category"
**Solution**:
- Check browser console for errors
- Verify Supabase SQL schema ran successfully
- Check Supabase → Table Editor → categories table exists

### Issue: Categories not showing on homepage
**Solution**:
- Make sure category status is "Active"
- Check browser console for errors
- Verify `useCategories` hook is fetching data

### Issue: SQL errors when running schema
**Solution**:
- The new `supabase-schema.sql` is idempotent (safe to run multiple times)
- It will drop and recreate all objects
- Just run it again - it should work!

---

## ✅ Success Checklist

- [ ] Supabase database tables created
- [ ] 5 default categories visible in Supabase
- [ ] Cloudinary upload preset created
- [ ] Can add category in admin panel
- [ ] Category image uploads to Cloudinary
- [ ] Category appears on homepage
- [ ] Can add product in admin panel
- [ ] Product appears on shop page

---

## 🎉 You're All Set!

Your e-commerce platform is now fully integrated with:
- ✅ **Supabase** - Database for categories & products
- ✅ **Cloudinary** - Cloud image storage & CDN
- ✅ **Real-time sync** - Admin changes appear instantly on website
- ✅ **Professional UI** - Beautiful admin panel & frontend

Start adding your products and categories! 🚀
