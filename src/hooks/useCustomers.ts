import { useQuery } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin as defaultSupabase } from "@/lib/supabaseAdminClient";
import { Database } from "@/lib/supabase";

export interface CustomerStats {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    created_at: string;
    total_orders: number;
    total_spent: number;
    is_registered: boolean;
}

export function useAdminCustomers(
    supabaseClient: SupabaseClient<Database> = defaultSupabase
) {
    return useQuery({
        queryKey: ['admin-customers'],
        queryFn: async () => {
            // Fetch only necessary columns for performance
            const [profilesRes, ordersRes] = await Promise.all([
                supabaseClient
                    .from('profiles')
                    .select('id, email, full_name, phone, created_at') as any,
                supabaseClient
                    .from('orders')
                    .select('customer_name, email, phone, created_at, total_amount, user_id') as any
            ]);

            if (profilesRes.error) throw profilesRes.error;
            if (ordersRes.error) throw ordersRes.error;

            const profiles = profilesRes.data || [];
            const orders = ordersRes.data || [];

            // Aggregate order stats by email
            const statsMap = new Map<string, {
                total_orders: number;
                total_spent: number;
                last_order_date: string;
                phone: string | null;
                customer_name: string;
            }>();

            orders.forEach(order => {
                const email = order.email?.toLowerCase();
                if (!email) return;

                const existing = statsMap.get(email);
                if (!existing) {
                    statsMap.set(email, {
                        total_orders: 1,
                        total_spent: Number(order.total_amount) || 0,
                        last_order_date: order.created_at,
                        phone: order.phone,
                        customer_name: order.customer_name
                    });
                } else {
                    existing.total_orders += 1;
                    existing.total_spent += Number(order.total_amount) || 0;
                    if (new Date(order.created_at) > new Date(existing.last_order_date)) {
                        existing.last_order_date = order.created_at;
                    }
                }
            });

            // Merge profiles with stats
            const merged: CustomerStats[] = profiles.map(profile => {
                const email = profile.email?.toLowerCase();
                const stats = email ? statsMap.get(email) : null;

                // Remove processed emails from map to find guests later
                if (email) statsMap.delete(email);

                return {
                    id: profile.id,
                    email: profile.email || '',
                    full_name: profile.full_name || 'Unnamed User',
                    phone: profile.phone || stats?.phone || null,
                    created_at: profile.created_at,
                    is_registered: true,
                    total_orders: stats?.total_orders || 0,
                    total_spent: stats?.total_spent || 0
                };
            });

            // Add guests
            statsMap.forEach((stats, email) => {
                merged.push({
                    id: email, // Pseudo-ID
                    email: email,
                    full_name: stats.customer_name || 'Guest User',
                    phone: stats.phone,
                    created_at: stats.last_order_date,
                    is_registered: false,
                    total_orders: stats.total_orders,
                    total_spent: stats.total_spent
                });
            });

            return merged.sort((a, b) => b.total_spent - a.total_spent);
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
}
