import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingBag, ArrowRight, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { OrderDB } from "@/types/order.types";
import { format } from "date-fns";
import { realtimeManager } from "@/lib/realtime";
import { getOrderItemImage, handleImageError } from "@/utils/orderImageUtils";

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const { data: orders = [], isLoading, error } = useQuery<OrderDB[]>({
        queryKey: ['user-orders', user?.id],
        queryFn: async () => {
            if (!user) return [];

            console.log('🔄 Fetching orders for user:', user.id, user.email);
            // Fetch by UID OR Email to catch guest orders that didn't link correctly
            const { data, error } = await supabase
                .from('orders')
                .select(`
    *,
    order_items(
                        *
                    )
        `)
                .or(`user_id.eq.${user.id}, email.eq.${user.email} `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Supabase Order Fetch Error:', error);
                throw error;
            }

            console.log(`✅ Retrieved ${data?.length || 0} orders`);
            return data as OrderDB[];
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    // Real-time updates for status changes
    useEffect(() => {
        if (!user) return;

        const topic = `user-orders-${user.id}`;
        const channel = realtimeManager.getChannel(supabase, topic);

        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `user_id=eq.${user.id}`
            },
            () => {
                console.log('⚡ Real-time update detected - Refreshing orders');
                queryClient.invalidateQueries({ queryKey: ['user-orders', user.id] });
            }
        );

        realtimeManager.subscribe(topic);

        return () => {
            realtimeManager.unsubscribe(supabase, topic);
        };
    }, [user, queryClient]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Pending": return <Clock size={16} className="text-yellow-500" />;
            case "Processing": return <Loader2 size={16} className="text-blue-500 animate-spin" />;
            case "Shipped": return <Truck size={16} className="text-purple-500" />;
            case "Delivered": return <CheckCircle size={16} className="text-green-500" />;
            case "Cancelled": return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-yellow-500" />;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FDFBF9] flex flex-col font-body">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-6 pt-32">
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                        <div className="w-24 h-24 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto">
                            <ShoppingBag className="text-luxury-gold" size={40} strokeWidth={1} />
                        </div>
                        <h2 className="text-3xl font-heading font-medium text-[#1A1A1A]">Login Required</h2>
                        <p className="text-muted-foreground italic">Access your order history and tracking details.</p>
                        <Link to="/login" className="luxury-btn-primary w-full py-4 inline-flex items-center justify-center gap-3">
                            Sign In to View Orders <ArrowRight size={18} />
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF9] flex flex-col font-body">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-24">
                <div className="mb-12">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-3">
                        <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-luxury-gold">My Orders</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-heading font-semibold text-[#1A1A1A] tracking-tight">Order History</h1>
                    <p className="text-muted-foreground mt-2 italic">A record of your past purchases and current orders.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-[#E8E1D9] shadow-luxury p-10">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-heading font-medium text-[#1A1A1A] mb-2">Registry Access Refused</h3>
                        <p className="text-muted-foreground italic">An synchronization error occurred while retrieving your orders.</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-[#E8E1D9] shadow-luxury p-12">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="text-muted-foreground/30" size={32} />
                        </div>
                        <h3 className="text-2xl font-heading font-medium text-[#1A1A1A] mb-3">No Orders Yet</h3>
                        <p className="text-muted-foreground italic mb-8">You haven't placed any orders yet. Start your journey with us today.</p>
                        <Link to="/shop" className="luxury-btn-primary px-12 py-4 inline-flex items-center justify-center gap-3">
                            Discover the Collection <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-3xl border border-[#E8E1D9] shadow-luxury overflow-hidden group hover:shadow-2xl transition-all duration-700">
                                <div className="bg-[#FAF7F5] border-b border-[#E8E1D9] p-6 lg:p-8 flex flex-wrap justify-between items-center gap-6">
                                    <div className="flex gap-10">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Order ID</p>
                                            <p className="text-xs font-mono font-bold text-[#1A1A1A]">#{order.order_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Date Registered</p>
                                            <p className="text-xs font-bold text-[#1A1A1A]">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Total Amount</p>
                                            <p className="text-xs font-black text-luxury-gold tracking-tight">₹{order.total_amount.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-5 py-2 bg-white rounded-full border border-[#E8E1D9] shadow-sm">
                                            {getStatusIcon(order.status)}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">{order.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 lg:p-10 space-y-8">
                                    {order.order_items?.map((item) => (
                                        <div key={item.id} className="flex gap-8 group/item">
                                            <div className="h-24 w-24 bg-muted rounded-2xl overflow-hidden flex-shrink-0 relative border border-[#E8E1D9]/50">
                                                <img
                                                    src={getOrderItemImage(item, 'MEDIUM_SIZE')}
                                                    alt={item.product_name}
                                                    className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-1000"
                                                    onError={handleImageError}
                                                />
                                            </div>
                                            <div className="flex-1 py-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-heading text-xl font-semibold text-[#1A1A1A] group-hover/item:text-luxury-gold transition-colors leading-tight mb-2">
                                                        {item.product_name}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                                                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Quantity: <span className="text-[#1A1A1A]">{item.quantity}</span></span>
                                                        {item.selected_size && (
                                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Size: <span className="text-[#1A1A1A]">{item.selected_size}</span></span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-lg font-black text-luxury-gold tracking-tighter">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {order.tracking_number && (
                                        <div className="mt-8 pt-8 border-t border-[#E8E1D9]/50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Truck size={18} className="text-luxury-gold" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Tracking:</span>
                                                <span className="text-[11px] font-mono font-bold text-[#1A1A1A] tracking-wider">{order.tracking_number.toUpperCase()}</span>
                                            </div>
                                            <Link to={`/ tracking / ${order.id} `} className="text-[10px] font-black uppercase tracking-widest text-luxury-gold hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                                Track Order <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Orders;
