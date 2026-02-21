import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const CategorySection = () => {
  // Fetch categories from Supabase
  const { data: categoriesData = [], isLoading } = useCategories();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Scroll amount per click
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [categoriesData]);


  // Filter only active categories and sort by order
  const activeCategories = categoriesData
    .filter(cat => cat.status === "Active")
    .sort((a, b) => a.display_order - b.display_order);

  const isFeatured = (name: string) => {
    const n = name.toUpperCase();
    return n === 'MEN' || n === 'WOMEN';
  };

  // Get "Men" and "Women" categories for large cards
  let featuredCategories = activeCategories.filter(cat => isFeatured(cat.name));
  let regularCategories = activeCategories.filter(cat => !isFeatured(cat.name));

  // Fallback if Men/Women are not explicitly found
  if (featuredCategories.length === 0) {
    featuredCategories = activeCategories.slice(0, 2);
    regularCategories = activeCategories.slice(2, 7);
  } else {
    // Show all remaining regular categories (or you can slice it if you want a limit)
    // Here we let it be the full list so scrolling arrows are more useful if there are many.
  }

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-xs font-body text-luxury-spacing-wide text-muted-foreground mb-3">
              Explore
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-light text-foreground">
              Shop by Category
            </h2>
          </div>
        </ScrollReveal>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-3xl" />)}
          </div>
        )}

        {/* Featured Categories - Large Cards */}
        {!isLoading && featuredCategories.length > 0 && (
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {featuredCategories.map((cat) => (
                <Link
                  to={`/shop?category=${cat.slug}`}
                  key={cat.id}
                  className="category-card group h-[450px] sm:h-[400px] lg:h-[500px]"
                  onClick={() => toast.info(`Viewing ${cat.name} collection`)}
                >
                  <OptimizedImage
                    src={cat.image_url || ''}
                    alt={cat.name}
                    width={800}
                    className="w-full h-full object-cover group-hover:scale-110"
                    enableZoom={true}
                  />
                  <div className="overlay group-hover:opacity-80" />
                  <div className="label group-hover:-translate-y-2">
                    <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-light mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-body text-luxury-spacing text-primary-foreground/80">
                      {cat.description || 'Explore Collection'} →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Regular Categories - Small Cards (Scrollable if many) */}
        {!isLoading && regularCategories.length > 0 && (
          <ScrollReveal delay={200}>
            <div className="relative group/slider">
              {showLeftArrow && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border p-2 rounded-full shadow-lg text-foreground hover:bg-background hover:scale-110 transition-all opacity-0 group-hover/slider:opacity-100 hidden sm:flex items-center justify-center"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent scroll-smooth"
              >
                {regularCategories.map((cat) => (
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    key={cat.id}
                    className="category-card group h-[280px] sm:h-[220px] lg:h-[280px] w-[200px] sm:w-[250px] lg:w-[280px] flex-shrink-0 snap-start"
                    onClick={() => toast.info(`Viewing ${cat.name} collection`)}
                  >
                    <OptimizedImage
                      src={cat.image_url || ''}
                      alt={cat.name}
                      width={400}
                      className="w-full h-full object-cover group-hover:scale-110"
                      enableZoom={true}
                    />
                    <div className="overlay group-hover:opacity-80" />
                    <div className="label p-4 group-hover:-translate-y-2">
                      <h3 className="font-heading text-base sm:text-lg lg:text-xl font-light">
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>

              {showRightArrow && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border p-2 rounded-full shadow-lg text-foreground hover:bg-background hover:scale-110 transition-all opacity-0 group-hover/slider:opacity-100 hidden sm:flex items-center justify-center"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
