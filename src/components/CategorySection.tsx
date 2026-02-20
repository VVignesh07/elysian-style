import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const CategorySection = () => {
  // Fetch categories from Supabase
  const { data: categoriesData = [], isLoading } = useCategories();

  // Filter only active categories and sort by order
  const activeCategories = categoriesData
    .filter(cat => cat.status === "Active")
    .sort((a, b) => a.display_order - b.display_order);

  // Get first 2 categories for large cards
  const featuredCategories = activeCategories.slice(0, 2);

  // Get remaining categories for small cards (max 5)
  const regularCategories = activeCategories.slice(2, 7);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        {/* Regular Categories - Small Cards */}
        {!isLoading && regularCategories.length > 0 && (
          <ScrollReveal delay={200}>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {regularCategories.map((cat) => (
                <Link
                  to={`/shop?category=${cat.slug}`}
                  key={cat.id}
                  className="category-card group h-[280px] sm:h-[220px] lg:h-[280px]"
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
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
