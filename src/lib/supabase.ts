import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

const createSupabaseClient = () => createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    }
});

// Singleton pattern to prevent multiple instances during HMR
export const supabase = (import.meta.env.MODE === 'development')
    ? ((globalThis as any).supabaseClient ??= createSupabaseClient())
    : createSupabaseClient();

// Database types
export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
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
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    image_url?: string | null;
                    color?: string;
                    status?: 'Active' | 'Inactive';
                    display_order?: number;
                    product_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    image_url?: string | null;
                    color?: string;
                    status?: 'Active' | 'Inactive';
                    display_order?: number;
                    product_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            hero_slides: {
                Row: {
                    id: string;
                    image_url: string;
                    title: string | null;
                    subtitle: string | null;
                    cta_text: string | null;
                    cta_link: string | null;
                    is_active: boolean;
                    display_order: number;
                    layout_type: 'split' | 'full';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    image_url: string;
                    title?: string | null;
                    subtitle?: string | null;
                    cta_text?: string | null;
                    cta_link?: string | null;
                    is_active?: boolean;
                    display_order?: number;
                    layout_type?: 'split' | 'full';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    image_url?: string;
                    title?: string | null;
                    subtitle?: string | null;
                    cta_text?: string | null;
                    cta_link?: string | null;
                    is_active?: boolean;
                    display_order?: number;
                    layout_type?: 'split' | 'full';
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            products: {
                Row: {
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
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    category_id?: string | null;
                    price: number;
                    discount_price?: number | null;
                    sku?: string | null;
                    stock_quantity?: number;
                    images?: any;
                    sizes?: any;
                    colors?: any;
                    is_featured?: boolean;
                    is_new?: boolean;
                    status?: 'Active' | 'Inactive' | 'Draft';
                    details?: any;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    category_id?: string | null;
                    price?: number;
                    discount_price?: number | null;
                    sku?: string | null;
                    stock_quantity?: number;
                    images?: any;
                    sizes?: any;
                    colors?: any;
                    is_featured?: boolean;
                    is_new?: boolean;
                    status?: 'Active' | 'Inactive' | 'Draft';
                    details?: any;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            orders: {
                Row: {
                    id: string;
                    user_id: string | null;
                    customer_name: string;
                    email: string;
                    phone: string | null;
                    shipping_address: {
                        street: string;
                        city: string;
                        state: string;
                        postal_code: string;
                        country: string;
                    };
                    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
                    payment_method: string;
                    payment_status: string | null;
                    total_amount: number;
                    discount_amount: number;
                    tracking_number: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    customer_name: string;
                    email: string;
                    phone?: string | null;
                    shipping_address: any;
                    status?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
                    payment_method: string;
                    payment_status?: string | null;
                    total_amount: number;
                    discount_amount?: number;
                    tracking_number?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    customer_name?: string;
                    email?: string;
                    phone?: string | null;
                    shipping_address?: any;
                    status?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
                    payment_method?: string;
                    payment_status?: string | null;
                    total_amount?: number;
                    discount_amount?: number;
                    tracking_number?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string | null;
                    product_id: string | null;
                    product_name: string;
                    quantity: number;
                    price: number;
                    selected_size: string | null;
                    selected_color: string | null;
                    image_url: string | null;
                };
                Insert: {
                    id?: string;
                    order_id: string | null;
                    product_id?: string | null;
                    product_name: string;
                    quantity?: number;
                    price: number;
                    selected_size?: string | null;
                    selected_color?: string | null;
                    image_url?: string | null;
                };
                Update: {
                    id?: string;
                    order_id?: string | null;
                    product_id?: string | null;
                    product_name?: string;
                    quantity?: number;
                    price?: number;
                    selected_size?: string | null;
                    selected_color?: string | null;
                    image_url?: string | null;
                };
                Relationships: [];
            };
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    email: string | null;
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            reviews: {
                Row: {
                    id: string;
                    product_id: string;
                    user_name: string;
                    user_email: string | null;
                    rating: number;
                    comment: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    user_name: string;
                    user_email?: string | null;
                    rating: number;
                    comment: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    user_name?: string;
                    user_email?: string | null;
                    rating?: number;
                    comment?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            instagram_reels: {
                Row: {
                    id: string;
                    reel_url: string;
                    caption: string | null;
                    display_order: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    reel_url: string;
                    caption?: string | null;
                    display_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    reel_url?: string;
                    caption?: string | null;
                    display_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            promotional_banners: {
                Row: {
                    id: string;
                    title: string;
                    subtitle: string | null;
                    description: string | null;
                    image_url: string;
                    button_text: string | null;
                    button_link: string | null;
                    position: 'hero' | 'mid-page' | 'footer';
                    priority: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    subtitle?: string | null;
                    description?: string | null;
                    image_url: string;
                    button_text?: string | null;
                    button_link?: string | null;
                    position?: 'hero' | 'mid-page' | 'footer';
                    priority?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    subtitle?: string | null;
                    description?: string | null;
                    image_url?: string;
                    button_text?: string | null;
                    button_link?: string | null;
                    position?: 'hero' | 'mid-page' | 'footer';
                    priority?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            user_roles: {
                Row: {
                    id: string;
                    user_id: string;
                    role: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    role: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    role?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_roles_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            app_settings: {
                Row: {
                    key: string;
                    value: any;
                    description: string | null;
                    updated_at: string;
                    updated_by: string | null;
                };
                Insert: {
                    key: string;
                    value: any;
                    description?: string | null;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Update: {
                    key?: string;
                    value?: any;
                    description?: string | null;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "app_settings_updated_by_fkey";
                        columns: ["updated_by"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };

        };
    };
}
