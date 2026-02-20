import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Trash2, ShoppingBag, Heart } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-heading text-3xl lg:text-4xl font-light mb-2">My Wishlist</h1>
                            <p className="text-muted-foreground font-body">{wishlistItems.length} items saved</p>
                        </div>
                    </div>

                    {wishlistItems.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-12">
                            {wishlistItems.map((product) => (
                                <div key={product.id} className="premium-card group h-full">
                                    <div className="image-container relative aspect-[3/4] overflow-hidden">
                                        <Link to={`/product/${product.id}`} className="block h-full">
                                            <OptimizedImage
                                                src={product.image}
                                                alt={product.name}
                                                width={400}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        </Link>

                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="action-icon absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-destructive"
                                            aria-label="Remove from wishlist"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {product.badge && (
                                            <div className="absolute top-4 left-0 z-10">
                                                <span className="bg-luxury-gold text-white text-[7px] sm:text-[9px] font-bold pl-3 pr-2 py-1 sm:pl-4 sm:pr-3 sm:py-1.5 uppercase tracking-widest rounded-r-md rounded-l-none shadow-sm">
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}

                                        {/* Add to Cart Bar */}
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="add-to-cart-bar translate-y-full group-hover:translate-y-0 z-10 w-full"
                                        >
                                            <span>Add To Cart</span>
                                        </button>
                                    </div>

                                    <div className="p-3 sm:p-5 flex flex-col items-center text-center gap-1">
                                        <Link to={`/product/${product.id}`} className="block w-full">
                                            <h3 className="font-heading text-xs sm:text-base tracking-tight text-[#332D2D] line-clamp-1 group-hover:text-luxury-gold transition-colors duration-300">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1">
                                            <span className="text-sm sm:text-base font-bold text-luxury-gold">₹{product.price.toLocaleString('en-IN')}</span>
                                            {product.originalPrice && (
                                                <span className="text-muted-foreground line-through text-[9px] sm:text-xs opacity-50">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                                <Heart size={32} className="text-muted-foreground/50" />
                            </div>
                            <h2 className="text-2xl font-heading mb-2">Your wishlist is empty</h2>
                            <p className="text-muted-foreground max-w-md mb-8 font-body">
                                Save items you love to your wishlist. Review them anytime and easily move them to the bag.
                            </p>
                            <Link to="/new-in" className="luxury-btn-primary px-8 py-3">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Wishlist;
