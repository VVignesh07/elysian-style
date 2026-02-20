import { useActiveBanners } from "@/hooks/useBanners";
import { supabase } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StarDoodle, SparkleDoodle } from "@/components/DoodleDecorations";
import ScrollReveal from "@/components/ScrollReveal";
import autumnBanner from "@/assets/autumn-banner.jpg";

interface PromotionalBannerProps {
    position?: 'hero' | 'mid-page' | 'footer';
}

const DEFAULT_BANNER = {
    title: "Autumn Collection",
    subtitle: "Limited Time",
    description: "Up to 30% OFF on selected styles",
    image_url: autumnBanner,
    button_text: "Shop Collection",
    button_link: "/collections"
};

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ position = 'hero' }) => {
    const { data: dbBanners = [], isLoading, error } = useActiveBanners(supabase, position);

    if (error) {
        console.error("Banner fetch error:", error);
    }

    if (isLoading) return <div className="h-[400px] bg-muted animate-pulse" />;

    // Use DB banner if exists, otherwise fallback to default for mid-page
    const banner = dbBanners.length > 0 ? dbBanners[0] : (position === 'mid-page' ? DEFAULT_BANNER : null);

    if (!banner) return null;

    return (
        <section className="relative w-full overflow-hidden bg-primary/5">
            {/* Banner Image */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-zinc-900">
                <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    onError={(e) => {
                        // If DB image fails, try fallback to local autumn banner
                        (e.target as HTMLImageElement).src = autumnBanner;
                    }}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

                {/* Content */}
                <div className="relative h-full container mx-auto px-6 lg:px-12 flex items-center">
                    <div className="max-w-2xl text-white space-y-6 relative">
                        {/* Doodle Decorations */}
                        <StarDoodle className="absolute -top-16 -left-12 w-16 h-16 text-luxury-gold opacity-40 animate-pulse" />
                        <SparkleDoodle className="absolute -top-4 -right-16 w-12 h-12 text-luxury-gold opacity-30 animate-pulse" />

                        <ScrollReveal direction="left">
                            {banner.subtitle && (
                                <p className="text-xs md:text-sm font-body text-luxury-spacing-wide uppercase tracking-wider text-luxury-gold mb-4">
                                    {banner.subtitle}
                                </p>
                            )}

                            <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-4">
                                {banner.title}
                            </h2>

                            {banner.description && (
                                <p className="font-body text-base md:text-lg text-white/90 max-w-lg leading-relaxed mb-8">
                                    {banner.description}
                                </p>
                            )}

                            {banner.button_text && banner.button_link && (
                                <div className="pt-4">
                                    <Link
                                        to={banner.button_link}
                                        className="inline-flex items-center gap-2 bg-white text-black hover:bg-luxury-gold hover:text-white px-8 py-4 rounded-none text-sm uppercase tracking-[0.2em] transition-all duration-300 group"
                                    >
                                        {banner.button_text}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromotionalBanner;
