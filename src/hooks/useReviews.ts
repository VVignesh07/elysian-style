import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as defaultSupabase, Database } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface Review {
    id: string;
    product_id: string;
    user_name: string;
    user_email?: string;
    rating: number;
    comment: string;
    created_at: string;
}

export interface CreateReviewInput {
    product_id: string;
    user_name: string;
    user_email?: string;
    rating: number;
    comment: string;
}

export function useReviews(productId: string, supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['reviews', productId],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data as Review[];
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}

export function useLatestReviews(limit: number = 3, supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['reviews', 'latest', limit],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .gte('rating', 4)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as Review[];
        },
    });
}

export function useSubmitReview(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateReviewInput) => {
            const { data, error } = await supabaseClient
                .from('reviews')
                .insert(input as any)
                .select()
                .single();

            if (error) throw error;
            return data as Review;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Thank you for your review!');
        },
        onError: (error: any) => {
            console.error('Error submitting review:', error);
            toast.error(error.message || 'Failed to submit review');
        },
    });
}

export function useAllReviews(
    supabaseClient: SupabaseClient<Database> = defaultSupabase,
    options?: any
) {
    return useQuery<(Review & { products: { name: string } })[], Error>({
        queryKey: ['reviews', 'all'],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*, products(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as (Review & { products: { name: string } })[];
        },
        ...options
    });
}

export function useDeleteReview(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabaseClient
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Review deleted successfully');
        },
        onError: (error: any) => {
            console.error('Error deleting review:', error);
            toast.error(error.message || 'Failed to delete review');
        },
    });
}

export function useUpdateReview(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, rating, comment }: { id: string, rating: number, comment: string }) => {
            const { error } = await supabaseClient
                .from('reviews')
                // @ts-ignore
                .update({ rating, comment })
                .eq('id', id);

            if (error) throw error;
        },
        // Optimistic Update
        onMutate: async (newReview) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['reviews'] });

            // Snapshot the previous value
            const previousReviews = queryClient.getQueryData(['reviews', 'all']);

            // Optimistically update to the new value
            queryClient.setQueryData(['reviews', 'all'], (old: any) => {
                if (!old) return old;
                return old.map((rev: any) =>
                    rev.id === newReview.id ? { ...rev, rating: newReview.rating, comment: newReview.comment } : rev
                );
            });

            // Return a context object with the snapshotted value
            return { previousReviews };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err: any, newReview, context) => {
            if (context?.previousReviews) {
                queryClient.setQueryData(['reviews', 'all'], context.previousReviews);
            }
            console.error('Error updating review:', err);
            toast.error(err.message || 'Failed to update review');
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onSuccess: () => {
            toast.success('Review updated successfully');
        },
    });
}
