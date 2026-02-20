import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as defaultSupabase, Database } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Use database types directly for safety
type InstagramReelRow = Database['public']['Tables']['instagram_reels']['Row'];
type InstagramReelInsert = Database['public']['Tables']['instagram_reels']['Insert'];

export type InstagramReel = InstagramReelRow;
export type CreateReelInput = InstagramReelInsert;

export function useInstagramReels(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['instagram_reels'],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('instagram_reels') // Casting as any until types are generated
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as InstagramReel[];
        },
    });
}

export function useActiveInstagramReels(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['instagram_reels', 'active'],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('instagram_reels')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as InstagramReel[];
        },
    });
}

export function useCreateReel(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateReelInput) => {
            const { data, error } = await supabaseClient
                .from('instagram_reels')
                // @ts-ignore
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as InstagramReel;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instagram_reels'] });
            toast.success('Reel added successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add reel');
        },
    });
}

export function useUpdateReel(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<InstagramReel> & { id: string }) => {
            const { error } = await supabaseClient
                .from('instagram_reels')
                // @ts-ignore
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instagram_reels'] });
            toast.success('Reel updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update reel');
        },
    });
}

export function useDeleteReel(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabaseClient
                .from('instagram_reels')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instagram_reels'] });
            toast.success('Reel deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete reel');
        },
    });
}
