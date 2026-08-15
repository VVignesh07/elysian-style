import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";

const TrendingProducts = () => {
  const { data: products = [], isLoading } = useProducts({
    is_featured: true,
    status: 'Active',
    limit: 10
  });

  return (
    <section id="trending" className="py-24 lg:py-32 bg-white scroll-mt-20 relative overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 grid-3d-lines opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <ScrollReveal direction="tilt-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-body text-black/40 uppercase tracking-[.4em] font-bold mb-4 block">
                Curated Collection
              </span>
              <h2 className="font-heading text-4xl lg:text-5xl font-light text-black flex items-center gap-3" style={{ letterSpacing: '-.01em' }}>
                Trending Now
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[10px] font-bold text-black uppercase tracking-[.25em] border-b border-black/20 hover:border-black pb-1.5 transition-all self-start md:self-auto"
            >
              Explore Collection →
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-black/5" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-1/4 bg-black/5" />
                  <Skeleton className="h-5 w-3/4 bg-black/5" />
                  <Skeleton className="h-4 w-1/2 bg-black/5" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center border border-black/5 rounded-3xl bg-black/[0.02] backdrop-blur-sm">
            <p className="text-black/40 italic font-body text-sm">Our seasonal collections are being refreshed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
            {products.slice(0, 10).map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 80} direction="tilt-up">
                <div
                  style={{
                    animation: `card-float-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s both`,
                  }}
                >
                  <ProductCard product={product} />
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
