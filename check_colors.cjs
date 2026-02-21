require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColors() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, colors')
        .limit(10);

    console.log(JSON.stringify(data, null, 2));
}

checkColors();
