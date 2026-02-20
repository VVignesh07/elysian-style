import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as defaultSupabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { uploadBase64Image } from '@/services/storage';
import { toast } from 'sonner';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    color: string;
    status: 'Active' | 'Inactive';
    display_order: number;
    product_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryInput {
    name: string;
    slug: string;
    description?: string;
    image?: string; // base64 or URL
    color?: string;
    status?: 'Active' | 'Inactive';
    display_order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
    id: string;
}

// Fetch all categories
export function useCategories(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true })
                .limit(20);

            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error fetching categories:", error);
                }
                throw error;
            }
            return data as Category[];
        },
        staleTime: 1000 * 60 * 15, // 15 minutes - categories rarely change
        gcTime: 1000 * 60 * 60, // 1 hour cache
    });
}

// Fetch single category
export function useCategory(id: string, supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error fetching category:", error);
                }
                throw error;
            }
            return data as Category;
        },
        enabled: !!id,
    });
}

// Create category
export function useCreateCategory(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateCategoryInput) => {
            let imageUrl = input.image;

            // Upload image if it's base64
            if (input.image && input.image.startsWith('data:image')) {
                try {
                    imageUrl = await uploadBase64Image(input.image, 'product-images');
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Failed to upload image');
                    throw error;
                }
            }

            const { data, error } = await (supabaseClient
                .from('categories') as any)
                .insert({
                    name: input.name,
                    slug: input.slug,
                    description: input.description || null,
                    image_url: imageUrl || null,
                    color: input.color || '#3B82F6',
                    status: input.status || 'Active',
                    display_order: input.display_order || 0,
                })
                .select()
                .single();

            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error creating category:", error);
                }
                throw error;
            }
            return data as Category;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category created successfully');
        },
        onError: (error: any) => {
            console.error('Error creating category:', error);
            toast.error(error.message || 'Failed to create category');
        },
    });
}

// Update category
export function useUpdateCategory(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: UpdateCategoryInput) => {
            const { id, image, ...updates } = input;
            let imageUrl = image;

            // Upload new image if it's base64
            if (image && image.startsWith('data:image')) {
                try {
                    imageUrl = await uploadBase64Image(image, 'product-images');
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Failed to upload image');
                    throw error;
                }
            }

            const { data, error } = await (supabaseClient
                .from('categories') as any)
                .update({
                    ...updates,
                    image_url: imageUrl,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error updating category:", error);
                }
                throw error;
            }
            return data as Category;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category updated successfully');
        },
        onError: (error: any) => {
            console.error('Error updating category:', error);
            toast.error(error.message || 'Failed to update category');
        },
    });
}

// Delete category
export function useDeleteCategory(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabaseClient
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category deleted successfully');
        },
        onError: (error: any) => {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Failed to delete category');
        },
    });
}
