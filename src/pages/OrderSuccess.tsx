import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Sparkles } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, total } = location.state || { orderId: "ORD-000000", total: 0 };

    useEffect(() => {
        if (!location.state) {
            navigate("/");
            return;
        }

        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 35, spread: 360, ticks: 100, zIndex: 50 };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 40 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#D4AF37', '#B8860B', '#1A1A1A']
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#D4AF37', '#B8860B', '#1A1A1A']
            });
        }, 300);

        // Auto-redirect to orders page after 6 seconds
        const redirectTimer = setTimeout(() => {
            navigate("/orders");
        }, 6000);

        return () => {
            clearInterval(interval);
            clearTimeout(redirectTimer);
        };
    }, [location.state, navigate]);

    return (
        <div className="min-h-screen bg-[#FDFBF9] flex flex-col font-body relative overflow-hidden">
            <Navbar />

            {/* Ambient Luxury Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-luxury-gold/5 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-[10%] -left-[10%] w-[35%] h-[35%] bg-primary/5 blur-[120px] rounded-full"></div>
            </div>

            <main className="flex-1 flex items-center justify-center pt-32 pb-24 relative z-10 px-6">
                <div className="max-w-xl w-full mx-auto text-center space-y-12 animate-fade-in">

                    {/* Success Icon Visualization */}
                    <div className="relative inline-block">
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl border border-[#E8E1D9] relative z-10 group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-luxury-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <CheckCircle2 size={56} className="text-luxury-gold relative z-10 transform scale-100 group-hover:scale-110 transition-transform duration-700" strokeWidth={1.5} />
                        </div>
                        {/* Orbiting Elements */}
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FAF7F5] rounded-full flex items-center justify-center shadow-lg border border-[#E8E1D9] animate-bounce-slow">
                            <Sparkles size={20} className="text-luxury-gold/40" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-luxury-gold/10 text-luxury-gold rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-luxury-gold/20 mb-2">
                            Order Registered
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-heading font-semibold text-[#1A1A1A] tracking-tighter leading-tight">
                            A Masterpiece <br />
                            <span className="text-luxury-gold italic">Awaits You</span>
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto font-body italic">
                            Your selection has been registered in our archives. Our team is now orchestrating its journey to you.
                        </p>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white rounded-[2.5rem] border border-[#E8E1D9] p-10 shadow-luxury relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <ShoppingBag size={120} className="text-[#1A1A1A]" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center pb-6 border-b border-[#E8E1D9]">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                                    <p className="text-sm font-mono font-bold text-[#1A1A1A]">#{orderId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest flex items-center gap-2 justify-end">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        Status Updated
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Valuation</p>
                                    <p className="text-3xl font-heading font-bold text-luxury-gold">₹{total?.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-dashed border-[#E8E1D9] flex items-center justify-center text-muted-foreground/30">
                                    <Package size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Matrix */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                        <Link to="/" className="luxury-btn-primary px-12 py-5 inline-flex items-center justify-center gap-3 text-xs tracking-[0.2em] font-black uppercase group shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all">
                            Explore Collections
                            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                        <Link to="/orders" className="bg-white border border-[#E8E1D9] text-[#1A1A1A] px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FAF7F5] transition-all flex items-center justify-center gap-3 group">
                            <Truck size={16} className="text-luxury-gold" />
                            Logistics Status
                        </Link>
                    </div>

                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-40">
                        A detailed summary has been dispatched to your email address.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderSuccess;
