/**
 * Upload image to Cloudinary
 * Uses unsigned upload preset for client-side uploads
 */

import imageCompression from 'browser-image-compression';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'drwdcc8rc';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'elysian_unsigned';

/**
 * Upload an image file to Cloudinary
 * @param file - The file to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns The secure URL of the uploaded image
 */
export async function uploadImage(
    file: File,
    folder: string = 'elysian-style'
): Promise<string> {
    try {
        // Compress the image before uploading
        const options = {
            maxSizeMB: 5, // Cloudinary limits unsigned to 10MB, stay well below
            maxWidthOrHeight: 2048,
            useWebWorker: true,
            initialQuality: 0.8
        };

        const compressedFile = await imageCompression(file, options);
        console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
}

/**
 * Upload image from base64 string to Cloudinary
 * @param base64 - Base64 encoded image string
 * @param folder - Optional folder path in Cloudinary
 * @returns The secure URL of the uploaded image
 */
export async function uploadBase64Image(
    base64: string,
    folder: string = 'elysian-style'
): Promise<string> {
    try {
        // Find the mimetype from base64 string
        const mimeType = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

        let fileToUpload: File | string = base64;

        // If it's a valid data URI, we can compress it
        if (mimeType && mimeType.length > 1) {
            // Check approximate size (base64 is ~1.33x larger than binary)
            const approxSizeMB = (base64.length * 0.75) / (1024 * 1024);

            // If it's larger than ~2MB, compress it
            if (approxSizeMB > 2) {
                // Convert base64 to File object
                const res = await fetch(base64);
                const blob = await res.blob();
                const tempFile = new File([blob], "image.jpg", { type: mimeType[1] });

                // Compress
                const options = {
                    maxSizeMB: 5,
                    maxWidthOrHeight: 2048,
                    useWebWorker: true,
                    initialQuality: 0.8
                };

                try {
                    const compressedFile = await imageCompression(tempFile, options);
                    console.log(`Base64 original approx: ${approxSizeMB.toFixed(2)} MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                    fileToUpload = compressedFile;
                } catch (err) {
                    console.warn("Compression failed, falling back to original:", err);
                }
            }
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary upload failed:', {
                status: response.status,
                cloudName: CLOUDINARY_CLOUD_NAME,
                preset: CLOUDINARY_UPLOAD_PRESET,
                error: errorData
            });
            throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading base64 image to Cloudinary:', error);
        throw error;
    }
}

/**
 * Delete an image from Cloudinary
 * Note: This requires server-side implementation with API secret
 * For now, we'll just log a warning
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
    console.warn('Image deletion requires server-side implementation:', publicId);
    // TODO: Implement server-side deletion endpoint
}

/**
 * Get optimized image URL from Cloudinary
 * @param url - The original Cloudinary URL
 * @param transformations - Optional transformations (width, height, quality, etc.)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
    url: string,
    transformations?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
    }
): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    const { width, height, quality = 80, format = 'auto' } = transformations || {};

    // Build transformation string
    const transforms = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);

    const transformString = transforms.join(',');

    // Insert transformations into URL
    return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID
 */
export function getPublicIdFromUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) {
        return '';
    }

    const parts = url.split('/upload/');
    if (parts.length < 2) return '';

    const pathParts = parts[1].split('/');
    // Remove version if present (starts with 'v')
    const relevantParts = pathParts.filter(part => !part.startsWith('v'));

    // Join remaining parts and remove file extension
    const publicId = relevantParts.join('/').replace(/\.[^/.]+$/, '');
    return publicId;
}
