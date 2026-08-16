import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Eye,
    CheckCircle,
    Truck,
    XCircle,
    Clock,
    MoreHorizontal,
    Package,
    MapPin,
    Users,
    ShoppingBag,
    ChevronRight,
    MessageCircle,
    Download,
    AlertCircle,
    Trash2,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { realtimeManager } from "@/lib/realtime";
import { format } from "date-fns";
import { OrderDB, OrderStatus } from "@/types/order.types";
import { getOrderItemImage, handleImageError } from "@/utils/orderImageUtils";

import { useAdminOrders } from "@/hooks/useOrders";

import { Skeleton } from "@/components/ui/skeleton";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import AdminPagination from "@/components/admin/AdminPagination";

const TableSkeleton = () => (
    <div className="space-y-4 p-8">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-border/10">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16 rounded-full ml-auto" />
            </div>
        ))}
    </div>
);

const AdminOrders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 20;

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [trackingInput, setTrackingInput] = useState("");
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch Orders with server-side pagination
    const { data, isLoading, error: fetchError } = useAdminOrders(page, pageSize, searchTerm, supabaseAdmin);
    const orders = data?.orders || [];
    const totalCount = data?.totalCount || 0;

    const selectedOrder = useMemo(() =>
        orders.find(o => o.id === selectedOrderId),
        [orders, selectedOrderId]);

    const timelineSteps = useMemo(() => {
        if (!selectedOrder) return [];
        const statuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];
        const currentIndex = statuses.indexOf(selectedOrder.status as OrderStatus);
        const isCancelled = selectedOrder.status === "Cancelled";

        return statuses.map((step, index) => ({
            step,
            isCompleted: !isCancelled && index < currentIndex,
            isCurrent: !isCancelled && index === currentIndex,
            isCancelled: isCancelled && index === currentIndex
        }));
    }, [selectedOrder]);

    // Real-time updates
    useEffect(() => {
        const topic = 'admin-orders-realtime';
        const channel = realtimeManager.getChannel(supabaseAdmin, topic);

        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders'
            },
            () => {
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                queryClient.invalidateQueries({ queryKey: ['admin-dashboard-orders'] });
            }
        );

        realtimeManager.subscribe(topic);

        return () => {
            realtimeManager.unsubscribe(supabaseAdmin, topic);
        };
    }, [queryClient]);

    // Update Status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
            const { error } = await supabaseAdmin
                .from('orders' as any)
                .update({ status } as any)
                .eq('id', id);

            if (error) throw error;
        },
        onMutate: async ({ id, status }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['admin-orders'] });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(['admin-orders']);

            // Optimistically update to the new value
            queryClient.setQueryData(['admin-orders'], (old: any) => {
                if (!old || !old.orders) return old;
                return {
                    ...old,
                    orders: old.orders.map((order: any) =>
                        order.id === id ? { ...order, status } : order
                    )
                };
            });

            // Return a context object with the snapshotted value
            return { previousData };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData) {
                queryClient.setQueryData(['admin-orders'], context.previousData);
            }
            toast.error("Process failed", { description: err.message });
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server sync
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard-orders'] });
        },
        onSuccess: () => {
            toast.success("Order status synchronized");
        },
    });

    // Update Tracking Mutation
    const updateTrackingMutation = useMutation({
        mutationFn: async ({ id, tracking_number }: { id: string; tracking_number: string }) => {
            const { error } = await supabaseAdmin
                .from('orders')
                .update({ tracking_number })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.success("Tracking registers updated");
        },
        onError: (error) => {
            toast.error("Update failed", { description: error.message });
        }
    });

    // Delete Order Mutation
    const deleteOrderMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error, count } = await supabaseAdmin
                .from('orders')
                .delete({ count: 'exact' })
                .eq('id', id);

            if (error) throw error;
            if (count === 0) {
                throw new Error("Order could not be deleted. This may be due to missing 'DELETE' permissions in the database.");
            }
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['admin-orders'] });
            const previousData = queryClient.getQueryData(['admin-orders']);

            queryClient.setQueryData(['admin-orders'], (old: any) => {
                if (!old || !old.orders) return old;
                return {
                    ...old,
                    orders: old.orders.filter((order: any) => order.id !== id),
                    totalCount: Math.max(0, (old.totalCount || 0) - 1)
                };
            });

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['admin-orders'], context.previousData);
            }
            toast.error("Deletion failed", { description: err.message });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard-orders'] });
        },
        onSuccess: () => {
            toast.success("Order record permanently deleted");
            setOrderToDelete(null);
        },
    });

    const handleDeleteOrder = () => {
        if (orderToDelete) {
            deleteOrderMutation.mutate(orderToDelete);
        }
    };

    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setPage(0);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-green-50 text-green-700 border-green-100";
            case "Processing": return "bg-blue-50 text-blue-700 border-blue-100";
            case "Shipped": return "bg-purple-50 text-purple-700 border-purple-100";
            case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-yellow-50 text-yellow-700 border-yellow-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Delivered": return <CheckCircle size={14} className="mr-1.5" />;
            case "Processing": return <Clock size={14} className="mr-1.5" />;
            case "Shipped": return <Truck size={14} className="mr-1.5" />;
            case "Cancelled": return <XCircle size={14} className="mr-1.5" />;
            default: return <Clock size={14} className="mr-1.5" />;
        }
    };

    const updateStatus = (id: string, newStatus: OrderStatus) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    const handleViewDetails = (order: OrderDB) => {
        setSelectedOrderId(order.id);
        setTrackingInput(order.tracking_number || "");
        setIsDetailsOpen(true);
    };

    const handleUpdateTracking = () => {
        if (selectedOrderId) {
            updateTrackingMutation.mutate({ id: selectedOrderId, tracking_number: trackingInput });
        }
    };

    const handleWhatsAppConfirmation = (order: OrderDB) => {
        const itemsList = order.order_items?.map(item =>
            `- ${item.product_name} (${item.selected_size || 'N/A'}, ${item.selected_color || 'N/A'}) x${item.quantity}`
        ).join('\n');

        const message = `*Order Confirmation - Zero Fashion* 
\nDear ${order.customer_name},
\nThank you for your recent purchase! We are pleased to confirm your order.
\n*Order ID:* #${order.order_number}
*Date:* ${format(new Date(order.created_at), 'MMM dd, yyyy')}
*Total Amount:* ₹${order.total_amount.toLocaleString('en-IN')}
\n*Items Ordered:*
${itemsList}
\n*Shipping Address:*
${order.shipping_address.street}
${order.shipping_address.city}, ${order.shipping_address.state}
${order.shipping_address.postal_code}
\nWe will update you with tracking details as soon as your package is dispatched.
\nFor any queries, feel free to reply to this message.
\nWarm regards,
*Zero Fashion Team*`;

        const encodedMessage = encodeURIComponent(message);
        let phone = order.phone ? order.phone.replace(/[^0-9]/g, '') : '';
        
        // Remove leading zero if user entered 11 digits starting with 0 (e.g., 09876543210)
        if (phone.length === 11 && phone.startsWith('0')) {
            phone = phone.substring(1);
        }

        // Ensure India country code (91) is present if the number is exactly 10 digits long
        if (phone.length === 10) {
            phone = `91${phone}`;
        }
        
        if (!phone || phone.length < 10) {
            alert("Valid Phone number is missing for this order (Needs at least 10 digits).");
            return;
        }

        const url = `https://wa.me/${phone}?text=${encodedMessage}`;
        window.open(url, '_blank');
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        const toastId = toast.loading("Preparing full order report...");

        try {
            // Fetch ALL orders without range limits for a complete export
            const { data: allOrders, error } = await supabaseAdmin
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!allOrders || allOrders.length === 0) {
                toast.error("No orders found to export", { id: toastId });
                return;
            }

            const headers = [
                "Order ID",
                "Order Number",
                "Date",
                "Customer Name",
                "Email",
                "Phone",
                "Shipping Address",
                "Status",
                "Total Amount",
                "Tracking Number",
                "Items"
            ];

            const rows = (allOrders as OrderDB[]).map(order => {
                const address = order.shipping_address
                    ? `${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}, ${order.shipping_address.country}`
                    : "N/A";

                const itemsSummary = order.order_items
                    ?.map(item => `${item.product_name} (x${item.quantity}${item.selected_size ? `, ${item.selected_size}` : ''}${item.selected_color ? `, ${item.selected_color}` : ''})`)
                    .join(" | ") || "No items";

                return [
                    order.id,
                    order.order_number || "N/A",
                    format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss'),
                    order.customer_name,
                    order.email,
                    order.phone || "N/A",
                    address,
                    order.status,
                    order.total_amount,
                    order.tracking_number || "N/A",
                    itemsSummary
                ];
            });

            const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
                + headers.join(",") + "\n"
                + rows.map(e => e.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `zero_fashion_full_orders_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Successfully exported ${allOrders.length} orders`, { id: toastId });
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export orders. Please try again.", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };



    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-[#1A1A1A] tracking-tight">Orders Registry</h1>
                    <p className="text-muted-foreground mt-1 font-body text-sm italic">Overseeing the lifecycle of every order.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        disabled={isExporting}
                        className="font-body text-[10px] font-black uppercase tracking-widest border-[#E8E1D9] hover:bg-[#FDFBF9] h-10 px-6 rounded-xl"
                    >
                        {isExporting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Download size={14} className="mr-2" />}
                        Export Matrix
                    </Button>
                </div>
            </div>

            <Card className="border-[#E8E1D9] shadow-luxury overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-4 bg-[#FAF7F5]/30">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 font-body border-[#E8E1D9] focus-visible:ring-luxury-gold/20 h-12 bg-white rounded-2xl"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : orders.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <p className="text-muted-foreground font-body text-sm italic">
                                {searchTerm ? `No records found matching "${searchTerm}"` : "The order archives are currently pristine."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-body text-left">
                                <thead className="bg-[#FAF7F5] text-muted-foreground uppercase text-[10px] tracking-[0.2em] font-black border-b border-[#E8E1D9]">
                                    <tr>
                                        <th className="px-8 py-5">Summary</th>
                                        <th className="px-8 py-5">Order ID</th>
                                        <th className="px-8 py-5">Customer</th>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Valuation</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/80 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                                                    {order.order_items?.slice(0, 3).map((item, i) => (
                                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-muted relative z-0 hover:z-10 hover:scale-110 transition-transform">
                                                            <img
                                                                src={getOrderItemImage(item, 'THUMBNAIL_SIZE')}
                                                                alt="Product"
                                                                className="h-full w-full object-cover"
                                                                onError={handleImageError}
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    ))}
                                                    {(order.order_items?.length || 0) > 3 && (
                                                        <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-[#FAF7F5] flex items-center justify-center text-[9px] font-black text-muted-foreground z-10">
                                                            +{order.order_items!.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-[11px] text-muted-foreground">
                                                #{order.order_number}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-[#1A1A1A] text-sm tracking-tight mb-0.5">{order.customer_name}</div>
                                                <div className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">{order.email || order.id.slice(0, 8).toUpperCase()}</div>
                                            </td>
                                            <td className="px-8 py-6 text-muted-foreground text-xs font-medium">
                                                {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-8 py-6 font-black text-luxury-gold text-sm tracking-tight">₹{order.total_amount.toLocaleString('en-IN')}</td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 p-0 text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300 rounded-full"
                                                        onClick={() => handleWhatsAppConfirmation(order)}
                                                        title="Send WhatsApp Confirmation"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 p-0 text-muted-foreground hover:text-luxury-gold hover:bg-luxury-gold/5 transition-all duration-300 rounded-full"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        <Eye size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-300 rounded-full"
                                                        onClick={() => setOrderToDelete(order.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-muted-foreground hover:text-luxury-gold hover:bg-luxury-gold/5 transition-all duration-300 rounded-full">
                                                                <MoreHorizontal size={18} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-60 p-2 font-body border-[#E8E1D9] shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                                                            <div className="px-3 py-2 mb-1">
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em]">Process Lifecycle</p>
                                                            </div>
                                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Pending")} className="text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center gap-4 hover:bg-yellow-50 hover:text-yellow-700 transition-colors cursor-pointer group/item">
                                                                <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover/item:bg-yellow-200">
                                                                    <Clock size={16} />
                                                                </div>
                                                                Pending
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Processing")} className="text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center gap-4 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer group/item">
                                                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover/item:bg-blue-200">
                                                                    <Loader2 size={16} className="group-hover/item:animate-spin" />
                                                                </div>
                                                                Processing
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Shipped")} className="text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center gap-4 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer group/item">
                                                                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover/item:bg-purple-200">
                                                                    <Truck size={16} />
                                                                </div>
                                                                Shipped
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Delivered")} className="text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center gap-4 hover:bg-green-50 hover:text-green-700 transition-colors cursor-pointer group/item">
                                                                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600 group-hover/item:bg-green-200">
                                                                    <CheckCircle size={16} />
                                                                </div>
                                                                Delivered
                                                            </DropdownMenuItem>
                                                            <div className="my-2 border-t border-border/40" />
                                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Cancelled")} className="text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center gap-4 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer group/item">
                                                                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover/item:bg-red-200">
                                                                    <XCircle size={16} />
                                                                </div>
                                                                Cancel Order
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>

                {/* Pagination Controls */}
                <div className="bg-[#FAF7F5]/20 border-t border-[#E8E1D9]/40">
                    <AdminPagination
                        currentPage={page}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />
                </div>
            </Card>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-body p-0 border-none shadow-2xl rounded-[2.5rem] bg-[#FDFBF9]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>Details for order #{selectedOrder?.order_number}</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="relative">
                            {/* Modal Header Overlay */}
                            <div className="h-64 bg-gradient-to-r from-[#1A1A1A] to-[#2C2424] p-12 flex flex-col justify-end relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                    <ShoppingBag size={240} className="text-white" />
                                </div>

                                {/* Timeline Stepper */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-lg hidden sm:block">
                                    <div className="flex items-center justify-between relative px-2">
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-0"></div>

                                        {timelineSteps.map((s, i) => (
                                            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                                    ${s.isCompleted || s.isCurrent ? 'bg-luxury-gold border-luxury-gold text-black shadow-[0_0_15px_rgba(215,185,142,0.5)]' : 'bg-[#1A1A1A] border-white/20 text-white/30'}
                                                    ${s.isCancelled && 'bg-red-500 border-red-500 text-white'}
                                                `}>
                                                    {s.isCompleted || s.isCancelled ? (
                                                        s.isCancelled ? <XCircle size={14} /> : <CheckCircle size={14} />
                                                    ) : (
                                                        <span className="text-[10px] font-black">{i + 1}</span>
                                                    )}
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-500
                                                    ${s.isCurrent ? 'text-luxury-gold' : 'text-white/30'}
                                                `}>{s.step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative z-10 w-full flex items-end justify-between mt-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border ${getStatusColor(selectedOrder.status)} shadow-lg bg-white/10 backdrop-blur-md`}>
                                                {selectedOrder.status}
                                            </div>
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Orders Registry</span>
                                        </div>
                                        <h2 className="text-5xl md:text-6xl text-white tracking-wide leading-none" style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
                                            #{selectedOrder.order_number}
                                        </h2>
                                    </div>
                                    <div className="text-right hidden sm:block pb-1">
                                        <p className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.3em] mb-2">Total Valuation</p>
                                        <p className="text-5xl font-heading font-bold text-white">₹{selectedOrder.total_amount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10">
                                <div className="grid lg:grid-cols-12 gap-16">
                                    {/* Left Side: Information */}
                                    <div className="lg:col-span-7 space-y-12">
                                        <div className="grid grid-cols-2 gap-10 pb-10 border-b border-[#E8E1D9]">
                                            <section className="space-y-4">
                                                <div className="flex items-center gap-3 text-luxury-gold mb-2">
                                                    <Users size={16} />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Customer Information</h3>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-[#1A1A1A] text-xl tracking-tight">{selectedOrder.customer_name}</p>
                                                    <p className="text-sm font-medium text-muted-foreground/80">{selectedOrder.email}</p>
                                                    <p className="text-xs font-bold text-muted-foreground/60">{selectedOrder.phone || 'No contact provided'}</p>
                                                </div>
                                            </section>

                                            <section className="space-y-4">
                                                <div className="flex items-center gap-3 text-luxury-gold mb-2">
                                                    <MapPin size={16} />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Delivery Point</h3>
                                                </div>
                                                <div className="space-y-1 text-sm text-foreground/80 font-medium leading-relaxed">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Order ID</p>
                                                    <p className="text-xs font-mono font-bold text-[#1A1A1A]">#{selectedOrder.order_number}</p>
                                                    <p className="font-bold text-[#1A1A1A]">{selectedOrder.shipping_address?.street}</p>
                                                    <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                                                    <p className="text-[10px] font-black tracking-widest opacity-60 uppercase">{selectedOrder.shipping_address?.postal_code}, {selectedOrder.shipping_address?.country}</p>
                                                </div>
                                            </section>
                                        </div>

                                        <section className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Order Breakdown</h3>
                                                <div className="h-[1px] flex-1 bg-border/40"></div>
                                            </div>
                                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                                {selectedOrder.order_items?.map((item) => (
                                                    <div key={item.id} className="flex gap-6 group/item p-3 rounded-2xl border border-transparent hover:border-[#E8E1D9] hover:bg-white transition-all duration-500">
                                                        <div className="h-24 w-24 bg-muted rounded-2xl overflow-hidden flex-shrink-0 relative border border-[#E8E1D9]/50 shadow-inner">
                                                            <img
                                                                src={getOrderItemImage(item, 'MEDIUM_SIZE')}
                                                                alt={item.product_name}
                                                                className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-1000"
                                                                onError={handleImageError}
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                        <div className="flex-1 py-1 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="font-heading text-xl font-semibold text-[#1A1A1A] group-hover/item:text-luxury-gold transition-colors leading-tight mb-2">
                                                                    {item.product_name}
                                                                </h4>
                                                                <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Qty:</span>
                                                                        <span className="text-[10px] font-black text-[#1A1A1A]">{item.quantity}</span>
                                                                    </div>
                                                                    {item.selected_size && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Size:</span>
                                                                            <span className="text-[10px] font-black text-[#1A1A1A]">{item.selected_size}</span>
                                                                        </div>
                                                                    )}
                                                                    {item.selected_color && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Color:</span>
                                                                            <div className="flex items-center gap-2 bg-[#FAF7F5] px-2 py-0.5 rounded-md border border-[#E8E1D9]/50">
                                                                                <ColorSwatch color={item.selected_color} size="xs" />
                                                                                <span className="text-[10px] font-black text-[#1A1A1A]">{item.selected_color}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-lg font-black text-luxury-gold tracking-tighter">₹{item.price.toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Side: Operations */}
                                    <div className="lg:col-span-5 space-y-10">
                                        <div className="bg-white p-8 rounded-[2rem] border border-[#E8E1D9] shadow-luxury space-y-8 sticky top-0">
                                            <section className="space-y-6">
                                                <div className="flex items-center gap-3 text-[#1A1A1A]">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <Truck size={14} />
                                                    </div>
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Logistics Hub</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1">Tracking Secret</label>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="DNA-TRANSIT-ID..."
                                                            value={trackingInput}
                                                            onChange={(e) => setTrackingInput(e.target.value)}
                                                            className="flex-1 px-5 py-4 bg-[#FAF7F5] border border-[#E8E1D9] rounded-2xl focus:outline-none focus:ring-4 focus:ring-luxury-gold/5 focus:border-luxury-gold/40 text-sm font-mono transition-all"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleUpdateTracking}
                                                        disabled={updateTrackingMutation.isPending}
                                                        className="w-full bg-[#1A1A1A] hover:bg-black text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 transform hover:-translate-y-0.5 active:scale-95 transition-all"
                                                    >
                                                        {updateTrackingMutation.isPending ? "Synchronizing..." : "Update Logistics"}
                                                    </Button>
                                                </div>
                                            </section>

                                            <div className="pt-8 border-t border-[#E8E1D9]/60 space-y-4">
                                                <Button
                                                    onClick={() => handleWhatsAppConfirmation(selectedOrder)}
                                                    className="w-full h-16 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all group shadow-xl shadow-[#25D366]/20 transform hover:-translate-y-0.5"
                                                >
                                                    <MessageCircle size={20} className="mr-3 fill-white/20" />
                                                    WhatsApp Confirmation
                                                    <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    className="w-full h-14 border-[#E8E1D9] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#FDFBF9] group"
                                                >
                                                    Concierge Interface
                                                    <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="px-6 space-y-4">
                                            <p className="text-[9px] font-medium text-muted-foreground/60 italic text-center leading-relaxed px-4">
                                                Updates to tracking or status are live reflections in the customer's private portal. Handle with extreme care.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
                <AlertDialogContent className="bg-[#FDFBF9] border-[#E8E1D9] rounded-3xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-xl">Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-sm text-muted-foreground">
                            This action cannot be undone. This will permanently delete the order record and remove all associated data from the registry.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl border-[#E8E1D9] font-body text-xs font-bold uppercase tracking-widest h-10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteOrder}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-body text-xs font-bold uppercase tracking-widest h-10 shadow-lg shadow-red-600/20"
                        >
                            {deleteOrderMutation.isPending ? "Deleting..." : "Confirm Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout >
    );
};

export default AdminOrders;
