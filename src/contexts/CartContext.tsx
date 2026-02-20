import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UIProduct } from './WishlistContext';

export interface CartItem extends UIProduct {
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: UIProduct, quantity?: number, size?: string, color?: string) => void;
    removeFromCart: (productId: string | number, size?: string, color?: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = React.useCallback((product: UIProduct, quantity = 1, size?: string, color?: string) => {
        setCartItems(prev => {
            // Check if item details match (id, size, color)
            const existingItemIndex = prev.findIndex(item =>
                item.id === product.id &&
                item.selectedSize === size &&
                item.selectedColor === color
            );

            if (existingItemIndex > -1) {
                const newCart = [...prev];
                newCart[existingItemIndex].quantity += quantity;
                toast.success(`Updated quantity for ${product.name}`, {
                    description: `${newCart[existingItemIndex].quantity} items in cart.`
                });
                return newCart;
            } else {
                toast.success(`${product.name} added to cart`, {
                    description: `${quantity} item(s) successfully added.`
                });
                return [...prev, { ...product, discountPrice: product.discountPrice || product.discount_price, quantity, selectedSize: size, selectedColor: color }];
            }
        });
    }, []);

    const removeFromCart = React.useCallback((productId: string | number, size?: string, color?: string) => {
        setCartItems(prev => prev.filter(item =>
            !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
        ));
        toast.info("Item removed from cart");
    }, []);

    const clearCart = React.useCallback(() => {
        setCartItems([]);
        toast.info("Cart cleared");
    }, []);

    const cartCount = React.useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [cartItems]);

    const cartTotal = React.useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const itemPrice = (item.discountPrice && item.discountPrice < item.price) ? item.discountPrice : item.price;
            return acc + (itemPrice * item.quantity);
        }, 0);
    }, [cartItems]);

    const value = React.useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen
    }), [cartItems, addToCart, removeFromCart, clearCart, cartCount, cartTotal, isCartOpen]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
