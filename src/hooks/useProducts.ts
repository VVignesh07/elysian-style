import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as defaultSupabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { uploadBase64Image } from '@/services/storage';
import { toast } from 'sonner';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category_id: string | null;
    price: number;
    discount_price: number | null;
    sku: string | null;
    stock_quantity: number;
    images: string[];
    sizes: string[];
    colors: string[];
    is_featured: boolean;
    is_new: boolean;
    status: 'Active' | 'Inactive' | 'Draft';
    details: string[];
    rating: number;
    reviews_count: number;
    show_limited_stock: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductWithCategory extends Product {
    category?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface CreateProductInput {
    name: string;
    slug: string;
    description?: string;
    category_id?: string;
    price: number;
    discount_price?: number;
    sku?: string;
    stock_quantity?: number;
    images?: string[]; // base64 or URLs
    sizes?: string[];
    colors?: string[];
    is_featured?: boolean;
    is_new?: boolean;
    status?: 'Active' | 'Inactive' | 'Draft';
    details?: string[];
    show_limited_stock?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    id: string;
}

export interface ProductFilters {
    category?: string;
    status?: string;
    search?: string;
    is_featured?: boolean;
    is_new?: boolean;
    colors?: string[];
    sizes?: string[];
    sort?: 'newest' | 'price-asc' | 'price-desc';
    limit?: number;
    offset?: number;
    include_subcategories?: boolean;
}

// Fetch all products with optional filters
export function useProducts(
    filters?: ProductFilters,
    supabaseClient: SupabaseClient<Database> = defaultSupabase,
    options?: any
) {
    return useQuery<ProductWithCategory[], Error>({
        queryKey: ['products', filters],
        queryFn: async () => {
            let query = supabaseClient
                .from('products')
                .select(`
          *,
          category:categories(id, name, slug)
        `);

            // Apply filters
            if (filters?.category) {
                if (filters.include_subcategories) {
                    // Optimized check: if the category is 'All', don't filter at all
                    if (filters.category === "All") {
                        // Skip filtering
                    } else {
                        // Fetch all descendant categories
                        const { data: allCategories } = await supabaseClient
                            .from('categories')
                            .select('id, parent_id');

                        if (allCategories && allCategories.length > 0) {
                            const categories_typed = allCategories as { id: string; parent_id: string | null }[];
                            const getDescendants = (parentId: string): string[] => {
                                const children = categories_typed.filter(c => c.parent_id === parentId);
                                let ids = [parentId];
                                for (const child of children) {
                                    ids = [...ids, ...getDescendants(child.id)];
                                }
                                return ids;
                            };
                            const categoryIds = getDescendants(filters.category);
                            query = query.in('category_id', categoryIds);
                        } else {
                            query = query.eq('category_id', filters.category);
                        }
                    }
                } else {
                    query = query.eq('category_id', filters.category);
                }
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.is_featured !== undefined) {
                query = query.eq('is_featured', filters.is_featured);
            }
            if (filters?.is_new !== undefined) {
                query = query.eq('is_new', filters.is_new);
            }
            if (filters?.colors && filters.colors.length > 0) {
                query = query.contains('colors', filters.colors);
            }
            if (filters?.sizes && filters.sizes.length > 0) {
                query = query.contains('sizes', filters.sizes);
            }
            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }

            // Apply ordering
            if (filters?.sort === 'price-asc') {
                query = query.order('price', { ascending: true });
            } else if (filters?.sort === 'price-desc') {
                query = query.order('price', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Apply pagination/limit
            if (filters?.offset !== undefined && filters?.limit !== undefined) {
                query = query.range(filters.offset, filters.offset + filters.limit - 1);
            } else {
                const limitValue = filters?.limit || 50;
                query = query.limit(limitValue);
            }

            const { data, error } = await query;
            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error fetching products:", error);
                }
                throw error;
            }
            return data as ProductWithCategory[];
        },
        staleTime: 1000 * 60 * 15, // 15 minutes - extreme caching
        gcTime: 1000 * 60 * 60, // 60 minutes cache time
        ...options
    });
}

