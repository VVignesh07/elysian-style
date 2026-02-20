import { OrderItemDB } from '@/types/order.types';

/**
 * Constants for image handling and optimization
 */
export const IMAGE_CONSTANTS = {
    FALLBACK_URL: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
    THUMBNAIL_SIZE: 'w=100&q=80',
    MEDIUM_SIZE: 'w=400&q=80',
    LARGE_SIZE: 'w=800&q=90',
} as const;

/**
 * Safely extracts product image URL from order item with proper fallback chain
 * Priority: order_items.image_url > products.images[0] > fallback
 * 
 * @param item - Order item from database
 * @param size - Image size preset (THUMBNAIL_SIZE, MEDIUM_SIZE, LARGE_SIZE)
 * @returns Optimized image URL
 */
export function getOrderItemImage(
    item: OrderItemDB | null | undefined,
    size: keyof typeof IMAGE_CONSTANTS = 'MEDIUM_SIZE'
): string {
    if (!item) {
        return IMAGE_CONSTANTS.FALLBACK_URL;
    }

    // Priority 1: Direct image_url (saved at checkout)
    if (item.image_url && isValidImageUrl(item.image_url)) {
        return optimizeImageUrl(item.image_url, IMAGE_CONSTANTS[size]);
    }

    // Priority 2: Product images from joined relation
    if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        const firstImage = item.product.images[0];
        if (isValidImageUrl(firstImage)) {
            return optimizeImageUrl(firstImage, IMAGE_CONSTANTS[size]);
        }
    }

    // Priority 3: Fallback (check if product_name can be used for a placeholder or just use default)
    return IMAGE_CONSTANTS.FALLBACK_URL;
}

/**
 * Validates if a string is a valid image URL or path
 * Supports: HTTP/HTTPS, Data URLs (Base64), and relative paths
 * @param url - URL string to validate
 * @returns True if valid image source
 */
function isValidImageUrl(url: string | null | undefined): url is string {
    if (!url || typeof url !== 'string') return false;

    // Support Base64 data URLs
    if (url.startsWith('data:image/')) return true;

    // Support relative paths (starting with /)
    if (url.startsWith('/')) return true;

    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        // If it's not a valid URL but has an extension, it might be a relative path or local file
        return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url);
    }
}

/**
 * Optimizes image URL with size parameters (for services like Unsplash, Cloudinary)
 * Bails out for data URLs or relative paths that are not from known providers.
 * @param url - Original image URL
 * @param sizeParams - Size parameters string (e.g., "w=400&q=80")
 * @returns Optimized URL with parameters or original if optimization isn't supported
 */
function optimizeImageUrl(url: string, sizeParams: string): string {
    if (!url) return url;

    // Don't attempt to optimize data URLs or very short paths
    if (url.startsWith('data:') || url.length < 5) return url;

    try {
        // Check if it's a valid absolute URL
        const isAbsolute = url.startsWith('http');
        if (!isAbsolute) return url;

        const urlObj = new URL(url);

        // Only optimize known providers (Unsplash, etc.) or if they already have 'w' param
        const isUnsplash = urlObj.hostname.includes('unsplash.com');
        const isCloudinary = urlObj.hostname.includes('cloudinary.com');

        if (isUnsplash || isCloudinary || urlObj.searchParams.has('w')) {
            // Add size parameters
            const params = sizeParams.split('&');
            params.forEach(param => {
                const [key, value] = param.split('=');
                if (key && value && !urlObj.searchParams.has(key)) {
                    urlObj.searchParams.set(key, value);
                }
            });
            return urlObj.toString();
        }

        return url;
    } catch {
        return url; // Return original if URL parsing fails
    }
}

/**
 * Gets all available images for a product (useful for galleries)
 * @param item - Order item from database
 * @returns Array of valid image URLs
 */
export function getProductImages(item: OrderItemDB | null | undefined): string[] {
    if (!item?.product?.images) return [IMAGE_CONSTANTS.FALLBACK_URL];

    const validImages = item.product.images.filter(isValidImageUrl);
    return validImages.length > 0 ? validImages : [IMAGE_CONSTANTS.FALLBACK_URL];
}

/**
 * Handles image load errors by setting fallback
 * @param event - Image error event
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>): void {
    event.currentTarget.src = IMAGE_CONSTANTS.FALLBACK_URL;
    event.currentTarget.onerror = null; // Prevent infinite loop
}
