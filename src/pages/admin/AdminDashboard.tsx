import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { format } from "date-fns";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

interface Order {
    id: string;
    order_number: string | null;
    customer_name: string;
    created_at: string;
    total_amount: number;
    status: string;
}

import React, { useMemo } from "react";

const AdminDashboard = () => {
    // Fetch counts and revenue aggregate via optimized RPC
    const { data: dashboardStats, isLoading: loadingStats } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const { data, error } = await supabaseAdmin.rpc('get_admin_dashboard_stats');
            if (error) throw error;
            return data as {
                productsCount: number;
                categoriesCount: number;
                ordersCount: number;
                totalRevenue: number;
            };
        },
        staleTime: 1000 * 60 * 5 // 5 minute stale time
    });

    const { data: recentOrders = [], isLoading: loadingOrders, error: ordersError } = useQuery({
        queryKey: ['admin-dashboard-recent-orders'],
        queryFn: async () => {
            const { data, error } = await supabaseAdmin
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return data as Order[];
        }
    });

    const stats = useMemo(() => [
        {
            title: "Inventory Value",
            value: loadingStats ? "..." : (dashboardStats?.productsCount || 0).toString(),
            label: "Total Products",
            icon: Package,
            trend: "+3.2%",
            isPositive: true,
            color: "text-blue-600",
            sparkline: "M0 20 L10 15 L20 18 L30 10 L40 12 L50 5 L60 8",
            loading: loadingStats
        },
        {
            title: "Curated Lines",
            value: loadingStats ? "..." : (dashboardStats?.categoriesCount || 0).toString(),
            label: "Collections",
            icon: Layers,
            trend: "+1.5%",
            isPositive: true,
            color: "text-purple-600",
            sparkline: "M0 15 L10 18 L20 12 L30 15 L40 8 L50 10 L60 12",
            loading: loadingStats
        },
        {
            title: "Gross Revenue",
            value: loadingStats ? "..." : `₹${(dashboardStats?.totalRevenue || 0).toLocaleString('en-IN')}`,
            label: "Total Sales",
            icon: DollarSign,
            trend: "+12.4%",
            isPositive: true,
            color: "text-green-600",
            sparkline: "M0 20 L10 18 L20 15 L30 12 L40 10 L50 8 L60 5",
            loading: loadingStats
        },
        {
            title: "Engagement",
            value: loadingStats ? "..." : (dashboardStats?.ordersCount || 0).toString(),
            label: "Customer Orders",
            icon: ShoppingBag,
            trend: "+8.1%",
            isPositive: true,
            color: "text-luxury-gold",
            sparkline: "M0 20 L10 15 L20 10 L30 12 L40 8 L50 5 L60 7",
            loading: loadingStats
        },
    ], [dashboardStats, loadingStats]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-green-50 text-green-700 border-green-100";
            case "Processing": return "bg-blue-50 text-blue-700 border-blue-100";
            case "Shipped": return "bg-purple-50 text-purple-700 border-purple-100";
            case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-yellow-50 text-yellow-700 border-yellow-100";
        }
    };

    return (
        <AdminLayout>
            <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-luxury-gold"></span>
                            </span>
                            <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em]">Live Insights</span>
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-[#332D2D] mb-2 tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground font-body text-sm italic">Curating excellence through real-time performance analytics.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Last Synchronized</p>
                        <p className="text-sm font-heading font-medium text-[#332D2D]">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </div>

            {/* Advanced Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-[#E8E1D9] shadow-sm hover:shadow-luxury transition-all duration-500 group bg-white/80 backdrop-blur-md overflow-hidden relative border-t-2 border-t-transparent hover:border-t-luxury-gold">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon size={64} />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold font-body text-muted-foreground uppercase tracking-[0.2em]">
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold font-heading text-[#332D2D] mb-1">
                                        {stat.loading ? (
                                            <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
                                        ) : (
                                            stat.value
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        {stat.label}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <svg className="w-16 h-8 overflow-visible mb-2" viewBox="0 0 60 25">
                                        <path
                                            d={stat.sparkline}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={stat.isPositive ? "text-green-500" : "text-red-500"}
                                        />
                                    </svg>
                                    <div className={`text-[10px] font-bold ${stat.isPositive ? "text-green-600" : "text-red-600"} flex items-center justify-end gap-1`}>
                                        <TrendingUp size={10} />
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <div className={`h-1 w-full mt-2 ${stat.color.replace('text', 'bg')} opacity-20`} />
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Orders Section */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-xl font-bold text-[#332D2D]">Recent Orders</h2>
                        <Link to="/admin/orders">
                            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:text-[#332D2D]">
                                View Orders <TrendingUp size={12} className="ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {loadingOrders ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-muted/20 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : ordersError ? (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center">
                            <p className="text-red-800 font-bold mb-2">Access Restriced</p>
                            <p className="text-red-600 text-sm italic font-body">The archives are sealed by security protocols. Please verify your admin privileges.</p>
                        </div>
                    ) : recentOrders.length > 0 ? (
                        <Card className="border-[#E8E1D9] shadow-sm overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm font-body text-left">
                                        <thead className="bg-[#FDFBF9] text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b border-[#E8E1D9]">
                                            <tr>
                                                <th className="px-6 py-4">Order ID</th>
                                                <th className="px-6 py-4">Client</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Value</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-[#FDFBF9]/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-xs">#{order.order_number}</td>
                                                    <td className="px-6 py-4 text-xs font-medium">{order.customer_name}</td>
                                                    <td className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground">{format(new Date(order.created_at), 'MMM dd')}</td>
                                                    <td className="px-6 py-4 font-black text-xs text-luxury-gold">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="bg-white border border-[#E8E1D9] rounded-2xl p-16 text-center shadow-sm">
                            <div className="w-20 h-20 bg-luxury-gold/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-luxury-gold/10">
                                <ShoppingBag size={32} className="text-luxury-gold/40" />
                            </div>
                            <h3 className="text-xl font-heading font-medium text-[#332D2D] mb-2 uppercase tracking-tight">Recent Orders</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto font-body italic">Once your customers start placing orders, they will materialize here with grace.</p>
                        </div>
                    )}
                </div>

                {/* Advanced Sidebar for Dashboard */}
                <div className="space-y-6">
                    <h2 className="font-heading text-xl font-bold text-[#332D2D] mb-6">Master Stats</h2>
                    <Card className="border-[#E8E1D9] bg-gradient-to-br from-[#1A1A1A] to-[#332D2D] text-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={160} />
                        </div>
                        <CardContent className="p-8">
                            <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-4">Conversion Reach</h4>
                            <div className="text-4xl font-heading font-bold mb-2">92.4%</div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full mb-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-luxury-gold w-[92.4%] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed">Your brand's visual identity is resonating exceptionally well with the target demographic.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-[#E8E1D9] bg-white p-6 shadow-sm">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Stock Health</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-[#332D2D]">Primary Silk</span>
                                <span className="font-bold text-green-600">Optimal</span>
                            </div>
                            <div className="w-full bg-muted/30 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[85%]" />
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-[#332D2D]">Linen Gold</span>
                                <span className="font-bold text-luxury-gold">Limited</span>
                            </div>
                            <div className="w-full bg-muted/30 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-luxury-gold w-[25%]" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
