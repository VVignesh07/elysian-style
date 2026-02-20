// Order-related type definitions matching Supabase schema
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export interface ProductImage {
    id: string;
    images: string[];
}

export interface OrderItemDB {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    selected_size: string | null;
    selected_color: string | null;
    image_url: string | null;
    product_id: string | null;
    product: ProductImage | null;
}

export interface OrderDB {
    id: string;
    order_number: string;
    customer_name: string;
    email: string;
    phone: string | null;
    created_at: string;
    total_amount: number;
    status: OrderStatus;
    shipping_address: ShippingAddress;
    tracking_number: string | null;
    order_items: OrderItemDB[];
    user_id?: string;
}
