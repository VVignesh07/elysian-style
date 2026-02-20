import { useEffect, useCallback } from "react";
import { useInstagramEmbed } from "@/hooks/useInstagramEmbed";
import { Instagram } from "lucide-react";
import { StarDoodle, HeartDoodle, SparkleDoodle } from "@/components/DoodleDecorations";
import { useActiveInstagramReels } from "@/hooks/useInstagramReels";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";

const InstagramReelsSection = () => {
    const { data: reels = [], isLoading } = useActiveInstagramReels(supabase);
    const { processEmbeds } = useInstagramEmbed();

    // Embla carousel with autoplay configuration
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "start",
        skipSnaps: false,
        dragFree: true
    });

    // Auto-scroll functionality
    useEffect(() => {
        if (!emblaApi) return;

        const autoScroll = () => {
            if (!emblaApi.canScrollNext()) {
                emblaApi.scrollTo(0);
            } else {
                emblaApi.scrollNext();
            }
        };

        const intervalId = setInterval(autoScroll, 3000); // Scroll every 3 seconds

        return () => clearInterval(intervalId);
    }, [emblaApi]);

    useEffect(() => {
        processEmbeds();
    }, [reels, processEmbeds]);

    if (!isLoading && reels.length === 0) return null;

    return (
        <section className="py-24 bg-[#E8E1D9]/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A1A1A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center mb-16 text-center relative">
                    {/* Doodle Decorations */}
                    <StarDoodle className="absolute -top-8 -left-12 w-12 h-12 text-doodle-yellow opacity-60" />
                    <HeartDoodle className="absolute -top-4 -right-16 w-10 h-10 text-doodle-pink opacity-60" />
                    <SparkleDoodle className="absolute top-12 -left-20 w-8 h-8 text-doodle-purple opacity-50" />
                    <SparkleDoodle className="absolute top-16 -right-24 w-8 h-8 text-doodle-blue opacity-50" />

                    <div className="w-12 h-12 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-4 text-luxury-gold animate-pulse">
                        <Instagram size={24} />
                    </div>
                    <h2 className="font-heading text-4xl lg:text-5xl font-light text-foreground mb-4 relative">
                        Instagram <span className="italic font-normal text-luxury-gold doodle-underline">Stories</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-md mx-auto">
                        Go behind the scenes and see our latest collections in motion.
                        Follow <a href="https://instagram.com" target="_blank" className="font-bold text-luxury-gold hover:underline decoration-luxury-gold/30 underline-offset-4">@zerofashion</a>
                    </p>
                </div>

                {/* Embla Carousel */}
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-8">
                        {isLoading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="flex-[0_0_300px] aspect-[9/16] bg-muted/30 rounded-2xl animate-pulse border border-[#E8E1D9]"></div>
                            ))
                        ) : (
                            reels.map((reel) => (
                                <div
                                    key={reel.id}
                                    className="flex-[0_0_300px] aspect-[9/16] rounded-2xl overflow-hidden shadow-luxury hover:-translate-y-2 transition-transform duration-500 bg-white group"
                                >
                                    <blockquote
                                        className="instagram-media w-full h-full"
                                        data-instgrm-permalink={reel.reel_url}
                                        data-instgrm-version="14"
                                        style={{
                                            background: "#FFF",
                                            border: "0",
                                            borderRadius: "3px",
                                            boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                                            margin: "1px",
                                            maxWidth: "540px",
                                            minWidth: "326px",
                                            padding: "0",
                                            width: "calc(100% - 2px)"
                                        }}
                                    >
                                        <div style={{ padding: "16px" }}>
                                            <a href={reel.reel_url} style={{ background: "#FFFFFF", lineHeight: "0", width: "100%" }} target="_blank">
                                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                    <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", flexGrow: 0, height: "40px", marginRight: "14px", width: "40px" }}></div>
                                                    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
                                                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "4px", flexGrow: 0, height: "14px", marginBottom: "6px", width: "100px" }}></div>
                                                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "4px", flexGrow: 0, height: "14px", width: "60px" }}></div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: "19% 0" }}></div>
                                                <div style={{ display: "block", height: "50px", margin: "0 auto 12px", width: "50px" }}>
                                                    <Instagram />
                                                </div>
                                                <div style={{ paddingTop: "8px" }}>
                                                    <div style={{ color: "#3897f0", fontFamily: "Arial,sans-serif", fontSize: "14px", fontStyle: "normal", fontWeight: "550", lineHeight: "18px" }}>View this post on Instagram</div>
                                                </div>
                                                <div style={{ padding: "12.5% 0" }}></div>
                                                <div style={{ display: "flex", flexDirection: "row", marginBottom: "14px", alignItems: "center" }}>
                                                    <div>
                                                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", height: "12.5px", width: "12.5px", transform: "translateX(0px) translateY(7px)" }}></div>
                                                        <div style={{ backgroundColor: "#F4F4F4", height: "12.5px", transform: "rotate(-45deg) translateX(3px) translateY(1px)", width: "12.5px", flexGrow: 0, marginRight: "14px", marginLeft: "2px" }}></div>
                                                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", height: "12.5px", width: "12.5px", transform: "translateX(9px) translateY(-18px)" }}></div>
                                                    </div>
                                                    <div style={{ marginLeft: "8px" }}>
                                                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", flexGrow: 0, height: "20px", width: "20px" }}></div>
                                                        <div style={{ width: "0", height: "0", borderTop: "2px solid transparent", borderLeft: "6px solid #f4f4f4", borderBottom: "2px solid transparent", transform: "translateX(16px) translateY(-4px) rotate(30deg)" }}></div>
                                                    </div>
                                                    <div style={{ marginLeft: "auto" }}>
                                                        <div style={{ width: "0px", borderTop: "8px solid #F4F4F4", borderRight: "8px solid transparent", transform: "translateY(16px)" }}></div>
                                                        <div style={{ backgroundColor: "#F4F4F4", flexGrow: 0, height: "12px", width: "16px", transform: "translateY(-4px)" }}></div>
                                                        <div style={{ width: "0", height: "0", borderTop: "8px solid #F4F4F4", borderLeft: "8px solid transparent", transform: "translateY(-4px) translateX(8px)" }}></div>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                    </blockquote>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstagramReelsSection;
