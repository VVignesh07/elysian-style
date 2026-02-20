import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, TrendingUp, ShoppingBag, Mail, Phone, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { format } from "date-fns";

type CustomerSegment = 'New' | 'Repeat';

interface Customer {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    created_at: string;
    total_orders: number;
    total_spent: number;
    segment: CustomerSegment;
}

const AdminCustomerSegments = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | 'All'>('All');

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['admin-customer-segments'],
        queryFn: async () => {
            // Fetch profiles
            const { data: profiles, error: profilesError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .returns<any[]>();

            if (profilesError) throw profilesError;

            // Fetch all orders
            const { data: orders, error: ordersError } = await supabaseAdmin
                .from('orders')
                .select('id, customer_name, email, phone, created_at, total_amount, user_id')
                .returns<any[]>();

            if (ordersError) throw ordersError;

            // Aggregate order stats by email
            const statsMap = new Map();

            orders?.forEach(order => {
                const email = order.email?.toLowerCase();
                if (!email) return;

                if (!statsMap.has(email)) {
                    statsMap.set(email, {
                        total_orders: 1,
                        total_spent: Number(order.total_amount),
                        phone: order.phone,
                        customer_name: order.customer_name
                    });
                } else {
                    const stats = statsMap.get(email);
                    stats.total_orders += 1;
                    stats.total_spent += Number(order.total_amount);
                }
            });

            // Merge profiles with stats and calculate segments
            const mergedCustomers: Customer[] = (profiles || []).map(profile => {
                const email = profile.email?.toLowerCase();
                const stats = statsMap.get(email) || { total_orders: 0, total_spent: 0 };
                statsMap.delete(email);

                const totalOrders = stats.total_orders;
                const segment: CustomerSegment = totalOrders >= 2 ? 'Repeat' : 'New';

                return {
                    id: profile.id,
                    email: profile.email,
                    full_name: profile.full_name || 'Unknown',
                    phone: profile.phone || stats.phone,
                    created_at: profile.created_at,
                    total_orders: totalOrders,
                    total_spent: stats.total_spent,
                    segment
                };
            });

            // Add guest customers
            statsMap.forEach((stats, email) => {
                const totalOrders = stats.total_orders;
                const segment: CustomerSegment = totalOrders >= 2 ? 'Repeat' : 'New';

                mergedCustomers.push({
                    id: email,
                    email: email,
                    full_name: stats.customer_name || 'Guest User',
                    phone: stats.phone,
                    created_at: new Date().toISOString(),
                    total_orders: totalOrders,
                    total_spent: stats.total_spent,
                    segment
                });
            });

            return mergedCustomers.sort((a, b) => b.total_spent - a.total_spent);
        }
    });

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSegment = selectedSegment === 'All' || customer.segment === selectedSegment;
        return matchesSearch && matchesSegment;
    });

    const newCustomers = customers.filter(c => c.segment === 'New');
    const repeatCustomers = customers.filter(c => c.segment === 'Repeat');

    const getSegmentColor = (segment: CustomerSegment) => {
        return segment === 'Repeat'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-blue-50 text-blue-700 border-blue-200';
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-[#1A1A1A] tracking-tight">Customer Segments</h1>
                    <p className="text-muted-foreground mt-1 font-body text-sm italic">Analyze customer behavior and loyalty.</p>
                </div>
            </div>

            {/* Segment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-[#E8E1D9] shadow-luxury overflow-hidden bg-gradient-to-br from-blue-50 to-white rounded-3xl cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => setSelectedSegment('New')}>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <Users className="text-blue-600" size={28} />
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-heading font-bold text-blue-600">{newCustomers.length}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New Customers</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Total Revenue</span>
                            <span className="font-bold text-blue-600">₹{newCustomers.reduce((sum, c) => sum + c.total_spent, 0).toLocaleString('en-IN')}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-[#E8E1D9] shadow-luxury overflow-hidden bg-gradient-to-br from-green-50 to-white rounded-3xl cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => setSelectedSegment('Repeat')}>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                                <TrendingUp className="text-green-600" size={28} />
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-heading font-bold text-green-600">{repeatCustomers.length}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Repeat Customers</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Total Revenue</span>
                            <span className="font-bold text-green-600">₹{repeatCustomers.reduce((sum, c) => sum + c.total_spent, 0).toLocaleString('en-IN')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer List */}
            <Card className="border-[#E8E1D9] shadow-luxury overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-4 bg-[#FAF7F5]/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 font-body border-[#E8E1D9] focus-visible:ring-luxury-gold/20 h-12 bg-white rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedSegment('All')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedSegment === 'All' ? 'bg-luxury-gold text-white' : 'bg-white border border-[#E8E1D9] text-muted-foreground hover:bg-[#FAF7F5]'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setSelectedSegment('New')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedSegment === 'New' ? 'bg-blue-600 text-white' : 'bg-white border border-[#E8E1D9] text-muted-foreground hover:bg-[#FAF7F5]'}`}
                            >
                                New
                            </button>
                            <button
                                onClick={() => setSelectedSegment('Repeat')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedSegment === 'Repeat' ? 'bg-green-600 text-white' : 'bg-white border border-[#E8E1D9] text-muted-foreground hover:bg-[#FAF7F5]'}`}
                            >
                                Repeat
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <Loader2 className="w-10 h-10 animate-spin text-luxury-gold" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Loading Segments...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-32">
                            <p className="text-muted-foreground font-body text-sm italic">
                                {searchTerm ? `No customers found matching "${searchTerm}"` : "No customers in this segment."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-body text-left">
                                <thead className="bg-[#FAF7F5] text-muted-foreground uppercase text-[10px] tracking-[0.2em] font-black border-b border-[#E8E1D9]">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Segment</th>
                                        <th className="px-6 py-4 text-center">Orders</th>
                                        <th className="px-6 py-4 text-right">Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-white/80 transition-all duration-300">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#1A1A1A] text-sm mb-1">{customer.full_name}</div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Mail size={10} />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone size={10} />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getSegmentColor(customer.segment)}`}>
                                                    {customer.segment}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-luxury-gold/5 text-luxury-gold font-bold text-xs">
                                                    <ShoppingBag size={10} />
                                                    {customer.total_orders}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-luxury-gold">
                                                ₹{customer.total_spent.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
};

export default AdminCustomerSegments;
