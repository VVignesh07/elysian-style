import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useCallback } from "react";

const CategorySection = () => {
  const { data: categoriesData = [], isLoading } = useCategories();
  
  const activeCategories = categoriesData
    .filter(c => c.status === 'Active')
    .sort((a, b) => a.display_order - b.display_order);

  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % activeCategories.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + activeCategories.length) % activeCategories.length);
  };

  const handleCardClick = (e: React.MouseEvent, index: number, catName: string) => {
    if (index !== activeIndex) {
      e.preventDefault();
      setActiveIndex(index);
    } else {
      toast.info(`Viewing ${catName}`);
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-[#f5f5f5] overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">

        {/* Section heading */}
        <ScrollReveal direction="tilt-up">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[.35em] uppercase text-black/40 mb-4 block font-body">Collections</span>
            <h2 className="font-heading text-4xl lg:text-6xl font-light text-black uppercase" style={{ letterSpacing: '0.02em' }}>
              Shop by Category
            </h2>
            <div className="w-16 h-px bg-black/20 mx-auto mt-5" />
          </div>
        </ScrollReveal>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center h-[500px]">
            <Skeleton className="w-[80%] max-w-[600px] h-full rounded-3xl bg-black/5" />
          </div>
        )}

        {/* 3D Coverflow Carousel */}
        {!isLoading && activeCategories.length > 0 && (
          <ScrollReveal delay={120} direction="tilt-up">
            <div className="relative w-full h-[500px] sm:h-[600px] flex items-center justify-center perspective-[1200px]">
              
              {/* Cards */}
              <div className="relative w-full max-w-[500px] h-full" style={{ transformStyle: 'preserve-3d' }}>
                {activeCategories.map((cat, index) => {
                  const isActive = index === activeIndex;
                  const isPrev = index === (activeIndex - 1 + activeCategories.length) % activeCategories.length;
                  const isNext = index === (activeIndex + 1) % activeCategories.length;
                  
                  let transform = 'translateX(0) scale(0) rotateY(0) translateZ(-400px)';
                  let zIndex = 0;
                  let opacity = 0;
                  let filter = 'blur(10px) grayscale(50%)';

                  if (isActive) {
                    transform = 'translateX(0) scale(1) rotateY(0) translateZ(0)';
                    zIndex = 10;
                    opacity = 1;
                    filter = 'blur(0px) grayscale(0%)';
                  } else if (isPrev) {
                    transform = 'translateX(-60%) scale(0.8) rotateY(25deg) translateZ(-150px)';
                    zIndex = 5;
                    opacity = 0.8;
                    filter = 'blur(2px) grayscale(30%)';
                  } else if (isNext) {
                    transform = 'translateX(60%) scale(0.8) rotateY(-25deg) translateZ(-150px)';
                    zIndex = 5;
                    opacity = 0.8;
                    filter = 'blur(2px) grayscale(30%)';
                  } else {
                    // Items further away
                    const dist = index < activeIndex ? activeIndex - index : index - activeIndex;
                    const dir = index < activeIndex ? -1 : 1;
                    // Handle wrap-around math roughly
                    const isFarPrev = index === (activeIndex - 2 + activeCategories.length) % activeCategories.length;
                    const isFarNext = index === (activeIndex + 2) % activeCategories.length;
                    
                    if (isFarPrev) {
                       transform = 'translateX(-100%) scale(0.6) rotateY(35deg) translateZ(-300px)';
                       opacity = 0.3;
                       filter = 'blur(5px) grayscale(60%)';
                    } else if (isFarNext) {
                       transform = 'translateX(100%) scale(0.6) rotateY(-35deg) translateZ(-300px)';
                       opacity = 0.3;
                       filter = 'blur(5px) grayscale(60%)';
                    }
                  }

                  return (
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      key={cat.id}
                      className="absolute inset-0 block rounded-3xl overflow-hidden cursor-pointer"
                      onClick={(e) => handleCardClick(e, index, cat.name)}
                      style={{
                        transform,
                        zIndex,
                        opacity,
                        filter,
                        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.8s ease',
                        transformStyle: 'preserve-3d',
                        boxShadow: isActive ? '0 30px 60px rgba(0,0,0,0.25)' : '0 10px 30px rgba(0,0,0,0.1)'
                      }}
                    >
                      {cat.image_url
                        ? <OptimizedImage src={cat.image_url} alt={cat.name} width={600} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-black/80" />
                      }
                      
                      {/* Overlay */}
                      <div 
                        className="absolute inset-0 transition-opacity duration-800"
                        style={{ 
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                          opacity: isActive ? 0.9 : 0.6 
                        }} 
                      />
                      
                      {/* Label */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 p-8 text-center text-white transition-all duration-800"
                        style={{
                          transform: isActive ? 'translateY(0) translateZ(30px)' : 'translateY(20px) translateZ(0)',
                          opacity: isActive ? 1 : 0.4
                        }}
                      >
                        <h3 className="font-heading text-4xl lg:text-5xl font-light mb-3 tracking-wide uppercase">{cat.name}</h3>
                        <div 
                          className="flex items-center justify-center gap-3 text-white/80 text-sm uppercase tracking-[0.2em] font-body transition-opacity duration-800"
                          style={{ opacity: isActive ? 1 : 0 }}
                        >
                          {cat.description || 'Explore Collection'}
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 lg:left-[10%] top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full border-2 border-black/80 bg-white text-black shadow-xl hover:bg-black hover:text-white hover:scale-110 transition-all duration-300"
                aria-label="Previous category"
              >
                <ArrowLeft size={24} strokeWidth={2} />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 lg:right-[10%] top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full border-2 border-black/80 bg-white text-black shadow-xl hover:bg-black hover:text-white hover:scale-110 transition-all duration-300"
                aria-label="Next category"
              >
                <ArrowRight size={24} strokeWidth={2} />
              </button>

            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
