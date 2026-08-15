import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Lazy load non-critical sections below the fold
const CategorySection = React.lazy(() => import("@/components/CategorySection"));
const StorySnippet = React.lazy(() => import("@/components/StorySnippet"));
const TrendingProducts = React.lazy(() => import("@/components/TrendingProducts"));
const Testimonials = React.lazy(() => import("@/components/Testimonials"));
const FeatureHighlights = React.lazy(() => import("@/components/FeatureHighlights"));
const InstagramReelsSection = React.lazy(() => import("@/components/InstagramReelsSection"));
const PromotionalBanner = React.lazy(() => import("@/components/PromotionalBanner"));
const Newsletter = React.lazy(() => import("@/components/Newsletter"));

const SectionLoader = () => (
  <div className="container mx-auto px-6 py-12">
    <Skeleton className="h-48 w-full rounded-2xl" />
  </div>
);



const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Home"
        description="Discover Zero Fashion's premium collection of timeless apparel. Elevate your style with our curated men's and women's fashion."
      />
      <Navbar />
      <HeroSection />

      <Suspense fallback={<SectionLoader />}>
        <FeatureHighlights />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <CategorySection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TrendingProducts />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <PromotionalBanner position="mid-page" />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <InstagramReelsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Newsletter />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <StorySnippet />
      </Suspense>

      <Footer />
    </main>
  );
};

export default Index;

