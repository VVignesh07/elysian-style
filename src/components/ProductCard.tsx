import { Link } from "react-router-dom";
import { Heart, Eye, Star, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCategories } from "@/hooks/useCategories";
import { Product as DBProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";


interface ProductCardProps {
    product: DBProduct;
    className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { data: categories = [] } = useCategories();

    const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600';

    const categoryName = categories.find(c => c.id === product.category_id)?.name || '';
    const isCombo = categoryName.toLowerCase().includes('combo');

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
            toast.info("Select options", { description: "Open product details to select size and color." });
            return;
        }

        const cartProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            discountPrice: product.discount_price || undefined,
            image: product.images[0] || '',
            category: categories.find(c => c.id === product.category_id)?.name || 'General'
        };

        // @ts-ignore
        addToCart(cartProduct);
        toast.success(`${product.name} added to cart!`);
    };

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const p = {
            id: product.id,
            name: product.name,
            price: product.price,
            discountPrice: product.discount_price || undefined,
            discount_price: product.discount_price || undefined,
            image: product.images[0] || '',
            category: categories.find(c => c.id === product.category_id)?.name || 'General'
        };

        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            // @ts-ignore
            addToWishlist(p);
            toast.success(`${product.name} added to wishlist!`);
        }
    };

    return (
        <div className={cn("premium-card group h-full", className)}>
            <Link to={`/product/${product.id}`} className="block h-full flex flex-col">
                <div className="image-container relative aspect-[3/4] overflow-hidden">
                    <OptimizedImage
                        src={mainImage}
                        alt={product.name}
                        width={400}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        enableZoom={true}
                    />

                    {/* Badges */}
                    <div className="absolute top-2 sm:top-4 left-0 z-10 flex flex-col gap-1 sm:gap-2 items-start">
                        {product.is_new && (
                            <span className="bg-[#332D2D] text-white text-[7px] sm:text-[9px] font-bold pl-3 pr-2 py-1 sm:pl-4 sm:pr-3 sm:py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm">
                                New
                            </span>
                        )}
                        {product.discount_price && (
                            <span className="bg-luxury-gold text-white text-[7px] sm:text-[9px] font-bold pl-3 pr-2 py-1 sm:pl-4 sm:pr-3 sm:py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm">
                                Sale
                            </span>
                        )}
                        {isCombo && (
                            <span className="bg-indigo-600 text-white text-[7px] sm:text-[9px] font-bold pl-3 pr-2 py-1 sm:pl-4 sm:pr-3 sm:py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm flex items-center gap-1">
                                <Sparkles size={10} className="sm:w-3 sm:h-3" /> Combo
                            </span>
                        )}
                    </div>

                    {/* Action Icons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <button
                            onClick={toggleWishlist}
                            className={`action-icon ${isInWishlist(product.id) ? "bg-luxury-gold text-white" : ""}`}
                            aria-label="Toggle Wishlist"
                        >
                            <Heart size={16} className={isInWishlist(product.id) ? "fill-white" : ""} />
                        </button>
                        <div className="action-icon">
                            <Eye size={16} />
                        </div>
                    </div>

                    {/* Add to Cart Bar */}
                    <button
                        onClick={handleAddToCart}
                        className="add-to-cart-bar translate-y-full group-hover:translate-y-0 z-10 w-full"
                    >
                        <span>Add To Cart</span>
                    </button>
                </div>

                <div className="p-3 sm:p-5 flex flex-col items-center text-center gap-1 flex-1">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={11}
                                className={i < Math.floor(Number(product.rating) || 4.5) ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/30"}
                            />
                        ))}
                        <span className="text-[9px] sm:text-[11px] font-medium text-muted-foreground/80 ml-1">{product.rating || "4.5"}</span>
                    </div>

                    {/* Name */}
                    <h3 className="font-heading text-xs sm:text-base tracking-tight text-[#332D2D] line-clamp-1 group-hover:text-luxury-gold transition-colors duration-300">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mt-auto pt-1">
                        {product.discount_price ? (
                            <>
                                <span className="text-sm sm:text-base font-bold text-luxury-gold">₹{product.discount_price.toLocaleString('en-IN')}</span>
                                <span className="text-muted-foreground line-through text-[9px] sm:text-xs opacity-50">₹{product.price.toLocaleString('en-IN')}</span>
                            </>
                        ) : (
                            <span className="text-sm sm:text-base font-bold text-[#332D2D]">₹{product.price.toLocaleString('en-IN')}</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
