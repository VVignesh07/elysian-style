import { Star, Quote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "./ScrollReveal";
import { useLatestReviews } from "@/hooks/useReviews";

const Testimonials = () => {
    const { data: reviews = [], isLoading } = useLatestReviews(3);

    if (isLoading) return (
        <section className="py-24 bg-[#f8f8f8]">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl bg-black/5" />)}
                </div>
            </div>
        </section>
    );

    if (reviews.length === 0) return null;

    return (
        <section className="py-24 bg-[#f8f8f8] relative overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 grid-3d-lines opacity-40 pointer-events-none" />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <ScrollReveal direction="tilt-up">
                        <span className="text-[10px] font-bold text-black/40 uppercase tracking-[.3em] mb-4 block font-body">Customer Feedback</span>
                        <h2 className="font-heading text-4xl lg:text-5xl font-light text-black mb-6" style={{ letterSpacing: '-.01em' }}>
                            Voices of Elegance
                        </h2>
                        <div className="w-12 h-px bg-black/20 mx-auto" />
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 stagger-3d">
                    {reviews.map((rev, index) => (
                        <ScrollReveal key={rev.id} delay={index * 120} direction="tilt-up">
                            <div className="testimonial-card flex flex-col h-full bg-white p-10 rounded-[2rem]">
                                <div className="mb-8 text-black/10 group-hover:text-black/30 transition-colors duration-500">
                                    <Quote size={40} strokeWidth={1} />
                                </div>

                                <div className="flex gap-1 mb-8">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < (rev.rating || 5) ? "fill-black text-black" : "text-black/10"}
                                        />
                                    ))}
                                </div>

                                <blockquote className="flex-1 mb-8">
                                    <p className="font-body text-sm text-black/60 leading-relaxed italic">
                                        "{rev.comment}"
                                    </p>
                                </blockquote>

                                <div className="flex items-center gap-4 border-t border-black/5 pt-6">
                                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold text-black border border-black/10">
                                        {rev.user_name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <cite className="not-italic text-sm font-bold text-black block mb-0.5">{rev.user_name}</cite>
                                        <span className="text-[9px] text-black/40 uppercase tracking-[.2em] font-medium font-body">Verified Customer</span>
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
