import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product as DBProduct } from '@/hooks/useProducts';

// Simplified UI Product type for contexts to avoid circular dependencies or massive imports
export interface UIProduct {
    id: string | number;
    name: string;
    price: number;
    discountPrice?: number;
    discount_price?: number;
    originalPrice?: number;
    image: string;
    category?: string;
    badge?: string;
}

interface WishlistContextType {
    wishlistItems: UIProduct[];
    addToWishlist: (product: UIProduct) => void;
    removeFromWishlist: (productId: string | number) => void;
    isInWishlist: (productId: string | number) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<UIProduct[]>([]);

    // Load wishlist from local storage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setWishlistItems(JSON.parse(savedWishlist));
            } catch (e) {
                console.error("Failed to parse wishlist from local storage", e);
            }
        }
    }, []);

    // Save wishlist to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = React.useCallback((product: UIProduct) => {
        setWishlistItems(prev => {
            if (prev.some(item => item.id === product.id)) {
                toast.info(`${product.name} is already in your wishlist`);
                return prev;
            }
            toast.success(`${product.name} added to wishlist`);
            return [...prev, product];
        });
    }, []);

    const removeFromWishlist = React.useCallback((productId: string | number) => {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        toast.info("Item removed from wishlist");
    }, []);

    const isInWishlist = React.useCallback((productId: string | number) => {
        return wishlistItems.some(item => item.id === productId);
    }, [wishlistItems]);

    const value = React.useMemo(() => ({
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length
    }), [wishlistItems, addToWishlist, removeFromWishlist, isInWishlist]);

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
