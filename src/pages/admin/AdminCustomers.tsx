import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Calendar, ShoppingBag, Trash2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TableSkeleton = () => (
    <div className="space-y-4 p-8">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-border/10">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-16 rounded-full ml-auto" />
            </div>
        ))}
    </div>
);
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

import { useAdminCustomers } from "@/hooks/useCustomers";

const AdminCustomers = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 20;
    const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);
    const queryClient = useQueryClient();

    const { data: customers = [], isLoading } = useAdminCustomers(supabaseAdmin);

    const deleteCustomerMutation = useMutation({
        mutationFn: async (customer: any) => {
            if (customer.is_registered) {
                // Call RPC to delete registered user
                const { error } = await supabaseAdmin.rpc('delete_user_by_admin', { target_user_id: customer.id });
                if (error) throw error;
            } else {
                // For guests, we delete their orders based on email
                const { error } = await supabaseAdmin
                    .from('orders')
                    .delete()
                    .eq('email', customer.email);

                if (error) throw error;
            }
        },
        onMutate: async (customer) => {
            await queryClient.cancelQueries({ queryKey: ['admin-customers'] });
            const previousCustomers = queryClient.getQueryData(['admin-customers']);

            queryClient.setQueryData(['admin-customers'], (old: any) => {
                if (!old) return old;
                return old.filter((c: any) => c.id !== customer.id);
            });

            return { previousCustomers };
        },
        onError: (error, variables, context) => {
            if (context?.previousCustomers) {
                queryClient.setQueryData(['admin-customers'], context.previousCustomers);
            }
            console.error("Delete Error:", error);
            toast.error("Failed to delete customer", {
                description: error.message || "Please ensure you have run the database migration script."
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
        },
        onSuccess: () => {
            toast.success("Customer record removed successfully");
            setCustomerToDelete(null);
        },
    });

    const filteredCustomers = customers.filter((c: any) =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedCustomers = filteredCustomers.slice(page * pageSize, (page + 1) * pageSize);
    const totalCount = filteredCustomers.length;

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Customers</h1>
                    <p className="text-muted-foreground mt-1">View and manage your customer base.</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <TableSkeleton />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-body text-left">
                                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Customer</th>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3">Joined</th>
                                        <th className="px-4 py-3 text-center">Orders</th>
                                        <th className="px-4 py-3 text-right">Total Spent</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {paginatedCustomers.map((customer: any) => (
                                        <tr key={customer.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-[#332D2D]">{customer.full_name}</div>
                                                {!customer.is_registered && (
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Guest</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail size={12} /> {customer.email}
                                                </div>
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <Phone size={12} /> {customer.phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-luxury-gold/5 text-luxury-gold font-bold text-xs">
                                                    <ShoppingBag size={10} />
                                                    {customer.total_orders || 0}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ₹{(customer.total_spent || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCustomerToDelete(customer)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalCount > pageSize && !isLoading && (
                        <div className="px-8 py-6 border-t border-[#E8E1D9]/40 flex items-center justify-between bg-[#FAF7F5]/20 mt-4 rounded-b-2xl">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-body">
                                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} records
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest font-body border-[#E8E1D9]"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={(page + 1) * pageSize >= totalCount}
                                    onClick={() => setPage(p => p + 1)}
                                    className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest font-body border-[#E8E1D9]"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isLoading && filteredCustomers.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchTerm ? `No customers found matching "${searchTerm}"` : "No customers found."}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
                <AlertDialogContent className="bg-[#FDFBF9] border-[#E8E1D9] rounded-3xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-xl">Confirm Customer Removal</AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-sm text-muted-foreground">
                            You are about to remove <strong>{customerToDelete?.full_name}</strong>.
                            {customerToDelete?.is_registered ? (
                                <span className="block mt-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-xs font-semibold">
                                    <AlertCircle className="inline w-3 h-3 mr-1 mb-0.5" />
                                    Warning: This will permanently delete the User Account and all associated Orders from the database.
                                </span>
                            ) : (
                                <span className="block mt-2">This will remove all orders associated with this guest email.</span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl border-[#E8E1D9] font-body text-xs font-bold uppercase tracking-widest h-10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (customerToDelete) deleteCustomerMutation.mutate(customerToDelete);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-body text-xs font-bold uppercase tracking-widest h-10 shadow-lg shadow-red-600/20"
                        >
                            {deleteCustomerMutation.isPending ? "Deleting..." : "Confirm Removal"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminCustomers;
