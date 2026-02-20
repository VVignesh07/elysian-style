const { createClient } = require('@supabase/supabase-js');
const url = 'https://utoukqzikoldefjvzzhy.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b3VrcXppa29sZGVmanZ6emh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDU1NjUsImV4cCI6MjA4NjY4MTU2NX0.y1MZG7gJ71KOU3B5o7jfbzTXh__-AbtWJdfU9UsSJ4g';
const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

check();
