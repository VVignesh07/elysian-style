import { useRef, useEffect } from "react";
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

  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);

  const mainImage   = product.images[0] || 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600';
  const categoryName = categories.find(c => c.id === product.category_id)?.name || '';
  const isCombo      = categoryName.toLowerCase().includes('combo');

  /* ── 3D mouse tilt with image parallax (hero-like motion) ── */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';

    const img = card.querySelector('.image-container img') as HTMLElement | null;

    const onMove = (e: MouseEvent) => {
      rafRef.current = requestAnimationFrame(() => {
        const { left, top, width: w, height: h } = card.getBoundingClientRect();
        const dx = ((e.clientX - left) / w - .5) * 2;
        const dy = ((e.clientY - top)  / h - .5) * 2;

        card.style.transform = `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 8}deg) translateY(-14px) translateZ(18px)`;
        card.style.transition = 'none';
        card.style.boxShadow = `
          ${dx * -12}px ${dy * -12}px 40px rgba(0,0,0,0.16),
          ${dx * -24}px ${dy * -24}px 80px rgba(0,0,0,0.07),
          0 0 0 1px rgba(0,0,0,0.05)
        `;

        /* Image parallax — shifts opposite to mouse */
        if (img) {
          img.style.transform = `scale(1.08) translate(${dx * -8}px, ${dy * -6}px)`;
          img.style.transition = 'none';
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(rafRef.current);
      card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) translateZ(0)';
      card.style.transition = 'transform .65s cubic-bezier(.4,0,.2,1), box-shadow .65s cubic-bezier(.4,0,.2,1)';
      card.style.boxShadow  = '';

      if (img) {
        img.style.transform  = 'scale(1)';
        img.style.transition = 'transform .65s cubic-bezier(.4,0,.2,1)';
      }
    };

    card.addEventListener('mousemove', onMove, { passive: true });
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if ((product.sizes?.length ?? 0) > 0 || (product.colors?.length ?? 0) > 0) {
      toast.info("Select options", { description: "Open product details to select size and color." });
      return;
    }
    const cartProduct = {
      id: product.id, name: product.name, price: product.price,
      discountPrice: product.discount_price || undefined,
      image: product.images[0] || '',
      category: categories.find(c => c.id === product.category_id)?.name || 'General',
    };
    // @ts-ignore
    addToCart(cartProduct);
    toast.success(`${product.name} added to cart!`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const p = {
      id: product.id, name: product.name, price: product.price,
      discountPrice: product.discount_price || undefined,
      discount_price: product.discount_price || undefined,
      image: product.images[0] || '',
      category: categories.find(c => c.id === product.category_id)?.name || 'General',
    };
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else { // @ts-ignore
      addToWishlist(p); toast.success(`${product.name} added to wishlist!`); }
  };

  return (
    <div ref={cardRef} className={cn("premium-card group h-full", className)}>
      <Link to={`/product/${product.id}`} className="block h-full flex flex-col">

        {/* Image */}
        <div className="image-container relative aspect-[3/4] overflow-hidden">
          <OptimizedImage
            src={mainImage}
            alt={product.name}
            width={400}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            style={{ filter: 'grayscale(10%) contrast(1.05)' } as React.CSSProperties}
            enableZoom
          />

          {/* Shimmer ribbon on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden rounded-t-2xl" style={{ transition: 'opacity .3s' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,.07) 50%,transparent 65%)', animation:'ribbon-flow .7s ease-out' }} />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-0 z-10 flex flex-col gap-1.5 items-start">
            {product.is_new && (
              <span className="bg-black text-white text-[8px] sm:text-[9px] font-bold pl-3 pr-2 py-1 uppercase tracking-widest rounded-r-full shadow">New</span>
            )}
            {product.discount_price && (
              <span className="bg-black/70 text-white text-[8px] sm:text-[9px] font-bold pl-3 pr-2 py-1 uppercase tracking-widest rounded-r-full shadow">Sale</span>
            )}
            {isCombo && (
              <span className="bg-black/85 text-white text-[8px] sm:text-[9px] font-bold pl-3 pr-2 py-1 uppercase tracking-widest rounded-r-full shadow flex items-center gap-1">
                <Sparkles size={8} /> Combo
              </span>
            )}
          </div>

          {/* Action icons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <button
              onClick={toggleWishlist}
              className={`action-icon ${isInWishlist(product.id) ? '!bg-black !text-white' : ''}`}
              aria-label="Toggle Wishlist"
            >
              <Heart size={14} className={isInWishlist(product.id) ? 'fill-white' : ''} />
            </button>
            <div className="action-icon"><Eye size={14} /></div>
          </div>

          {/* Add to cart bar */}
          <button
            onClick={handleAddToCart}
            className="add-to-cart-bar translate-y-full group-hover:translate-y-0 z-10 w-full"
          >
            <span>Add To Cart</span>
          </button>
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5 flex flex-col items-center text-center gap-1 flex-1 bg-white">
          {/* Stars */}
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10}
                className={i < Math.floor(Number(product.rating) || 4.5)
                  ? 'fill-black text-black'
                  : 'text-black/20'}
              />
            ))}
            <span className="text-[9px] text-black/40 ml-1 font-body">{product.rating || '4.5'}</span>
          </div>

          {/* Name */}
          <h3 className="font-body font-bold uppercase text-xs sm:text-sm tracking-tight text-black line-clamp-1 group-hover:text-black/60 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-center gap-2 mt-auto pt-1">
            {product.discount_price ? (
              <>
                <span className="text-sm sm:text-base font-bold text-black">₹{product.discount_price.toLocaleString('en-IN')}</span>
                <span className="text-[9px] sm:text-xs text-black/35 line-through">₹{product.price.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-bold text-black">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