// Fetch Admin Products with server-side pagination
export function useAdminProducts(
    page: number,
    pageSize: number,
    searchTerm: string,
    category?: string,
    supabaseClient: SupabaseClient<Database> = defaultSupabase
) {
    return useQuery({
        queryKey: ['admin-products', page, pageSize, searchTerm, category],
        queryFn: async () => {
            let query = supabaseClient
                .from('products')
                .select(`
                    *,
                    category:categories(id, name, slug)
                `, { count: 'exact' });

            if (category) {
                query = query.eq('category_id', category);
            }

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
            }

            query = query
                .order('created_at', { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            const { data, error, count } = await query;

            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error fetching admin products:", error);
                }
                throw error;
            }
            return {
                products: data as ProductWithCategory[],
                totalCount: count || 0
            };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        placeholderData: (previousData) => previousData,
    });
}

// Fetch single product
export function useProduct(id: string, supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['products', id],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('products')
                .select(`
          *,
          category:categories(id, name, slug)
        `)
                .eq('id', id)
                .single();

            if (error) {
                const isAbort = error.message?.includes('AbortError') || error.code === '20';
                if (!isAbort) {
                    console.error("Supabase Error fetching product:", error);
                }
                throw error;
            }
            return data as ProductWithCategory;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 10, // 10 minutes - aggressive caching
        gcTime: 1000 * 60 * 30, // 30 minutes cache time
    });
}

// Create product
export function useCreateProduct(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateProductInput) => {
            const imageUrls: string[] = [];

            // Upload images if they're base64
            if (input.images && input.images.length > 0) {
                for (const image of input.images) {
                    if (image.startsWith('data:image')) {
                        try {
                            const url = await uploadBase64Image(image, 'product-images');
                            imageUrls.push(url);
                        } catch (error) {
                            console.error('Error uploading image:', error);
                        }
                    } else {
                        imageUrls.push(image);
                    }
                }
            }

            const insertProduct = async (attemptSlug: string, attemptSku: string | null, retryCount = 0): Promise<Product> => {
                const { data, error } = await (supabaseClient
                    .from('products') as any)
                    .insert({
                        name: input.name,
                        slug: attemptSlug,
                        description: input.description || null,
                        category_id: input.category_id || null,
                        price: input.price,
                        discount_price: input.discount_price || null,
                        sku: attemptSku,
                        stock_quantity: input.stock_quantity || 0,
                        images: imageUrls,
                        sizes: input.sizes || [],
                        colors: input.colors || [],
                        is_featured: input.is_featured || false,
                        is_new: input.is_new || false,
                        status: input.status || 'Active',
                        details: input.details || [],
                        show_limited_stock: input.show_limited_stock || false,
                    })
                    .select()
                    .single();

                if (error) {
                    // Check for unique constraint violation (Postgres error 23505)
                    if (error.code === '23505' && retryCount < 3) {
                        if (error.message?.includes('slug')) {
                            const newSlug = `${attemptSlug}-${Math.random().toString(36).substring(2, 7)}`;
                            toast.info('Adjusted slug to avoid conflict');
                            return insertProduct(newSlug, attemptSku, retryCount + 1);
                        }
                        if (error.message?.includes('sku')) {
                            const newSku = attemptSku ? `${attemptSku}-${Math.random().toString(36).substring(2, 5).toUpperCase()}` : null;
                            toast.info('Adjusted SKU to avoid conflict');
                            return insertProduct(attemptSlug, newSku, retryCount + 1);
                        }
                    }
                    const isAbort = error.message?.includes('AbortError') || error.code === '20';
                    if (!isAbort) {
                        console.error('Error in insertProduct:', error);
                    }
                    throw error;
                }
                return data as Product;
            };

            return insertProduct(input.slug, input.sku || null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] }); // Update product counts
            toast.success('Product created successfully');
        },
        onError: (error: any) => {
            console.error('Error creating product:', error);
            if (error.code === '23505' && error.message?.includes('sku')) {
                toast.error('This SKU already exists. Please use a unique SKU.');
            } else {
                toast.error(error.message || 'Failed to create product');
            }
        },
    });
}

