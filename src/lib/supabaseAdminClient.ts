import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// In a real production app, you would use the service_role key here ONLY on the server.
// On the client, this is a separate instance with its own session storage
// to prevent clashing with the standard customer session.
const createSupabaseAdminClient = () => createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'zero-fashion-admin-auth-token',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
    }
});

// Singleton pattern to prevent multiple instances during development/HMR
export const supabaseAdmin = (import.meta.env.MODE === 'development')
    ? ((globalThis as any).supabaseAdminClient ??= createSupabaseAdminClient())
    : createSupabaseAdminClient();
