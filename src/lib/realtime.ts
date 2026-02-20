import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

/**
 * RealtimeManager
 * 
 * A professional singleton service to manage Supabase Realtime channels.
 * Prevents "WebSocket closed before connection established" warnings by 
 * ensuring channels are shared and persisted across rapid React mount/unmount cycles.
 */
class RealtimeManager {
    private channels: Map<string, RealtimeChannel> = new Map();
    private subscribers: Map<string, number> = new Map();

    /**
     * Get or create a stable channel instance
     */
    public getChannel(client: SupabaseClient, topic: string): RealtimeChannel {
        let channel = this.channels.get(topic);

        if (!channel) {
            channel = client.channel(topic);
            this.channels.set(topic, channel);
            this.subscribers.set(topic, 0);
        }

        return channel;
    }

    /**
     * Increment subscriber count and subscribe if first
     */
    public subscribe(topic: string, onSubscribe?: () => void) {
        const count = this.subscribers.get(topic) || 0;
        this.subscribers.set(topic, count + 1);

        const channel = this.channels.get(topic);
        if (channel && count === 0) {
            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED' && onSubscribe) {
                    onSubscribe();
                }
            });
        }
    }

    /**
     * Decrement subscriber count and remove/unsubscribe ONLY if last
     * We use a delay to handle React Strict Mode's rapid mount/unmount/remount
     */
    public unsubscribe(client: SupabaseClient, topic: string) {
        const count = this.subscribers.get(topic) || 0;
        if (count <= 0) return;

        const newCount = count - 1;
        this.subscribers.set(topic, newCount);

        if (newCount === 0) {
            // Wait slightly before actually removing to see if it remounts (Strict Mode)
            setTimeout(() => {
                const currentCount = this.subscribers.get(topic) || 0;
                if (currentCount === 0) {
                    const channel = this.channels.get(topic);
                    if (channel) {
                        client.removeChannel(channel).catch(() => { });
                        this.channels.delete(topic);
                    }
                }
            }, 1000);
        }
    }
}

export const realtimeManager = new RealtimeManager();
