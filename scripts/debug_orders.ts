
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://utoukqzikoldefjvzzhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b3VrcXppa29sZGVmanZ6emh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDU1NjUsImV4cCI6MjA4NjY4MTU2NX0.y1MZG7gJ71KOU3B5o7jfbzTXh__-AbtWJdfU9UsSJ4g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrders() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            order_items (
                id,
                product_name,
                image_url,
                product_id,
                product:products (
                    id,
                    name,
                    images
                )
            )
        `)
        .limit(3);

    if (error) {
        console.error(JSON.stringify({ error }));
        return;
    }

    console.log(JSON.stringify(orders, null, 2));
}

debugOrders();
