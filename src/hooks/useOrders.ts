import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as defaultSupabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { OrderDB } from '@/types/order.types';

export function useAdminOrders(
    page: number,
    pageSize: number,
    searchTerm: string,
    supabaseClient: SupabaseClient<Database> = defaultSupabase
) {
    return useQuery({
        queryKey: ['admin-orders', page, pageSize, searchTerm],
        queryFn: async () => {
            let query = supabaseClient
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *
                    )
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (searchTerm) {
                query = query.or(`id.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error fetching orders:", error);
                }
                throw error;
            }

            return {
                orders: data as OrderDB[],
                totalCount: count || 0
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes stale time
        placeholderData: (previousData) => previousData,
    });
}
