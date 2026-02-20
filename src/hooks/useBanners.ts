import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";

export interface PromotionalBanner {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    image_url: string;
    button_text?: string;
    button_link?: string;
    position: 'hero' | 'mid-page' | 'footer';
    priority: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateBannerInput {
    title: string;
    subtitle?: string;
    description?: string;
    image_url: string;
    button_text?: string;
    button_link?: string;
    position?: 'hero' | 'mid-page' | 'footer';
    priority?: number;
    is_active?: boolean;
}

// Fetch active banners for public display
export const useActiveBanners = (supabase: SupabaseClient, position?: string) => {
    return useQuery({
        queryKey: ['promotional-banners', 'active', position],
        queryFn: async () => {
            let query = supabase
                .from('promotional_banners')
                .select('*')
                .eq('is_active', true)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (position) {
                query = query.eq('position', position);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as PromotionalBanner[];
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
};

// Fetch all banners for admin
export const useAllBanners = (supabase: SupabaseClient) => {
    return useQuery({
        queryKey: ['promotional-banners', 'all'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('promotional_banners')
                .select('*')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as PromotionalBanner[];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache for admin
    });
};

// Create banner
export const useCreateBanner = (supabase: SupabaseClient) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (banner: CreateBannerInput) => {
            const { data, error } = await supabase
                .from('promotional_banners')
                .insert([banner])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
        },
    });
};

// Update banner
export const useUpdateBanner = (supabase: SupabaseClient) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateBannerInput> }) => {
            const { data, error } = await supabase
                .from('promotional_banners')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
        },
    });
};

// Delete banner
export const useDeleteBanner = (supabase: SupabaseClient) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('promotional_banners')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['promotional-banners'] });
            const previousAll = queryClient.getQueryData(['promotional-banners', 'all']);

            queryClient.setQueryData(['promotional-banners', 'all'], (old: any) => {
                if (!old) return old;
                return old.filter((b: any) => b.id !== id);
            });

            return { previousAll };
        },
        onError: (err: any, id, context) => {
            if (context?.previousAll) {
                queryClient.setQueryData(['promotional-banners', 'all'], context.previousAll);
            }
            console.error("Delete Error:", err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
        },
    });
};

// Toggle banner active status
export const useToggleBannerStatus = (supabase: SupabaseClient) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { data, error } = await supabase
                .from('promotional_banners')
                .update({ is_active })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onMutate: async ({ id, is_active }) => {
            await queryClient.cancelQueries({ queryKey: ['promotional-banners'] });

            const previousAll = queryClient.getQueryData(['promotional-banners', 'all']);

            queryClient.setQueryData(['promotional-banners', 'all'], (old: any) => {
                if (!old) return old;
                return old.map((b: any) => b.id === id ? { ...b, is_active } : b);
            });

            return { previousAll };
        },
        onError: (err, variables, context) => {
            if (context?.previousAll) {
                queryClient.setQueryData(['promotional-banners', 'all'], context.previousAll);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
        },
    });
};
