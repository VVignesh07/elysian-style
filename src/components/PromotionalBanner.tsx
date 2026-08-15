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
                    <div className="max-w-2xl text-white space-y-6 relative z-10">
                        {/* Doodle Decorations */}
                        <StarDoodle className="absolute -top-16 -left-12 w-16 h-16 text-white/20 opacity-40 animate-pulse" />
                        <SparkleDoodle className="absolute -top-4 -right-16 w-12 h-12 text-white/20 opacity-30 animate-pulse" />

                        <ScrollReveal direction="left">
                            {banner.subtitle && (
                                <div className="flex items-center gap-4 mb-5">
                                    <span className="w-12 h-[1px] bg-white/40"></span>
                                    <p className="text-xs md:text-sm font-body uppercase tracking-[0.3em] text-white/80 font-medium">
                                        {banner.subtitle}
                                    </p>
                                </div>
                            )}

                            <h2 className="font-body text-4xl md:text-5xl lg:text-7xl font-light tracking-wide text-white drop-shadow-xl mb-6 leading-tight">
                                {banner.title}
                            </h2>

                            {banner.description && (
                                <p className="font-body text-base md:text-lg text-white/80 max-w-lg leading-relaxed mb-10 font-light">
                                    {banner.description}
                                </p>
                            )}

                            {banner.button_text && banner.button_link && (
                                <div className="pt-2">
                                    <Link
                                        to={banner.button_link}
                                        className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-black px-10 py-4 rounded-none text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-500 group overflow-hidden relative"
                                    >
                                        <span className="relative z-10">{banner.button_text}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500 relative z-10" />
                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer-sweep_1.5s_infinite]" />
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
