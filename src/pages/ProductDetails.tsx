import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
    Star,
    ShoppingBag,
    Heart,
    Minus,
    Plus,
    ChevronLeft,
    ChevronRight,
    Share2,
    ArrowRight,
    MessageSquare,
    Send,
    AlertCircle,
    ShieldCheck,
    Lock
} from "lucide-react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useReviews, useSubmitReview } from "@/hooks/useReviews";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorSwatch } from "@/components/ui/ColorSwatch";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    // Fetch product from Supabase
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewName, setReviewName] = useState("");
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

    const { data: product, isLoading: productLoading, isError } = useProduct(id || '');
    const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id || "");
    const submitReview = useSubmitReview();
    const { data: categories = [] } = useCategories();
    const thumbnailRef = useRef<HTMLDivElement>(null);
    // Task List:
    // - [x] Audit admin pages for Dialog accessibility issues
    // - [x] Fix Dialog accessibility in `ProductDetails.tsx`
    // - [x] Fix Dialog accessibility in `AdminTestimonials.tsx`
    // - [x] Verify `AdminCategories.tsx` accessibility (already correct)
    // - [x] Fix Dialog accessibility in `AdminCoupons.tsx`
    // - [x] Fix Dialog accessibility in `AdminHero.tsx`
    // - [/] Verify fixes manually in browser console

    // Only fetch featured products for "You May Also Like" - limit to 8 for performance
    const { data: relatedProductsData = [] } = useProducts({
        status: 'Active',
        is_featured: true
    });

    const relatedProducts = useMemo(() => {
        if (!relatedProductsData || !id) return [];
        return relatedProductsData.filter(p => p.id !== id).slice(0, 8);
    }, [relatedProductsData, id]);

    // State
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && images.length > 1) {
            // next image
            setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        } else if (isRightSwipe && images.length > 1) {
            // prev image
            setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }
    };

    // Reset state when product changes
    useEffect(() => {
        if (product) {
            setQuantity(1);
            setActiveImage(0);
            setSelectedSize(null);
            setSelectedColor(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [product]);

    // Handle Loading State
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!reviewName || !reviewComment) {
            toast.error("Please fill in your name and comment");
            return;
        }

        submitReview.mutate({
            product_id: id,
            user_name: reviewName,
            rating: reviewRating,
            comment: reviewComment,
        }, {
            onSuccess: () => {
                setReviewName("");
                setReviewComment("");
                setIsReviewDialogOpen(false);
                toast.success("Review submitted! Thank you for your feedback.");
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to submit review");
            }
        });
    };

    const scrollThumbnails = (direction: 'left' | 'right') => {
        if (thumbnailRef.current) {
            const scrollAmount = 240;
            thumbnailRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    if (productLoading) {
        return (
            <div className="min-h-screen bg-[#FDFBF9]">
                <Navbar />
                <main className="pt-32 pb-20">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-12 gap-12 xl:gap-20">
                            <div className="lg:col-span-7 space-y-6">
                                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                                <div className="grid grid-cols-5 gap-4">
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                                </div>
                            </div>
                            <div className="lg:col-span-5 space-y-8">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-12 w-3/4" />
                                <Skeleton className="h-10 w-1/3" />
                                <Skeleton className="h-32 w-full" />
                                <div className="space-y-4">
                                    <Skeleton className="h-14 w-full rounded-full" />
                                    <Skeleton className="h-14 w-full rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Handle Error or Not Found
    if (isError || !product) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md px-6">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={32} className="text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-heading mb-4 font-light">Product Unavailable</h2>
                        <p className="text-sm text-muted-foreground font-body mb-8">This piece is currently not available in our collection.</p>
                        <Link to="/shop" className="bg-luxury-gold text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
                            Back to Shop
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=1200'];
    const categoryName = categories.find(c => c.id === product.category_id)?.name || "Shop";
    const isInWishlistState = isInWishlist(product.id);

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        if (product.colors && product.colors.length > 0 && !selectedColor) {
            toast.error("Please select a color");
            return;
        }

        const uiProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            discountPrice: product.discount_price, // Map snake_case from DB to camelCase for UI
            image: images[0],
            category: categoryName
        };

        // @ts-ignore
        addToCart(uiProduct, quantity, selectedSize || undefined, selectedColor || undefined);
        toast.success(`${product.name} added to cart!`);
    };

    const handleBuyNow = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        if (product.colors && product.colors.length > 0 && !selectedColor) {
            toast.error("Please select a color");
            return;
        }

        const uiProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            discountPrice: product.discount_price,
            image: images[0],
            category: categoryName
        };

        // @ts-ignore
        addToCart(uiProduct, quantity, selectedSize || undefined, selectedColor || undefined);
        navigate('/checkout');
    };

    const handleWishlistToggle = () => {
        const uiProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: images[0],
            category: categoryName
        };

        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            // @ts-ignore
            addToWishlist(uiProduct);
            toast.success(`${product.name} added to wishlist!`);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF9]">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 mb-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
                        <ChevronRight size={10} />
                        <Link to="/shop" className="hover:text-luxury-gold transition-colors">Collections</Link>
                        <ChevronRight size={10} />
                        <span className="text-foreground">{product.name}</span>
                    </nav>

                    <div className="grid lg:grid-cols-12 gap-12 xl:gap-20">
                        {/* Left - Image Gallery */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div
                                className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted shadow-lg group/main cursor-grab active:cursor-grabbing"
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEndHandler}
                            >
                                <OptimizedImage
                                    src={images[activeImage]}
                                    alt={product.name}
                                    width={1200}
                                    priority={true}
                                    className="w-full h-full object-cover transition-transform duration-300"
                                />
                                <div className="absolute top-6 left-0 flex flex-col gap-3 z-20 items-start">
                                    {product.is_new && (
                                        <span className="bg-[#332D2D] text-white text-[9px] font-bold pl-4 pr-3 py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm translate-x-0 relative after:absolute after:top-0 after:left-0 after:bottom-0 after:w-[2px] after:bg-white/20">
                                            New
                                        </span>
                                    )}
                                    {product.discount_price && (
                                        <span className="bg-luxury-gold text-white text-[9px] font-bold pl-4 pr-3 py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm">
                                            Sale
                                        </span>
                                    )}
                                </div>

                                {/* Slider Arrows for Main Image */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                            }}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-[#332D2D] opacity-100 transition-all z-20 hover:scale-110"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-[#332D2D] opacity-100 transition-all z-20 hover:scale-110"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="relative group/gallery">
                                <div
                                    ref={thumbnailRef}
                                    className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-4 px-4 sm:-mx-2 sm:px-2 lg:mx-0 lg:px-0 lg:pb-0 scroll-smooth"
                                >
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all shrink-0 w-20 sm:w-24 lg:w-32 ${activeImage === idx ? "border-luxury-gold" : "border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <OptimizedImage
                                                src={img}
                                                alt={`${product.name} view ${idx + 1}`}
                                                width={200}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>


                            </div>
                        </div>

                        {/* Right - Product Info */}
                        <div className="lg:col-span-5 flex flex-col pt-4">
                            <div className="sticky top-32">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={i < Math.floor(product.rating || 4.5) ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/30"}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.reviews_count || 0} REVIEWS</span>
                                            {product.sku && (
                                                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest ml-4 px-2 border-l border-muted-foreground/20">
                                                    SKU: {product.sku}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success("Link copied to clipboard!");
                                            }}
                                            className="text-muted-foreground hover:text-luxury-gold transition-colors p-2 rounded-full hover:bg-muted/50"
                                            title="Share Product"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-2 block">{categoryName}</span>
                                    <h1 className="font-heading text-3xl sm:text-4xl font-light text-[#332D2D] mb-4 sm:mb-6 leading-tight">
                                        {product.name}
                                        {product.show_limited_stock && (
                                            <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 border border-orange-200 animate-pulse">
                                                Limited Stock
                                            </span>
                                        )}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    {product.discount_price ? (
                                        <>
                                            <div className="flex flex-col">
                                                <span className="text-3xl font-bold text-luxury-gold">
                                                    ₹{product.discount_price.toLocaleString('en-IN')}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground line-through opacity-50">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                                        Save ₹{(product.price - product.discount_price).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold text-[#332D2D]">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2.5 mb-8 text-[11px] sm:text-xs text-green-800 bg-green-50 py-2 px-3.5 rounded-lg w-fit border border-green-200/80 font-medium">
                                    <span className="leading-none text-sm">✨</span>
                                    <span><strong>Free Shipping</strong> on UPI Payment / Pre Order</span>
                                </div>

                                <p className="text-base text-muted-foreground leading-relaxed mb-10">
                                    {product.description || "A refined addition to your seasonal wardrobe, balancing comfort with sophisticated style."}
                                </p>

                                {/* Selectors */}
                                <div className="space-y-8 mb-10">
                                    {/* Color Selector */}
                                    {product.colors && product.colors.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/80">Colors</span>
                                                <div className="flex items-center gap-2">
                                                    {selectedColor && <ColorSwatch color={selectedColor} size="xs" />}
                                                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">{selectedColor || "Select"}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                {product.colors.map(color => {
                                                    const isSelected = selectedColor === color;

                                                    return (
                                                        <button
                                                            key={color}
                                                            onClick={() => setSelectedColor(color)}
                                                            className="group relative flex items-center justify-center"
                                                            title={color}
                                                        >
                                                            {/* Selection Ring */}
                                                            <div className={`absolute -inset-1.5 rounded-lg border-2 transition-all duration-300 ${isSelected ? "border-luxury-gold scale-100 opacity-100" : "border-transparent scale-50 opacity-0 group-hover:border-border/60 group-hover:scale-100 group-hover:opacity-100"}`} />

                                                            {/* Color Box Swatch */}
                                                            <ColorSwatch
                                                                color={color}
                                                                size="lg"
                                                                className="rounded-md shadow-sm border border-black/5 transition-transform duration-300 group-hover:scale-95"
                                                            />

                                                            {/* Tooltip hint for accessibility */}
                                                            <span className="sr-only">{color}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Size Selector */}
                                    {product.sizes && product.sizes.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-foreground/80 block mb-4">Sizes</span>
                                            <div className="flex flex-wrap gap-2.5">
                                                {product.sizes.map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`min-w-[45px] h-11 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider border transition-all rounded-md px-3 ${selectedSize === size
                                                            ? "bg-luxury-gold text-white border-luxury-gold shadow-md"
                                                            : "bg-white text-foreground/70 border-border/80 hover:border-luxury-gold hover:bg-[#F9F7F4]"
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stock Indicator */}
                                <div className="flex items-center gap-2 mb-6 px-1">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full animate-pulse",
                                        (product.stock_quantity || 0) > 10 ? "bg-green-500" : "bg-orange-500"
                                    )} />
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                        (product.stock_quantity || 0) > 10 ? "text-muted-foreground/60" : "text-orange-600"
                                    )}>
                                        {(product.stock_quantity || 0) > 0
                                            ? (
                                                <>
                                                    {(product.stock_quantity || 0) < 10 && <AlertCircle size={10} />}
                                                    Only {product.stock_quantity} pieces left
                                                </>
                                            )
                                            : "Out of Stock"}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-6 mb-12">
                                    <div className="flex gap-3 w-full">
                                        <div className="flex items-center border border-border/80 rounded-full h-16 sm:h-[70px] w-auto bg-white shrink-0 px-2">
                                            <button
                                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                                className="w-10 h-full flex items-center justify-center hover:text-luxury-gold transition-colors"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="w-8 text-lg font-bold text-center">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-10 h-full flex items-center justify-center hover:text-luxury-gold transition-colors"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-white text-luxury-gold border-2 border-luxury-gold/30 flex items-center justify-center gap-3 h-16 sm:h-[70px] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold/5 transition-all px-4"
                                        >
                                            <ShoppingBag size={22} className="shrink-0" />
                                            <span className="hidden sm:inline">Add To Cart</span>
                                            <span className="sm:hidden">Add</span>
                                        </button>
                                        <button
                                            onClick={handleWishlistToggle}
                                            className={`h-16 sm:h-[70px] w-16 sm:w-[70px] flex items-center justify-center border rounded-full transition-all shrink-0 ${isInWishlistState
                                                ? "border-luxury-gold text-luxury-gold bg-luxury-gold/5"
                                                : "border-border/80 text-foreground/70 hover:text-luxury-gold hover:border-luxury-gold"
                                                }`}
                                        >
                                            <Heart size={24} className={isInWishlistState ? "fill-current" : ""} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full bg-[#1A1A1A] text-white flex items-center justify-center gap-3 h-14 sm:h-[70px] rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-[0.98]"
                                    >
                                        <ChevronRight size={22} className="shrink-0" />
                                        Buy It Now
                                    </button>

                                    {/* Trust Badges & Shipping Info */}
                                    <div className="space-y-4 pt-2">
                                        <div className="p-4 bg-muted/30 rounded-xl border border-border/40 space-y-3">
                                            <div className="flex items-center gap-3 text-foreground/80">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider">100% Secure Checkout</p>
                                                    <p className="text-[10px] text-muted-foreground">Encryption protocol active for all transactions</p>
                                                </div>
                                                <Lock size={14} className="text-muted-foreground/40" />
                                            </div>

                                            <Separator className="opacity-40" />

                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pay With</span>
                                                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-md border border-border/50">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-3.5 object-contain" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4 object-contain" />
                                                    <img src="https://logodownload.org/wp-content/uploads/2019/09/paytm-logo-2.png" alt="Paytm" className="h-3.5 object-contain" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3.5 object-contain" />
                                                </div>
                                            </div>

                                            <Separator className="opacity-40" />

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] text-foreground/70">
                                                    <span className="leading-none">🚚</span>
                                                    <span><strong>COD Available</strong> (+₹50 fee)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="border-t border-border/40 pt-10">
                                    <Tabs defaultValue="details" className="w-full">
                                        <TabsList className="w-full grid grid-cols-3 mb-8 bg-transparent border-b border-border/40 rounded-none h-auto p-0">
                                            {['DESCRIPTION', 'SHIPPING', 'REVIEWS'].map((tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab.toLowerCase()}
                                                    className="data-[state=active]:border-b-2 data-[state=active]:border-luxury-gold data-[state=active]:text-luxury-gold rounded-none bg-transparent pt-0 pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all"
                                                >
                                                    {tab}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        <TabsContent value="details" className="animate-in fade-in duration-500">
                                            <ul className="space-y-3">
                                                {(product.details && product.details.length > 0) ? product.details.map((detail, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                                                        <span className="w-1 h-1 rounded-full bg-luxury-gold mt-1.5 shrink-0" />
                                                        {detail}
                                                    </li>
                                                )) : (
                                                    <p className="text-xs text-muted-foreground italic">Product specifications available on request.</p>
                                                )}
                                            </ul>
                                        </TabsContent>
                                        <TabsContent value="shipping" className="animate-in fade-in duration-500">
                                            <div className="text-xs text-muted-foreground space-y-4 leading-relaxed">
                                                <p>Standard delivery within 3-5 business days. Express shipping options available at checkout.</p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="reviews" className="animate-in fade-in duration-500">
                                            <div className="pt-4 grid lg:grid-cols-12 gap-12">
                                                {/* Review Summary */}
                                                <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-4xl font-bold text-[#332D2D]">{product.rating || 4.5}</span>
                                                        <div className="flex flex-col">
                                                            <div className="flex gap-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={14} className={i < Math.floor(product.rating || 4.5) ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/20"} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                                {product.reviews_count || 0} REVIEWS
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full space-y-3 mt-8">
                                                        {[5, 4, 3, 2, 1].map((star) => (
                                                            <div key={star} className="flex items-center gap-4 group">
                                                                <span className="text-[10px] font-bold text-muted-foreground min-w-[12px]">{star}</span>
                                                                <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-luxury-gold transition-all duration-1000"
                                                                        style={{ width: star === 5 ? '85%' : (star === 4 ? '10%' : '5%') }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-foreground/40 min-w-[20px] text-right">
                                                                    {star === 5 ? '85%' : (star === 4 ? '10%' : '5%')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <button className="mt-10 w-full bg-white border border-border/80 text-foreground text-[10px] font-bold uppercase tracking-widest py-4 rounded-md hover:bg-[#332D2D] hover:text-white hover:border-[#332D2D] transition-all flex items-center justify-center gap-2 group">
                                                                <MessageSquare size={14} className="group-hover:scale-110 transition-transform" />
                                                                Write A Review
                                                            </button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle className="font-heading text-xl">Write a Review</DialogTitle>
                                                                <DialogDescription className="text-xs text-muted-foreground mt-1">
                                                                    Share your thoughts on this masterpiece with the community.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={handleReviewSubmit} className="space-y-6 pt-4">
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-center gap-2 mb-4">
                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                            <button
                                                                                key={s}
                                                                                type="button"
                                                                                onClick={() => setReviewRating(s)}
                                                                                className="hover:scale-110 transition-transform"
                                                                            >
                                                                                <Star
                                                                                    size={24}
                                                                                    className={s <= reviewRating ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/20"}
                                                                                />
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="rev-name" className="text-[10px] font-bold uppercase tracking-widest">Your Name</Label>
                                                                        <Input
                                                                            id="rev-name"
                                                                            value={reviewName}
                                                                            onChange={(e) => setReviewName(e.target.value)}
                                                                            placeholder="e.g. Jane Doe"
                                                                            className="bg-muted/30"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="rev-comment" className="text-[10px] font-bold uppercase tracking-widest">Your Experience</Label>
                                                                        <Textarea
                                                                            id="rev-comment"
                                                                            value={reviewComment}
                                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                                            placeholder="Tell us what you loved..."
                                                                            className="bg-muted/30 min-h-[100px]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="submit"
                                                                    disabled={submitReview.isPending}
                                                                    className="w-full bg-luxury-gold text-white hover:bg-black py-6"
                                                                >
                                                                    {submitReview.isPending ? (
                                                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Send size={16} className="mr-2" />
                                                                    )}
                                                                    Submit Review
                                                                </Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>

                                                {/* Review List */}
                                                <div className="lg:col-span-8 space-y-8">
                                                    {reviewsLoading ? (
                                                        <Loader2 size={24} className="mx-auto animate-spin text-luxury-gold" />
                                                    ) : reviews.length > 0 ? (
                                                        reviews.map((rev, i) => (
                                                            <div key={rev.id || i} className="border-b border-border/40 pb-8 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-luxury-gold/5 flex items-center justify-center text-[10px] font-bold text-luxury-gold border border-luxury-gold/10">
                                                                            {rev.user_name.split(' ').map(n => n[0]).join('')}
                                                                        </div>
                                                                        <div>
                                                                            <span className="block text-xs font-bold text-[#332D2D]">{rev.user_name}</span>
                                                                            <span className="block text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
                                                                                {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(5)].map((_, si) => (
                                                                            <Star key={si} size={10} className={si < rev.rating ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/20"} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                                    "{rev.comment}"
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex flex-col items-center py-12 px-6 border border-dashed rounded-xl bg-muted/5">
                                                            <MessageSquare className="text-muted-foreground/20 mb-4" size={32} />
                                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">No Reviews Yet</h4>
                                                            <p className="text-xs text-muted-foreground/60 text-center max-w-[250px]">
                                                                Be the first to share your experience with this masterpiece.
                                                            </p>
                                                        </div>
                                                    )}
                                                    <button className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.2em] border-b border-luxury-gold/40 pb-1 hover:border-luxury-gold transition-all">
                                                        View All Authenticated Reviews →
                                                    </button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-20 border-t border-border/40 pt-16">
                            <h2 className="text-2xl font-heading font-light text-[#332D2D] text-center mb-12">
                                You May Also Like
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {relatedProducts.map(relatedProduct => (
                                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetails;

