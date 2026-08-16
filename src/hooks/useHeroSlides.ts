
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as defaultSupabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';
import { uploadBase64Image } from '@/services/storage';

export interface HeroSlide {
    id: string;
    image_url: string;
    title: string | null;
    subtitle: string | null;
    cta_text: string | null;
    cta_link: string | null;
    bg_color: string | null;
    is_active: boolean;
    display_order: number;
    layout_type: 'split' | 'full';
    created_at: string;
    updated_at: string;
}

export interface CreateHeroSlideInput {
    image_url: string;
    title?: string;
    subtitle?: string;
    cta_text?: string;
    cta_link?: string;
    bg_color?: string;
    is_active?: boolean;
    display_order?: number;
    layout_type?: 'split' | 'full';
}

export interface UpdateHeroSlideInput extends Partial<CreateHeroSlideInput> {
    id: string;
}

// Fetch all slides
export function useHeroSlides(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['hero_slides'],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('hero_slides')
                .select('*')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as HeroSlide[];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes cache
    });
}

// Create slide
export function useCreateHeroSlide(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateHeroSlideInput) => {
            let imageUrl = input.image_url;

            // Upload image if it's base64
            if (input.image_url && input.image_url.startsWith('data:image')) {
                try {
                    imageUrl = await uploadBase64Image(input.image_url, 'hero-slides');
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Failed to upload image');
                    throw error;
                }
            }

            const { data, error } = await (supabaseClient as any)
                .from('hero_slides')
                .insert({
                    image_url: imageUrl,
                    title: input.title || null,
                    subtitle: input.subtitle || null,
                    cta_text: input.cta_text || 'Shop Now',
                    cta_link: input.cta_link || '/collections',
                    bg_color: input.bg_color || null,
                    is_active: input.is_active !== undefined ? input.is_active : true,
                    display_order: input.display_order || 0,
                    layout_type: input.layout_type || 'split',
                })
                .select()
                .single();

            if (error) throw error;
            return data as HeroSlide;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero_slides'] });
            toast.success('Slide created successfully');
        },
        onError: (error: any) => {
            console.error('Error creating slide:', error);
            toast.error(error.message || 'Failed to create slide');
        },
    });
}

// Update slide
export function useUpdateHeroSlide(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: UpdateHeroSlideInput) => {
            const { id, ...updates } = input;
            let imageUrl = updates.image_url;

            // Upload new image if it's base64
            if (updates.image_url && updates.image_url.startsWith('data:image')) {
                try {
                    imageUrl = await uploadBase64Image(updates.image_url, 'hero-slides');
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Failed to upload image');
                    throw error;
                }
            }

            const { data, error } = await (supabaseClient as any)
                .from('hero_slides')
                .update({
                    ...updates,
                    image_url: imageUrl
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as HeroSlide;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['hero_slides'] });
            const previousData = queryClient.getQueryData(['hero_slides']);

            queryClient.setQueryData(['hero_slides'], (old: any) => {
                if (!old) return old;
                return old.map((slide: any) =>
                    slide.id === variables.id ? { ...slide, ...variables } : slide
                );
            });

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['hero_slides'], context.previousData);
            }
            toast.error(err.message || 'Failed to update slide');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['hero_slides'] });
        },
        onSuccess: () => {
            toast.success('Slide updated successfully');
        },
    });
}

// Delete slide
export function useDeleteHeroSlide(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabaseClient as any)
                .from('hero_slides')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['hero_slides'] });
            const previousData = queryClient.getQueryData(['hero_slides']);

            queryClient.setQueryData(['hero_slides'], (old: any) => {
                if (!old) return old;
                return old.filter((slide: any) => slide.id !== id);
            });

            return { previousData };
        },
        onError: (err, id, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['hero_slides'], context.previousData);
            }
            toast.error(err.message || 'Failed to delete slide');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['hero_slides'] });
        },
        onSuccess: () => {
            toast.success('Slide deleted successfully');
        },
    });
}
