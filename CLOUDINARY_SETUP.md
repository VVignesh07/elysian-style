# Cloudinary Setup Instructions

## Creating an Unsigned Upload Preset

To allow client-side uploads without exposing your API secret, you need to create an **unsigned upload preset** in Cloudinary:

### Steps:

1. **Login to Cloudinary Dashboard**
   - Go to: https://console.cloudinary.com/
   - Login with your credentials

2. **Navigate to Upload Settings**
   - Click on **Settings** (gear icon) in the top right
   - Click on **Upload** tab in the left sidebar

3. **Create Upload Preset**
   - Scroll down to **Upload presets** section
   - Click **Add upload preset**

4. **Configure the Preset**
   - **Preset name**: `elysian_unsigned`
   - **Signing mode**: Select **Unsigned**
   - **Folder**: `elysian-style` (optional, organizes your uploads)
   - **Use filename**: Enable if you want to preserve original filenames
   - **Unique filename**: Enable to avoid conflicts
   - **Overwrite**: Disable for safety
   - **Access mode**: **Public** (so images are accessible)

5. **Save the Preset**
   - Click **Save** at the bottom

6. **Verify Configuration**
   - The preset name `elysian_unsigned` should now appear in your list
   - Make sure it shows **Unsigned** in the signing mode column

### Alternative: Use Cloudinary CLI

If you prefer command line:

```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Configure
cloudinary config:set cloud_name=drwdcc8rc api_key=578722264614162 api_secret=-l6yT2V3z699YqWmXbHOpeOdDGg

# Create preset
cloudinary admin create_upload_preset elysian_unsigned unsigned=true folder=elysian-style
```

## Testing the Integration

Once the preset is created, the application will be able to upload images directly from the browser to Cloudinary!

### Test Upload Flow:
1. Go to `/admin/categories`
2. Click "Add Category"
3. Upload an image
4. Image will be uploaded to Cloudinary
5. Cloudinary URL will be saved to Supabase database
6. Image will display on the website

## Environment Variables

Make sure these are in your `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=drwdcc8rc
VITE_CLOUDINARY_API_KEY=578722264614162
VITE_CLOUDINARY_API_SECRET=-l6yT2V3z699YqWmXbHOpeOdDGg
VITE_CLOUDINARY_UPLOAD_PRESET=elysian_unsigned
```

## Benefits of Cloudinary

- ✅ **Automatic optimization**: Images are automatically compressed
- ✅ **CDN delivery**: Fast global image delivery
- ✅ **Transformations**: Resize, crop, format conversion on-the-fly
- ✅ **Free tier**: 25GB storage, 25GB bandwidth/month
- ✅ **No server required**: Direct browser uploads
