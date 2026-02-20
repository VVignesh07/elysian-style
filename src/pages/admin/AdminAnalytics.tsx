import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderDB } from "@/types/order.types";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#D4AF37', '#332D2D', '#7C7C7C', '#E8E1D9', '#C0C0C0'];

const AdminAnalytics = () => {
    const [timeRange, setTimeRange] = useState(7); // days

    // Fetch all orders for analytics
    const { data: orders = [], isLoading: loadingOrders } = useQuery<OrderDB[]>({
        queryKey: ['admin-analytics-orders', timeRange],
        queryFn: async () => {
            const { data, error } = await supabaseAdmin
                .from('orders')
                .select(`
          *,
          order_items (
            *
          )
        `)
                .gte('created_at', subDays(new Date(), timeRange).toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as OrderDB[];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache for analytics
    });

    // 1. Revenue & Order Trends
    const dailyData = eachDayOfInterval({
        start: subDays(new Date(), timeRange - 1),
        end: new Date()
    }).map(day => {
        const dayOrders = (orders as OrderDB[]).filter(o => isSameDay(new Date(o.created_at), day));
        const revenue = dayOrders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + Number(o.total_amount), 0);

        return {
            date: format(day, 'MMM dd'),
            revenue,
            orders: dayOrders.length
        };
    });

    // 2. Product Performance
    const productPerformanceMap = new Map();
    (orders as OrderDB[]).forEach(order => {
        if (order.status === 'Cancelled') return;
        order.order_items?.forEach((item: any) => {
            const existing = productPerformanceMap.get(item.product_name) || { name: item.product_name, sales: 0, revenue: 0 };
            existing.sales += item.quantity;
            existing.revenue += Number(item.price) * item.quantity;
            productPerformanceMap.set(item.product_name, existing);
        });
    });

    const topProducts = Array.from(productPerformanceMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // 3. Status Distribution
    const statusColors: Record<string, string> = {
        'Pending': '#F59E0B',
        'Processing': '#3B82F6',
        'Shipped': '#8B5CF6',
        'Delivered': '#10B981',
        'Cancelled': '#EF4444'
    };

    const statusDistribution = Object.entries(
        (orders as OrderDB[]).reduce((acc: any, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const totalRevenue = (orders as OrderDB[])
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    if (loadingOrders) {
        return (
            <AdminLayout>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-[2rem] bg-muted/20" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <Skeleton className="h-[450px] rounded-[2rem] bg-muted/20" />
                    <Skeleton className="h-[450px] rounded-[2rem] bg-muted/20" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-luxury-gold" />
                            <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em]">Business Intelligence</span>
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-[#332D2D] mb-2 tracking-tight">Executive Analytics</h1>
                        <p className="text-muted-foreground font-body text-sm italic">Synthesizing commercial data into strategic growth insights.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-[#E8E1D9] shadow-sm">
                        {[7, 14, 30].map(range => (
                            <Button
                                key={range}
                                variant={timeRange === range ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setTimeRange(range)}
                                className={`text-[10px] font-black uppercase tracking-widest rounded-xl transition-all h-9 px-5 ${timeRange === range
                                    ? "bg-[#332D2D] text-white"
                                    : "text-muted-foreground hover:bg-[#FDFBF9]"
                                    }`}
                            >
                                {range} Days
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* High-Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                    trend="+12%"
                    isPositive={true}
                    icon={DollarSign}
                />
                <MetricCard
                    title="Total Orders"
                    value={orders.length.toString()}
                    trend="+8%"
                    isPositive={true}
                    icon={ShoppingBag}
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={`₹${Math.round(avgOrderValue).toLocaleString('en-IN')}`}
                    trend="-2%"
                    isPositive={false}
                    icon={TrendingUp}
                />
                <MetricCard
                    title="New Customers"
                    value="42"
                    trend="+5%"
                    isPositive={true}
                    icon={Users}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Revenue Trend Chart */}
                <Card className="border-[#E8E1D9] shadow-sm bg-white overflow-hidden rounded-[2rem]">
                    <CardHeader className="p-8 border-b border-[#FDFBF9]">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center justify-between">
                            Revenue Dynamics
                            <Calendar size={14} className="opacity-40" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#A0A0A0' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#A0A0A0' }}
                                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: '1px solid #E8E1D9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#D4AF37"
                                        strokeWidth={4}
                                        dot={{ fill: '#D4AF37', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products Chart */}
                <Card className="border-[#E8E1D9] shadow-sm bg-white overflow-hidden rounded-[2rem]">
                    <CardHeader className="p-8 border-b border-[#FDFBF9]">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center justify-between">
                            Performance Leaders
                            <Filter size={14} className="opacity-40" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#332D2D' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#FDFBF9' }}
                                        contentStyle={{ borderRadius: '1rem', border: '1px solid #E8E1D9' }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#332D2D"
                                        radius={[0, 10, 10, 0]}
                                        barSize={24}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Breakdown */}
                <Card className="border-[#E8E1D9] shadow-sm bg-white overflow-hidden rounded-[2rem] lg:col-span-1">
                    <CardHeader className="p-8 border-b border-[#FDFBF9]">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Logistics Integrity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-[#332D2D]">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Product Table Snippet */}
                <Card className="border-[#E8E1D9] shadow-sm bg-white overflow-hidden rounded-[2rem] lg:col-span-2">
                    <CardHeader className="p-8 border-b border-[#FDFBF9]">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Product Valuation Registry</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-body text-left">
                                <thead className="bg-[#FAF8F6] text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <tr>
                                        <th className="px-8 py-4">Collection Item</th>
                                        <th className="px-8 py-4 text-center">Volume</th>
                                        <th className="px-8 py-4 text-right">Yield</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#FDFBF9]">
                                    {topProducts.map((product, i) => (
                                        <tr key={i} className="hover:bg-[#FDFBF9]/50 transition-colors group">
                                            <td className="px-8 py-5 font-bold group-hover:text-luxury-gold transition-colors">{product.name}</td>
                                            <td className="px-8 py-5 text-center font-black opacity-60">{product.sales} units</td>
                                            <td className="px-8 py-5 text-right font-black text-luxury-gold">₹{product.revenue.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-20 text-center italic text-muted-foreground">Insufficient data archives available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

const MetricCard = ({ title, value, trend, isPositive, icon: Icon }: any) => (
    <Card className="border-[#E8E1D9] shadow-sm bg-white overflow-hidden rounded-[2rem] group hover:shadow-luxury transition-all duration-500">
        <CardContent className="p-8">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F6] border border-[#E8E1D9]/50 flex items-center justify-center text-luxury-gold shadow-inner group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isPositive ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                    {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trend}
                </div>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{title}</h3>
            <div className="text-3xl font-heading font-bold text-[#332D2D]">{value}</div>
        </CardContent>
        <div className={`h-1 w-full bg-luxury-gold opacity-10`} />
    </Card>
);

export default AdminAnalytics;
