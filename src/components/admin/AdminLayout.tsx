import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { useAdminOrders } from "@/hooks/useOrders";
import { useAdminCustomers } from "@/hooks/useCustomers";
import { useAdminProducts } from "@/hooks/useProducts";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Image,
    Layers,
    Bell,
    ClipboardList,
    Instagram,
    ImagePlus,
    TrendingUp,
    Ticket,
    LineChart,
    Package
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/zerofasions.in2.png";
import NotificationPanel from "./NotificationPanel";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: LineChart, label: "Analytics", path: "/admin/analytics" },
    { icon: Image, label: "Hero Slider", path: "/admin/hero" },
    { icon: ImagePlus, label: "Banners", path: "/admin/banners" },
    { icon: ShoppingBag, label: "Products", path: "/admin/products" },
    { icon: ClipboardList, label: "Orders", path: "/admin/orders" },
    { icon: Layers, label: "Categories", path: "/admin/categories" },
    { icon: Package, label: "Combos", path: "/admin/combos" },
    { icon: Ticket, label: "Coupons", path: "/admin/coupons" },
    { icon: MessageSquare, label: "Testimonials", path: "/admin/testimonials" },
    { icon: Instagram, label: "Instagram", path: "/admin/instagram" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: TrendingUp, label: "Customer Segments", path: "/admin/customer-segments" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { signOut } = useAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const prefetchData = (path: string) => {
        const pageSize = 20;
        const page = 0;
        const searchTerm = "";

        if (path === "/admin") {
            queryClient.prefetchQuery({ queryKey: ['admin-dashboard-stats'] });
            queryClient.prefetchQuery({ queryKey: ['admin-dashboard-recent-orders'] });
        } else if (path === "/admin/orders") {
            queryClient.prefetchQuery({
                queryKey: ['admin-orders', page, pageSize, searchTerm]
            });
        } else if (path === "/admin/products") {
            queryClient.prefetchQuery({
                queryKey: ['admin-products', page, pageSize, searchTerm]
            });
        } else if (path === "/admin/customers") {
            queryClient.prefetchQuery({
                queryKey: ['admin-customers']
            });
        } else if (path === "/admin/analytics") {
            queryClient.prefetchQuery({
                queryKey: ['admin-analytics-orders', 7]
            });
        } else if (path === "/admin/categories") {
            queryClient.prefetchQuery({
                queryKey: ['categories']
            });
        }
    };

    // Global background prefetch on mount to make everything instant
    useEffect(() => {
        const timer = setTimeout(() => {
            // Priority 1: Dashboard
            prefetchData("/admin");
            // Priority 2: Tables
            prefetchData("/admin/orders");
            prefetchData("/admin/products");
            // Priority 3: Collections / Stats
            prefetchData("/admin/categories");
            prefetchData("/admin/analytics");
        }, 1500); // Slight delay to ensure main content loading takes priority

        return () => clearTimeout(timer);
    }, []);

    const handleLogout = async () => {
        await signOut();
        navigate("/admin/login");
    };

    const isActive = (path: string) => {
        if (path === "/admin" && location.pathname === "/admin") return true;
        if (path !== "/admin" && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-[#FDFBF9] flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#1A1A1A] to-[#2D2D2D] text-white transform transition-all duration-300 ease-in-out border-r border-white/5 shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="h-full flex flex-col">
                    <div className="h-24 flex flex-col justify-center px-8 border-b border-white/5">
                        <Link to="/admin" className="flex flex-col items-center gap-2 group p-4">
                            <img src={logo} alt="Zero Fashion" className="h-16 w-auto object-contain brightness-110" />
                            <span className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">Admin Portal</span>
                        </Link>
                    </div>

                    <div className="flex-1 py-8 px-4 overflow-y-auto custom-scrollbar">
                        {/* Management Section */}
                        <div className="mb-6 px-4">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Management</span>
                        </div>
                        <nav className="space-y-1.5 mb-8">
                            {navItems.slice(0, 8).map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onMouseEnter={() => prefetchData(item.path)}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${active
                                            ? "bg-luxury-gold text-white shadow-[0_4px_20px_rgba(212,175,55,0.3)] border border-white/10"
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon size={18} className={`${active ? "text-white" : "group-hover:text-luxury-gold"} transition-colors`} />
                                        <span className={`text-sm tracking-wide ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
                                        {active && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>


                        <nav className="space-y-1.5">
                            {navItems.slice(8).map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onMouseEnter={() => prefetchData(item.path)}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${active
                                            ? "bg-luxury-gold text-white shadow-[0_4px_20px_rgba(212,175,55,0.3)] border border-white/10"
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon size={18} className={`${active ? "text-white" : "group-hover:text-luxury-gold"} transition-colors`} />
                                        <span className={`text-sm tracking-wide ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
                                        {active && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="flex items-center gap-4 mb-6 px-2">
                            <div className="w-10 h-10 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold font-bold text-xs">
                                AD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">Admin Patron</p>
                                <p className="text-[10px] text-white/40 truncate">Master Curator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-widest w-full border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Header */}
                <header className="h-16 sm:h-20 bg-white/70 backdrop-blur-md border-b border-[#E8E1D9] flex items-center justify-between px-4 sm:px-8 lg:px-12 sticky top-0 z-30">
                    <button
                        className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-luxury-gold transition-colors"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={22} />
                    </button>

                    <div className="flex items-center gap-6 ml-auto font-body">
                        <NotificationPanel />
                        <div className="h-10 w-[1px] bg-[#E8E1D9]" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-[#332D2D] leading-none">Admin Patron</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Online</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold font-bold text-xs ring-2 ring-luxury-gold/20 shadow-inner">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto bg-[#FDFBF9]">
                    <div className="max-w-7xl mx-auto pb-safe">
                        <div className="fade-in">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
