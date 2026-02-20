import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-fashion.jpg";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { Skeleton } from "@/components/ui/skeleton";
import { StarDoodle, CircleDoodle, SparkleDoodle, ArrowDoodle } from "@/components/DoodleDecorations";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const HeroSection = () => {
  const { data: slides = [], isLoading } = useHeroSlides();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeSlides = slides.filter(s => s.is_active);
  const currentSlide = activeSlides[currentSlideIndex];

  // Auto-advance slides if multiple exist
  useEffect(() => {
    if (activeSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
      }, 5000); // 5 seconds per slide
      return () => clearInterval(interval);
    }
  }, [activeSlides.length]);

  // Fallback to static content if no active slides and not loading
  if (!isLoading && activeSlides.length === 0) {
    return (
      <section
        className="min-h-[80vh] lg:min-h-screen flex items-center pt-32 pb-20 lg:pt-20 relative overflow-hidden"
        style={{ backgroundColor: '#ede0d4' }}
      >
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left - Text */}
            <div className="opacity-0 animate-fade-in-left text-center lg:text-left relative" style={{ animationDelay: "0.2s" }}>
              {/* Floating Doodles */}
              <StarDoodle className="absolute -top-6 -left-8 w-10 h-10 text-doodle-yellow opacity-40" />
              <CircleDoodle className="absolute top-20 -right-12 w-16 h-16 text-doodle-purple opacity-30" />
              <SparkleDoodle className="absolute bottom-10 -left-6 w-8 h-8 text-doodle-pink opacity-50" />

              <p className="text-xs font-body text-luxury-spacing-wide text-muted-foreground mb-6">
                New Season 2026
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-light leading-[1.1] sm:leading-[0.95] text-foreground mb-6">
                Define
                <br />
                Your
                <br />
                <span className="italic font-light">Style</span>
              </h1>
              <p className="font-body text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed">
                Premium fashion for every occasion. Discover curated collections that blend timeless elegance with modern sophistication.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <a href="#trending" className="luxury-btn-primary">
                  Shop Men
                </a>
                <a href="#trending" className="luxury-btn-outline">
                  Shop Women
                </a>
              </div>
            </div>

            {/* Right - Image */}
            <div className="opacity-0 animate-fade-in-right" style={{ animationDelay: "0.5s" }}>
              <div className="relative">
                <OptimizedImage
                  src={heroImage}
                  alt="Luxury fashion editorial"
                  width={1200}
                  priority={true}
                  className="w-full h-[400px] sm:h-[500px] lg:h-[650px] object-cover rounded-lg shadow-luxury"
                />
                <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-lg shadow-elevated hidden lg:block">
                  <p className="font-heading text-2xl font-semibold text-foreground">250+</p>
                  <p className="text-xs font-body text-luxury-spacing text-muted-foreground">New Arrivals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-[80vh] lg:min-h-screen flex items-center pt-32 lg:pt-20 relative bg-[#ede0d4]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Skeleton className="h-4 w-1/4" />
              <div className="space-y-4">
                <Skeleton className="h-20 w-3/4" />
                <Skeleton className="h-20 w-2/3" />
              </div>
              <Skeleton className="h-10 w-1/3" />
              <div className="flex gap-4">
                <Skeleton className="h-14 w-40" />
                <Skeleton className="h-14 w-40" />
              </div>
            </div>
            <Skeleton className="h-[650px] w-full rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  // Dynamic Content
  return (
    <section
      className="min-h-[80vh] lg:min-h-screen flex items-center pt-32 pb-20 lg:pt-20 relative overflow-hidden transition-all duration-1000"
      style={{ backgroundColor: '#ede0d4' }}
    >
      {/* Dynamic Background for Full Layout */}
      {currentSlide.layout_type === 'full' && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <OptimizedImage
            src={currentSlide.image_url}
            alt=""
            width={1920}
            priority={true}
            className="w-full h-full object-cover animate-fade-in"
          />
        </div>
      )}

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div key={currentSlide.id} className={`${currentSlide.layout_type === 'full' ? 'flex flex-col items-start text-left' : 'grid lg:grid-cols-2 gap-12 lg:gap-8 items-center'}`}>
          {/* Left - Text */}
          <div className={`animate-fade-in-left ${currentSlide.layout_type === 'full' ? 'max-w-3xl' : 'text-center lg:text-left'}`}>
            <p className={`text-xs font-body text-luxury-spacing-wide mb-6 ${currentSlide.layout_type === 'full' ? 'text-white/80' : 'text-muted-foreground'}`}>
              Exclusive Collection
            </p>
            <div className={`font-heading text-3xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-[1.1] sm:leading-[0.95] mb-6 whitespace-pre-line ${currentSlide.layout_type === 'full' ? 'text-white' : 'text-foreground'}`}>
              {currentSlide.title}
            </div>
            {currentSlide.subtitle && (
              <p className={`font-body text-sm sm:text-base lg:text-lg max-w-md mb-8 lg:mb-10 leading-relaxed ${currentSlide.layout_type === 'full' ? 'text-white/70' : 'text-muted-foreground'} ${currentSlide.layout_type === 'full' ? 'lg:mx-0' : 'mx-auto lg:mx-0'}`}>
                {currentSlide.subtitle}
              </p>
            )}
            <div className={`flex flex-wrap gap-4 ${currentSlide.layout_type === 'full' ? 'justify-start' : 'justify-center lg:justify-start'}`}>
              {currentSlide.cta_text && (
                <a href={currentSlide.cta_link || "#"} className={currentSlide.layout_type === 'full' ? "luxury-btn bg-white text-black hover:bg-white/90" : "luxury-btn-primary"}>
                  {currentSlide.cta_text}
                </a>
              )}
            </div>
          </div>

          {/* Right - Image (Only if Split) */}
          {currentSlide.layout_type === 'split' && (
            <div className="animate-fade-in-right">
              <div className="relative">
                <OptimizedImage
                  src={currentSlide.image_url}
                  alt={currentSlide.title || "Hero Banner"}
                  width={1200}
                  priority={true}
                  className="w-full h-[400px] sm:h-[500px] lg:h-[650px] object-cover rounded-lg shadow-luxury transition-all duration-700"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex
                ? "bg-luxury-gold w-6"
                : (currentSlide.layout_type === 'full' ? "bg-white/40 hover:bg-white/60" : "bg-black/20 hover:bg-black/40")
                }`}
              onClick={() => setCurrentSlideIndex(idx)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
