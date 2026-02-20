import { Star, Quote, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "./ScrollReveal";
import { useLatestReviews } from "@/hooks/useReviews";

const Testimonials = () => {
    const { data: reviews = [], isLoading } = useLatestReviews(3);

    // If loading, show a subtle loader or nothing to prevent layout shift
    if (isLoading) return (
        <section className="py-24 bg-[#EAE0D5]">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
                </div>
            </div>
        </section>
    );

    // If no reviews yet, we can either hide the section or show a "Be the first" message
    // Given the user request, we'll only show if reviews exist
    if (reviews.length === 0) return null;

    return (
        <section className="py-24 bg-[#EAE0D5]">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <ScrollReveal>
                        <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-4 block">Customer Feedback</span>
                        <h2 className="font-heading text-3xl md:text-4xl font-light text-[#332D2D] mb-6">Voices of Elegance</h2>
                        <div className="w-12 h-[1px] bg-luxury-gold/40 mx-auto" />
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {reviews.map((rev, index) => (
                        <ScrollReveal key={rev.id} delay={index * 100}>
                            <div className="flex flex-col h-full bg-white p-10 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-500 group">
                                <div className="mb-6 text-luxury-gold/20 group-hover:text-luxury-gold/40 transition-colors">
                                    <Quote size={32} />
                                </div>

                                <div className="flex gap-0.5 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < (rev.rating || 5) ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/20"}
                                        />
                                    ))}
                                </div>

                                <blockquote className="flex-1 mb-8">
                                    <p className="font-body text-sm text-muted-foreground leading-relaxed italic">
                                        "{rev.comment}"
                                    </p>
                                </blockquote>

                                <div className="flex items-center gap-4 border-t border-border/40 pt-6">
                                    <div className="w-10 h-10 rounded-full bg-luxury-gold/5 flex items-center justify-center text-[10px] font-bold text-luxury-gold border border-luxury-gold/10">
                                        {rev.user_name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <cite className="not-italic text-sm font-bold text-[#332D2D] block mb-0.5">{rev.user_name}</cite>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Verified Customer</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
