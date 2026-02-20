
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
let url, key;
for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('categories').select('id, name, slug');
    if (error) {
        console.error(error);
    } else {
        console.log('---CATEGORIES_START---');
        console.log(JSON.stringify(data, null, 2));
        console.log('---CATEGORIES_END---');
    }
}
check();
