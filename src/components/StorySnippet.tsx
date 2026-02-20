import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const StorySnippet = () => {
    return (
        <section className="py-24 bg-[#FDFBF9] overflow-hidden border-y border-[#E8E1D9]/50">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left side: Visual/Quote */}
                        <div className="relative group">
                            <div className="aspect-[4/5] bg-coco-bean rounded-[3rem] overflow-hidden shadow-luxury relative flex items-center justify-center p-12">
                                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                                <div className="relative z-10 text-center space-y-6">
                                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.5em] block animate-in fade-in slide-in-from-bottom-4 duration-700">The Duo Bro's</span>
                                    <p className="text-3xl font-heading italic text-white leading-tight">
                                        "From Zero to <br /> <span className="text-luxury-gold not-italic font-serif">Limitless</span>."
                                    </p>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-6 -left-6 w-24 h-24 border border-luxury-gold/20 rounded-full animate-pulse" />
                            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-luxury-gold/5 blur-3xl rounded-full" />
                        </div>

                        {/* Right side: Content */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-1000">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-heading font-light text-[#1A1A1A] leading-tight">
                                    Our <span className="italic font-serif">Story</span>
                                </h2>
                                <div className="w-12 h-[1px] bg-luxury-gold" />
                            </div>

                            <div className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed">
                                <p>
                                    Founded in 2025 by two brothers, Arun and Vicky (ages 23 & 18), Zero Fashion was born from a simple but powerful dream to build something bold and different.
                                </p>
                                <p>
                                    We started from zero — with no legacy, just unlimited ambition and a belief that style is the ultimate form of self-expression.
                                </p>
                            </div>

                            <Link
                                to="/our-story"
                                className="inline-flex items-center gap-4 group text-xs font-bold uppercase tracking-[0.3em] text-[#1A1A1A] hover:text-luxury-gold transition-colors duration-300"
                            >
                                Discover our journey
                                <div className="w-8 h-8 rounded-full border border-[#E8E1D9] flex items-center justify-center group-hover:border-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-all duration-300">
                                    <ArrowRight size={14} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StorySnippet;
