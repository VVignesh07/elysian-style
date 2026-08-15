import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, RefreshCw, Loader2 } from "lucide-react";
import { useMouseTilt } from "@/hooks/useMouseTilt";
import heroImage from "@/assets/hero-fashion.jpg";
import logo from "@/assets/zerofasions.in2.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const { signInWithOtp, verifyOtp, signInWithGoogle, isLoading, user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const location = useLocation();

    // Premium 3D tilt refs
    const formTiltRef = useMouseTilt<HTMLDivElement>({ maxTilt: 8, scale: 1.02, glare: true, glareOpacity: 0.1 });
    const bannerTiltRef = useMouseTilt<HTMLDivElement>({ maxTilt: 3, scale: 1.05, glare: false });

    // Handle redirection after login
    useEffect(() => {
        if (!isLoading && user) {
            if (isAdmin) {
                navigate("/admin", { replace: true });
            } else {
                const destination = location.state?.from?.pathname || "/profile";
                navigate(destination, { replace: true });
            }
        }
    }, [user, isAdmin, isLoading, navigate, location.state]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { error } = await signInWithOtp(email);
        if (!error) setShowOtpInput(true);
        setIsSubmitting(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await verifyOtp(email, otp);
        setIsSubmitting(false);
    };

    const handleGoogleLogin = async () => {
        await signInWithGoogle();
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <Navbar />

            {/* Left Side - Luxury Banner */}
            <div className="hidden lg:block relative h-full bg-muted overflow-hidden perspective-[1000px] p-8">
                <div ref={bannerTiltRef} className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                    <img
                        src={heroImage}
                        alt="Fashion Model"
                        className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-6">
                            <img
                                src={logo}
                                alt="Zero Fashion"
                                className="h-24 lg:h-32 w-auto object-contain brightness-0 invert mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-700 hover:scale-110"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex items-center justify-center p-8 bg-[#FDFBF7] relative overflow-hidden perspective-[1200px]">
                {/* Decorative background blur */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-luxury-gold/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#E8E1D9]/50 blur-[100px] pointer-events-none" />

                <div 
                    ref={formTiltRef}
                    className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-xl p-10 sm:p-12 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 relative z-10"
                >
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl font-heading font-normal tracking-tight text-[#332D2D]">Welcome Back</h2>
                        <p className="text-muted-foreground font-body text-sm tracking-wide">Access your Zero Fashion account</p>
                    </div>

                    <div className="space-y-6">
                        {!showOtpInput ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@zerofashions.in"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="font-body border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all"
                                    />
                                </div>
                                <Button type="submit" className="w-full luxury-btn-primary h-12 mt-4" disabled={isSubmitting || isLoading}>
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send Magic Link"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp-code" className="text-xs uppercase tracking-widest text-muted-foreground">Enter Code</Label>
                                    <Input
                                        id="otp-code"
                                        placeholder="123456"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="font-body border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button type="submit" className="w-full luxury-btn-primary h-12 mt-4" disabled={isSubmitting || isLoading}>
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Verify Code"}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setShowOtpInput(false)}
                                        className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors text-center"
                                    >
                                        Change Email
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            className="w-full h-12 border-border hover:bg-muted/50 rounded-none font-body transition-all flex items-center justify-center gap-3"
                            onClick={handleGoogleLogin}
                            disabled={isSubmitting || isLoading}
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>
                    </div>

                    <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground font-body">
                        No account?{" "}
                        <Link to="/register" className="text-primary hover:opacity-70 transition-opacity">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
