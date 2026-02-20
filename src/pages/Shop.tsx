import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
    Filter,
    ChevronDown,
    X,
    SlidersHorizontal,
    ArrowUpDown,
    Heart,
    Eye,
    Star,
    Sparkles
} from "lucide-react";
import { Loader2 } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Product as DBProduct } from "@/hooks/useProducts";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

interface ShopProps {
    category?: string;
    filterType?: "new" | "sale" | "all";
}

interface FilterSidebarProps {
    category?: string;
    filterType: "new" | "sale" | "all";
    categories: any[];
    activeCategoryId: string;
    setActiveCategoryId: (id: string) => void;
    allColors: string[];
    selectedColors: string[];
    toggleColor: (color: string) => void;
    allSizes: string[];
    selectedSizes: string[];
    toggleSize: (size: string) => void;
}

const FilterSidebar = ({
    category,
    filterType,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    allColors,
    selectedColors,
    toggleColor,
    allSizes,
    selectedSizes,
    toggleSize
}: FilterSidebarProps) => (
    <div className="space-y-12">
        {/* Category Filter */}
        {!category && filterType === "all" && (
            <div className="space-y-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-foreground/80 border-b border-border/60 pb-3">Category</h3>
                <div className="flex flex-col gap-2.5 pt-2">
                    <button
                        onClick={() => setActiveCategoryId("All")}
                        className={`text-left text-xs uppercase tracking-widest transition-all ${activeCategoryId === "All" ? "font-bold text-luxury-gold translate-x-1" : "text-muted-foreground hover:text-foreground hover:translate-x-1"}`}
                    >
                        All Collections
                    </button>
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveCategoryId(c.id)}
                            className={`text-left text-xs uppercase tracking-widest transition-all ${activeCategoryId === c.id ? "font-bold text-luxury-gold translate-x-1" : "text-muted-foreground hover:text-foreground hover:translate-x-1"}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Colors */}
        {allColors.length > 0 && (
            <div className="space-y-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-foreground/80 border-b border-border/60 pb-3">Colors</h3>
                <div className="flex flex-wrap gap-2.5 pt-2">
                    {allColors.map(color => (
                        <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest border transition-all rounded-md ${selectedColors.includes(color)
                                ? "bg-luxury-gold text-white border-luxury-gold shadow-md"
                                : "bg-white text-foreground/70 border-border/80 hover:border-luxury-gold hover:bg-[#F9F7F4]"
                                }`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Sizes */}
        {allSizes.length > 0 && (
            <div className="space-y-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-foreground/80 border-b border-border/60 pb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2.5 pt-2">
                    {allSizes.map(size => (
                        <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`min-w-[45px] h-10 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider border transition-all rounded-md px-3 ${selectedSizes.includes(size)
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
);

const Shop = ({ category, filterType = "all" }: ShopProps) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const location = useLocation();

    // State for filters
    const [activeCategoryId, setActiveCategoryId] = useState<string>("All");
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
    const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = 20;

    // Search Query from URL
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("q") || undefined;

    // Fetch data from Supabase with server-side filters
    const { data: products = [], isLoading: productsLoading } = useProducts({
        status: 'Active',
        category: activeCategoryId === "All" ? undefined : (activeCategoryId === "NONE" ? "00000000-0000-0000-0000-000000000000" : activeCategoryId),
        is_new: filterType === "new" ? true : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
        search: searchQuery,
        sort: sortBy,
        offset: currentPage * productsPerPage,
        limit: productsPerPage
    });

    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    // Map prop category (name/slug) to ID if needed, or read from URL query params
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlCategory = searchParams.get("category");

        // Priority: URL query param > prop
        const categoryToUse = urlCategory || category;

        if (categoryToUse && categories.length > 0) {
            const found = categories.find(c =>
                c.name.toLowerCase() === categoryToUse.toLowerCase() ||
                c.slug.toLowerCase() === categoryToUse.toLowerCase() ||
                (categoryToUse.toLowerCase() === 'combos' && c.name.toLowerCase() === 'combo') ||
                (categoryToUse.toLowerCase() === 'combo' && c.name.toLowerCase() === 'combos')
            );
            if (found) {
                if (found.id !== activeCategoryId) {
                    setActiveCategoryId(found.id);
                }
            } else {
                // If a category was requested but not found in DB, show nothing
                if (activeCategoryId !== "NONE") {
                    setActiveCategoryId("NONE");
                }
            }
        } else if (!categoryToUse && activeCategoryId !== "All") {
            setActiveCategoryId("All");
        }

        // Reset filters only if they aren't already empty
        if (filterType === "all") {
            if (selectedColors.length > 0) setSelectedColors([]);
            if (selectedSizes.length > 0) setSelectedSizes([]);
        }
        window.scrollTo(0, 0);
    }, [category, categories, filterType, location.pathname, location.search]);


    // Derived Data: For facets, we still might want all products but let's use a fixed set for now
    const allColors = useMemo(() => ["Black", "White", "Navy", "Red", "Blue", "Green", "Beige", "Grey", "Pink", "Purple"], []);
    const allSizes = useMemo(() => ["XS", "S", "M", "L", "XL", "XXL", "3XL"], []);

    // Use products directly from hook since they are already filtered and sorted server-side
    const paginatedProducts = products;

    // For totalPages, we'd ideally need a count from the DB. 
    const totalPages = products.length < productsPerPage ? currentPage + 1 : currentPage + 2;


    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [activeCategoryId, filterType, selectedColors, selectedSizes, sortBy, searchQuery]);


    const toggleColor = (color: string) => {
        setSelectedColors(prev =>
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };

    const toggleSize = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const handleAddToCart = (e: React.MouseEvent, product: DBProduct) => {
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

        // @ts-ignore - Compatibility shim
        addToCart(cartProduct);
        toast.success(`${product.name} added to cart!`);
    };

    const toggleWishlist = (e: React.MouseEvent, product: DBProduct) => {
        e.preventDefault();
        e.stopPropagation();

        const p = {
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
            addToWishlist(p);
            toast.success(`${product.name} added to wishlist!`);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF9]">
            <SEO
                title={category || (filterType === "new" ? "New Arrivals" : (filterType === "sale" ? "Sale" : "Shop"))}
                description={category ? `Explore our ${category} collection at Zero Fashion.` : "Browse our full range of premium apparel."}
            />
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                            <nav className="flex items-center gap-2 text-[10px] font-body text-muted-foreground uppercase tracking-[0.2em] mb-3">
                                <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
                                <span>/</span>
                                <span className="text-foreground">{category || (filterType === "new" ? "New In" : (filterType === "sale" ? "Sale" : "Shop"))}</span>
                            </nav>
                            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight">
                                {category || (filterType === "new" ? "New Arrivals" : (filterType === "sale" ? "Special Offers" : "All Collections"))}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground hidden md:block uppercase tracking-widest">
                                {paginatedProducts.length} Pieces
                            </span>

                            {/* Mobile Filter Trigger */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="flex lg:hidden items-center gap-2 px-4 sm:px-6 py-2 border border-border rounded-none text-[10px] sm:text-xs uppercase tracking-widest hover:bg-muted transition-colors shadow-sm bg-white">
                                        <Filter size={12} /> Filters
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[320px] overflow-y-auto border-r-luxury-gold/20">
                                    <SheetHeader className="mb-8 mt-4 text-left">
                                        <SheetTitle className="font-heading text-2xl tracking-tighter uppercase">Filter Products</SheetTitle>
                                    </SheetHeader>
                                    <FilterSidebar
                                        category={category}
                                        filterType={filterType}
                                        categories={categories}
                                        activeCategoryId={activeCategoryId}
                                        setActiveCategoryId={setActiveCategoryId}
                                        allColors={allColors}
                                        selectedColors={selectedColors}
                                        toggleColor={toggleColor}
                                        allSizes={allSizes}
                                        selectedSizes={selectedSizes}
                                        toggleSize={toggleSize}
                                    />
                                    <SheetFooter className="mt-12">
                                        <SheetClose asChild>
                                            <button className="w-full bg-luxury-gold text-white py-4 text-xs font-bold uppercase tracking-widest shadow-xl">Apply Filters</button>
                                        </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>

                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 px-4 sm:px-6 py-2 border border-border rounded-none text-[10px] sm:text-xs uppercase tracking-widest hover:bg-muted transition-colors min-w-[140px] sm:min-w-[180px] justify-between shadow-sm bg-white">
                                        <span className="flex items-center gap-2"><ArrowUpDown size={12} /> Sort</span>
                                        <ChevronDown size={12} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px] rounded-none border-luxury-gold/10">
                                    <DropdownMenuItem className="text-xs uppercase tracking-wider py-3 cursor-pointer focus:bg-luxury-gold/5" onClick={() => setSortBy("newest")}>Newest Arrivals</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs uppercase tracking-wider py-3 cursor-pointer focus:bg-luxury-gold/5" onClick={() => setSortBy("price-asc")}>Price: Low to High</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs uppercase tracking-wider py-3 cursor-pointer focus:bg-luxury-gold/5" onClick={() => setSortBy("price-desc")}>Price: High to Low</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Separator className="mb-12 bg-luxury-gold/10" />

                    <div className="grid lg:grid-cols-4 gap-16">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-32">
                                <FilterSidebar
                                    category={category}
                                    filterType={filterType}
                                    categories={categories}
                                    activeCategoryId={activeCategoryId}
                                    setActiveCategoryId={setActiveCategoryId}
                                    allColors={allColors}
                                    selectedColors={selectedColors}
                                    toggleColor={toggleColor}
                                    allSizes={allSizes}
                                    selectedSizes={selectedSizes}
                                    toggleSize={toggleSize}
                                />
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="lg:col-span-3">
                            {productsLoading ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="space-y-4">
                                            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                                            <div className="space-y-2 flex flex-col items-center">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-6 w-2/3" />
                                                <Skeleton className="h-5 w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : paginatedProducts.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                    {paginatedProducts.map(product => (
                                        <div key={product.id} className="premium-card group h-full">
                                            <Link to={`/product/${product.id}`} className="block">
                                                <div className="image-container">
                                                    <OptimizedImage
                                                        src={product.images[0] || ''}
                                                        alt={product.name}
                                                        width={400}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />

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
                                                        <div className="action-icon">
                                                            <Eye size={16} />
                                                        </div>
                                                    </div>

                                                    {/* Add to Cart Bar */}
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        className="add-to-cart-bar translate-y-full group-hover:translate-y-0 z-10"
                                                    >
                                                        <span>Add To Cart</span>
                                                    </button>
                                                </div>

                                                <div className="p-5 flex flex-col items-center text-center gap-1">
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
                                                    <h3 className="font-heading text-sm sm:text-base tracking-tight text-[#332D2D] line-clamp-1 group-hover:text-luxury-gold transition-colors duration-300">
                                                        {product.name}
                                                    </h3>

                                                    {/* Price */}
                                                    <div className="flex items-center justify-center gap-3 mt-0.5">
                                                        {product.discount_price ? (
                                                            <>
                                                                <span className="text-base font-bold text-luxury-gold">₹{product.discount_price.toLocaleString('en-IN')}</span>
                                                                <span className="text-muted-foreground line-through text-xs opacity-50">₹{product.price.toLocaleString('en-IN')}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-base font-bold text-[#332D2D]">₹{product.price.toLocaleString('en-IN')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center border border-dashed border-luxury-gold/20 rounded-3xl bg-white/50">
                                    <SlidersHorizontal className="mx-auto text-luxury-gold/20 mb-4" size={48} />
                                    <h3 className="font-heading text-xl text-foreground mb-2">No matching pieces</h3>
                                    <p className="text-muted-foreground text-sm mb-6">Try refining your filters or search criteria.</p>
                                    <button
                                        onClick={() => {
                                            setSelectedColors([]);
                                            setSelectedSizes([]);
                                            setActiveCategoryId("All");
                                        }}
                                        className="text-luxury-gold font-bold text-[10px] uppercase tracking-widest border-b border-luxury-gold/40 hover:border-luxury-gold transition-all pb-1"
                                    >
                                        Reset all filters
                                    </button>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border/40">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                        className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Page {currentPage + 1} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Shop;
