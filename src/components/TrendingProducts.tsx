import ScrollReveal from "@/components/ScrollReveal";
import { Heart, Star, Eye, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Product as DBProduct } from "@/hooks/useProducts";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Skeleton } from "@/components/ui/skeleton";


const TrendingProducts = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Fetch featured products from Supabase - limit to 8 for performance
  const { data: products = [], isLoading } = useProducts({
    is_featured: true,
    status: 'Active',
    limit: 8
  });
  const { data: categories = [] } = useCategories();

  const handleAddToCart = (e: React.MouseEvent, product: DBProduct) => {
    e.preventDefault();
    e.stopPropagation();

    // Check for options if applicable
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      toast.info("Select options", { description: "Navigate to product details to select size and color." });
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

  const toggleWishlist = (e: React.MouseEvent, product: DBProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const uiProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      category: categories.find(c => c.id === product.category_id)?.name || 'General'
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
    <section id="trending" className="py-20 lg:py-28 bg-[#FCFAF7] scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-12">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="text-[10px] font-body text-luxury-gold uppercase tracking-[0.4em] font-bold mb-3">
                Curated Collection
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-foreground flex items-center gap-3">
                Trending Now
                <Sparkles size={20} className="text-luxury-gold/40 animate-pulse" />
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.2em] border-b border-luxury-gold/20 hover:border-luxury-gold pb-1 transition-all self-start md:self-auto"
            >
              Explore Collection →
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center border border-dashed rounded-3xl border-luxury-gold/10 bg-white/50">
            <p className="text-muted-foreground italic font-body text-sm">Our seasonal collections are being refreshed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
            {products.slice(0, 10).map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 50}>
                <div className="premium-card group h-full">
                  <div className="image-container relative overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <OptimizedImage
                        src={product.images[0] || ''}
                        alt={product.name}
                        width={600}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-4 left-0 z-10 flex flex-col gap-2 items-start">
                      {product.is_new && (
                        <span className="bg-[#332D2D] text-white text-[9px] font-bold pl-4 pr-3 py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm">
                          New
                        </span>
                      )}
                      {product.discount_price && (
                        <span className="bg-luxury-gold text-white text-[9px] font-bold pl-4 pr-3 py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm">
                          Sale
                        </span>
                      )}
                      {categories.find(c => c.id === product.category_id)?.name.toLowerCase().includes('combo') && (
                        <span className="bg-indigo-600 text-white text-[9px] font-bold pl-4 pr-3 py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm flex items-center gap-1">
                          <Sparkles size={10} /> Combo
                        </span>
                      )}
                    </div>

                    {/* Action Icons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <button
                        onClick={(e) => toggleWishlist(e, product)}
                        className={`action-icon ${isInWishlist(product.id) ? "bg-luxury-gold text-white" : ""}`}
                        aria-label="Toggle Wishlist"
                      >
                        <Heart size={16} className={isInWishlist(product.id) ? "fill-white" : ""} />
                      </button>
                      <Link to={`/product/${product.id}`} className="action-icon">
                        <Eye size={16} />
                      </Link>
                    </div>

                    {/* Add to Cart Bar */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="add-to-cart-bar translate-y-full group-hover:translate-y-0 z-10"
                    >
                      <span>Add To Cart</span>
                    </button>
                  </div>

                  <div className="p-5 flex flex-col items-start gap-1">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < Math.floor(Number(product.rating) || 4.5) ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/30"}
                        />
                      ))}
                      <span className="text-[11px] font-medium text-muted-foreground/80 ml-1">{product.rating || "4.5"}</span>
                    </div>

                    {/* Name */}
                    <Link to={`/product/${product.id}`} className="block w-full">
                      <h3 className="font-heading text-sm text-[#332D2D] line-clamp-1 group-hover:text-luxury-gold transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center gap-3 mt-0.5">
                      {product.discount_price ? (
                        <>
                          <span className="text-sm font-bold text-luxury-gold">₹{product.discount_price.toLocaleString('en-IN')}</span>
                          <span className="text-[11px] text-muted-foreground line-through opacity-50">₹{product.price.toLocaleString('en-IN')}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-[#332D2D]">₹{product.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;
