
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as defaultSupabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AppSetting {
    key: string;
    value: any;
    description: string | null;
    updated_at: string;
    updated_by: string | null;
}

/**
 * Fetches all application settings from the app_settings table.
 * Returns an object where keys are setting names and values are their corresponding JSON values.
 */
export function useSettings(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    return useQuery({
        queryKey: ['app_settings'],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('app_settings')
                .select('*');

            if (error) {
                console.error('Error fetching settings:', error);
                throw error;
            }

            const settingsObject: Record<string, any> = {};
            (data as any[])?.forEach(setting => {
                settingsObject[setting.key] = setting.value;
            });

            return settingsObject;
        },
    });
}

/**
 * Mutation to update a single application setting.
 */
export function useUpdateSetting(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ key, value }: { key: string; value: any }) => {
            const { data, error } = await (supabaseClient
                .from('app_settings') as any)
                .upsert({
                    key,
                    value,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' })
                .select()
                .single();

            if (error) {
                console.error(`Error updating setting ${key}:`, error);
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['app_settings'] });
        },
    });
}

/**
 * Mutation to update multiple application settings at once.
 */
export function useUpdateSettings(supabaseClient: SupabaseClient<Database> = defaultSupabase) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: Record<string, any>) => {
            const upsertData = Object.entries(updates).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));

            const { error } = await (supabaseClient
                .from('app_settings') as any)
                .upsert(upsertData, { onConflict: 'key' });

            if (error) {
                console.error('Error updating settings:', error);
                throw error;
            }

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['app_settings'] });
            toast.success('Settings saved successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to save settings: ' + error.message);
        }
    });
}
