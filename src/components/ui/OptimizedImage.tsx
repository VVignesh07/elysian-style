import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl } from '@/services/storage';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number; // Desired width
    height?: number; // Desired height
    className?: string;
    priority?: boolean; // If true, eager load. If false (default), lazy load.
    enableZoom?: boolean; // Optional: style for zoom effect
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    enableZoom = false,
    ...props
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Generate optimized URL if it's a Cloudinary image
    // We use 800px as a reasonable default max width if not specified, to prevent loading huge originals
    const optimizedSrc = getOptimizedImageUrl(src, {
        width: width,
        height: height,
        quality: 80, // Good balance
        format: 'auto',
    });

    return (
        <div className={cn("overflow-hidden relative", className)}>
            <img
                src={optimizedSrc}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                onLoad={() => setIsLoaded(true)}
                onError={() => setError(true)}
                className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    !isLoaded && "blur-sm scale-110", // Blur effect while loading
                    isLoaded && "blur-0 scale-100",
                    enableZoom && "hover:scale-110", // Optional hover zoom
                    className
                )}
                {...props}
            />
            {/* Optional: Add a skeleton loader here if needed, but blur-up is usually sufficient */}
        </div>
    );
}
