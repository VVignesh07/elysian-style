import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OurStory = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF9] selection:bg-luxury-gold/20">
            <Navbar />

            <main className="pt-48 pb-24 overflow-hidden">
                {/* Hero Section */}
                <section className="container mx-auto px-6 lg:px-12 mb-32">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards flex flex-col items-center">
                            <div className="mb-14 relative">
                                <img
                                    src="/favicon.png"
                                    alt="Zero Fashion Logo"
                                    className="w-48 h-48 sm:w-80 sm:h-80 object-contain filter invert opacity-90 hover:opacity-100 transition-opacity duration-500 transition-transform hover:scale-105"
                                />
                                <div className="absolute -inset-16 bg-luxury-gold/5 blur-[120px] rounded-full -z-10 animate-pulse transition-all duration-1000" />
                            </div>
                            <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.4em] mb-4 block">The Genesis</span>
                            <h1 className="text-5xl md:text-7xl font-heading font-light text-[#1A1A1A] leading-tight italic">
                                Born from a <span className="font-normal font-serif">Dream</span>, <br />
                                Built from <span className="font-normal font-serif">Zero</span>.
                            </h1>
                        </div>

                        <p className="animate-in fade-in duration-1000 delay-500 fill-mode-forwards text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                            Zero Fashion was born in 2025 from a simple but powerful dream — to build a clothing brand of our own.
                        </p>
                    </div>
                </section>

                {/* Imagery & Brothers Section */}
                <section className="mb-40 relative">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-12 gap-6 items-center">
                            <div
                                className="col-span-12 lg:col-span-7 animate-in fade-in slide-in-from-left-12 duration-1000 fill-mode-forwards"
                            >
                                <div className="aspect-[16/10] overflow-hidden rounded-3xl shadow-luxury relative group text-center flex items-center justify-center bg-coco-bean/10">
                                    <div className="p-10 lg:p-20">
                                        <h3 className="text-3xl lg:text-4xl font-heading italic text-luxury-gold mb-6 leading-relaxed">
                                            "We started from zero — but with unlimited ambition."
                                        </h3>
                                        <div className="w-12 h-[1px] bg-luxury-gold/30 mx-auto mb-6" />
                                        <p className="text-luxury-gold/60 uppercase tracking-[0.2em] text-[10px] font-bold">Arun & Vicky duo Bro's</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="col-span-12 lg:col-span-5 lg:-ml-24 z-10 animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-forwards"
                                style={{ animationDelay: '300ms' }}
                            >
                                <div className="bg-white p-10 lg:p-16 rounded-[2.5rem] shadow-2xl border border-[#E8E1D9] space-y-8">
                                    <h2 className="text-3xl font-heading text-[#1A1A1A]">Our Journey</h2>
                                    <div className="space-y-6 text-muted-foreground font-body leading-relaxed">
                                        <p>
                                            At just 23 and 18 years old, we started this journey as two brothers with passion, confidence, and a strong belief in ourselves.
                                        </p>
                                        <p>
                                            We didn’t come from a big background or a fashion legacy. We started with nothing but a shared vision and the courage to start young.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="bg-coco-bean text-white py-32 mb-40">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-5xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-20 items-center">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.4em]">The Core Philosophy</span>
                                        <h2 className="text-4xl md:text-5xl font-heading font-light leading-snug">More Than <br /> <span className="italic font-serif">Just Clothes</span></h2>
                                    </div>

                                    <div className="space-y-8 text-white/70 font-body leading-relaxed">
                                        <p>
                                            For us, Zero Fashion is not just about clothes. It’s about identity. It’s about confidence. It’s about creating something bold, different, and meaningful.
                                        </p>
                                        <p>
                                            Every design we create carries our story — the hunger to grow, and the vision to build something that stands out.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-8">
                                        <div>
                                            <div className="text-3xl font-heading text-luxury-gold mb-2">Age 23 & 18</div>
                                            <p className="text-[10px] uppercase tracking-widest text-white/50">Founded by Brothers</p>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-heading text-luxury-gold mb-2">Limitless</div>
                                            <p className="text-[10px] uppercase tracking-widest text-white/50">Our Future Vision</p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="relative animate-in fade-in zoom-in-90 duration-1000 fill-mode-forwards"
                                >
                                    <div className="aspect-[4/5] bg-white/5 border border-white/10 rounded-full flex items-center justify-center p-12 overflow-hidden">
                                        <div className="text-center flex flex-col items-center">
                                            <img
                                                src="/favicon.png"
                                                alt="Zero"
                                                className="w-24 h-24 sm:w-32 sm:h-32 object-contain filter brightness-0 invert opacity-40 mb-4 sm:mb-6"
                                            />
                                            <span className="text-4xl sm:text-6xl font-heading italic text-luxury-gold opacity-60">Limitless</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-luxury-gold/10 blur-3xl rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Quote Section */}
                <section className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center space-y-16">
                            <div className="space-y-8">
                                <h2 className="text-4xl font-heading text-[#1A1A1A]">This is just the beginning.</h2>
                                <div className="w-20 h-[2px] bg-luxury-gold mx-auto" />
                                <p className="text-2xl font-serif italic text-muted-foreground tracking-wide">
                                    "From Zero to Limitless."
                                </p>
                            </div>

                            <div className="pt-8">
                                <p className="text-[11px] font-bold text-luxury-gold uppercase tracking-[0.5em] mb-4">The Duo behind the brand</p>
                                <h4 className="text-2xl font-heading text-[#332D2D]">Arun & Vicky</h4>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default OurStory;
