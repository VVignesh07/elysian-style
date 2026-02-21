import { useState, useEffect } from "react";
import {
    Bell,
    Package,
    CheckCircle2,
    X,
    Clock,
    ExternalLink,
    Trash2,
    Loader2
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { realtimeManager } from "@/lib/realtime";

interface AdminNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    order_id: string | null;
    is_read: boolean;
    created_at: string;
}

const NotificationPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch notifications
    const { data: notifications = [], isLoading } = useQuery<AdminNotification[]>({
        queryKey: ['admin-notifications'],
        queryFn: async () => {
            const { data, error } = await supabaseAdmin
                .from('admin_notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as AdminNotification[];
        }
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Real-time listener
    useEffect(() => {
        const topic = 'admin-notifications-realtime';
        const channel = realtimeManager.getChannel(supabaseAdmin, topic);

        channel.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'admin_notifications'
            },
            (payload) => {
                queryClient.setQueryData(['admin-notifications'], (old: any) => [payload.new, ...(old || [])]);

                if (payload.new.type === 'new_order') {
                    // Play notification sound
                    try {
                        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                        audio.volume = 0.7; // 70% volume
                        audio.play().catch(e => console.log('Audio playback blocked by browser:', e));
                    } catch (err) {
                        console.error('Failed to play sound', err);
                    }

                    toast.success("New Order Received!", {
                        description: payload.new.message,
                        icon: <Package className="text-luxury-gold" />,
                        action: {
                            label: "View",
                            onClick: () => navigate(`/admin/orders`)
                        }
                    });
                }
            }
        );

        realtimeManager.subscribe(topic);

        return () => {
            realtimeManager.unsubscribe(supabaseAdmin, topic);
        };
    }, [queryClient, navigate]);

    // Mark as read mutation
    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabaseAdmin
                .from('admin_notifications') as any)
                .update({ is_read: true })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
    });

    const clearAll = useMutation({
        mutationFn: async () => {
            const { error } = await supabaseAdmin
                .rpc('mark_all_notifications_read');
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
            toast.success("All notifications marked as read");
        }
    });

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="p-2.5 text-muted-foreground hover:text-luxury-gold transition-all relative group">
                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 rounded-[2rem] border-[#E8E1D9] shadow-2xl overflow-hidden" align="end" sideOffset={10}>
                <div className="bg-gradient-to-r from-[#1A1A1A] to-[#332D2D] p-6 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-1">Alert Center</h3>
                        <p className="text-xs font-bold font-heading">Notifications</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearAll.mutate()}
                            disabled={clearAll.isPending}
                            className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-luxury-gold hover:bg-white/5 h-8 rounded-full"
                        >
                            {clearAll.isPending ? <Loader2 size={12} className="animate-spin text-luxury-gold" /> : 'Mark all read'}
                        </Button>
                    )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="py-20 flex items-center justify-center">
                            <Loader2 size={32} className="animate-spin text-luxury-gold" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#FAF8F6] flex items-center justify-center text-muted-foreground/20 border border-[#E8E1D9]">
                                <Bell size={32} />
                            </div>
                            <h4 className="text-xs font-bold text-[#332D2D]">Serene Horizons</h4>
                            <p className="text-[10px] text-muted-foreground font-body italic">No new signals detected from the commercial front.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E8E1D9]/30">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-5 hover:bg-[#FDFBF9] transition-all relative group cursor-pointer ${!notification.is_read ? 'bg-luxury-gold/5 border-l-4 border-l-luxury-gold' : ''}`}
                                    onClick={() => {
                                        if (!notification.is_read) markAsRead.mutate(notification.id);
                                        setIsOpen(false);
                                        navigate('/admin/orders');
                                    }}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${!notification.is_read ? 'bg-white border-luxury-gold/20 text-luxury-gold' : 'bg-[#FAF8F6] border-[#E8E1D9] text-muted-foreground opacity-60'
                                            }`}>
                                            {notification.type === 'new_order' ? <Package size={18} /> : <CheckCircle2 size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className={`text-xs font-bold truncate ${!notification.is_read ? 'text-[#332D2D]' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[8px] font-bold text-muted-foreground whitespace-nowrap opacity-60 flex items-center gap-1">
                                                    <Clock size={8} />
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className={`text-[10px] leading-relaxed font-body line-clamp-2 mb-2 ${!notification.is_read ? 'text-[#332D2D]/70' : 'text-muted-foreground/60 opacity-80'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    Analyze Details <ExternalLink size={8} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse lg:opacity-0 group-hover:opacity-100" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-[#FAF8F6] border-t border-[#E8E1D9] text-center">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/admin/orders');
                        }}
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-[#332D2D] hover:text-luxury-gold transition-colors"
                    >
                        View Comprehensive Registry
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationPanel;
