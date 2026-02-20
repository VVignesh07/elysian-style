
const { createClient } = require('@supabase/supabase-js');
// Load env vars manually if needed, or just use process.env if they are present
// Since I'm running in the workspace, .env should be there, but I'll use a simpler way if possible.
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
    console.error("Env vars not found");
    process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseAnonKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function check() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}
check();