// Update product
export function useUpdateProduct(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...input }: CreateProductInput & { id: string }) => {
            const imageUrls: string[] = [];

            // Upload new images if they're base64
            if (input.images && input.images.length > 0) {
                for (const image of input.images) {
                    if (image.startsWith('data:image')) {
                        try {
                            const url = await uploadBase64Image(image, 'product-images');
                            imageUrls.push(url);
                        } catch (error) {
                            console.error('Error uploading image:', error);
                        }
                    } else {
                        imageUrls.push(image);
                    }
                }
            }

            const updateProduct = async (attemptSlug: string, attemptSku: string | null, retryCount = 0): Promise<Product> => {
                const { data, error } = await (supabaseClient
                    .from('products') as any)
                    .update({
                        name: input.name,
                        slug: attemptSlug,
                        description: input.description || null,
                        category_id: input.category_id || null,
                        price: input.price,
                        discount_price: input.discount_price || null,
                        sku: attemptSku,
                        stock_quantity: input.stock_quantity || 0,
                        images: imageUrls,
                        sizes: input.sizes || [],
                        colors: input.colors || [],
                        is_featured: input.is_featured || false,
                        is_new: input.is_new || false,
                        status: input.status || 'Active',
                        details: input.details || [],
                        show_limited_stock: input.show_limited_stock || false,
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    // Check for unique constraint violation (Postgres error 23505)
                    if (error.code === '23505' && retryCount < 3) {
                        if (error.message?.includes('slug')) {
                            const newSlug = `${attemptSlug}-${Math.random().toString(36).substring(2, 7)}`;
                            toast.info('Adjusted slug to avoid conflict');
                            return updateProduct(newSlug, attemptSku, retryCount + 1);
                        }
                        if (error.message?.includes('sku')) {
                            const newSku = attemptSku ? `${attemptSku}-${Math.random().toString(36).substring(2, 5).toUpperCase()}` : null;
                            toast.info('Adjusted SKU to avoid conflict');
                            return updateProduct(attemptSlug, newSku, retryCount + 1);
                        }
                    }
                    throw error;
                }
                return data as Product;
            };

            return updateProduct(input.slug, input.sku || null);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.id] });
            queryClient.invalidateQueries({ queryKey: ['categories'] }); // Update product counts
            toast.success('Product updated successfully');
        },
        onError: (error: any) => {
            console.error('Error updating product:', error);
            if (error.code === '23505' && error.message?.includes('sku')) {
                toast.error('This SKU already exists. Please use a unique SKU.');
            } else {
                toast.error(error.message || 'Failed to update product');
            }
        },
    });
}

// Delete product
export function useDeleteProduct(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabaseClient
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onMutate: async (id) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['products'] });
            await queryClient.cancelQueries({ queryKey: ['admin-products'] });

            // Snapshot previous data
            const previousProducts = queryClient.getQueryData(['products']);
            const previousAdminProducts = queryClient.getQueryData(['admin-products']);

            // Optimistically update 'products' (used in shop/client side)
            queryClient.setQueryData(['products'], (old: any) => {
                if (!old) return old;
                return old.filter((p: any) => p.id !== id);
            });

            // Optimistically update 'admin-products'
            queryClient.setQueryData(['admin-products'], (old: any) => {
                if (!old || !old.products) return old;
                return {
                    ...old,
                    products: old.products.filter((p: any) => p.id !== id),
                    totalCount: Math.max(0, (old.totalCount || 0) - 1)
                };
            });

            return { previousProducts, previousAdminProducts };
        },
        onError: (err, id, context) => {
            // Rollback on error
            if (context?.previousProducts) {
                queryClient.setQueryData(['products'], context.previousProducts);
            }
            if (context?.previousAdminProducts) {
                queryClient.setQueryData(['admin-products'], context.previousAdminProducts);
            }
            console.error('Error deleting product:', err);
            toast.error(err.message || 'Failed to delete product');
        },
        onSettled: () => {
            // Refetch to sync state
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onSuccess: () => {
            toast.success('Product deleted successfully');
        },
    });
}
// Check if SKU exists
export function useCheckSKU(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useMutation({
        mutationFn: async ({ sku, excludeId }: { sku: string; excludeId?: string }) => {
            if (!sku) return false;

            let query = supabaseClient
                .from('products')
                .select('id')
                .eq('sku', sku);

            if (excludeId) {
                query = query.neq('id', excludeId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data && data.length > 0;
        }
    });
}

// Check if slug exists
export function useCheckSlug(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useMutation({
        mutationFn: async ({ slug, excludeId }: { slug: string; excludeId?: string }) => {
            if (!slug) return false;

            let query = supabaseClient
                .from('products')
                .select('id')
                .eq('slug', slug);

            if (excludeId) {
                query = query.neq('id', excludeId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data && data.length > 0;
        }
    });
}
