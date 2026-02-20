import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Ticket, Edit, Trash2, Calendar, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

interface Coupon {
    id: string;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
    first_order_only: boolean;
    created_at: string;
}

const AdminCoupons = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discount_type: "percentage" as 'percentage' | 'fixed',
        discount_value: "",
        min_purchase_amount: "0",
        max_discount_amount: "",
        usage_limit: "",
        valid_until: "",
        is_active: true,
        first_order_only: false,
    });

    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['admin-coupons'],
        queryFn: async () => {
            const { data, error } = await supabaseAdmin
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Coupon[];
        }
    });

    const createCouponMutation = useMutation({
        mutationFn: async (couponData: any) => {
            const { error } = await (supabaseAdmin
                .from('coupons') as any)
                .insert([couponData]);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success("Coupon created successfully");
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error("Failed to create coupon", {
                description: error.message
            });
        }
    });

    const updateCouponMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { error } = await (supabaseAdmin
                .from('coupons') as any)
                .update(data)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success("Coupon updated successfully");
            setIsDialogOpen(false);
            setEditingCoupon(null);
            resetForm();
        },
        onError: (error: any) => {
            toast.error("Failed to update coupon", {
                description: error.message
            });
        }
    });

    const deleteCouponMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabaseAdmin
                .from('coupons')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success("Coupon deleted successfully");
            setCouponToDelete(null);
        },
        onError: (error: any) => {
            toast.error("Failed to delete coupon", {
                description: error.message
            });
        }
    });

    const resetForm = () => {
        setFormData({
            code: "",
            description: "",
            discount_type: "percentage",
            discount_value: "",
            min_purchase_amount: "0",
            max_discount_amount: "",
            usage_limit: "",
            valid_until: "",
            is_active: true,
            first_order_only: false,
        });
        setEditingCoupon(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const couponData = {
            code: formData.code.toUpperCase(),
            description: formData.description,
            discount_type: formData.discount_type,
            discount_value: parseFloat(formData.discount_value),
            min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
            max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            valid_until: formData.valid_until || null,
            is_active: formData.is_active,
            first_order_only: formData.first_order_only,
        };

        if (editingCoupon) {
            updateCouponMutation.mutate({ id: editingCoupon.id, data: couponData });
        } else {
            createCouponMutation.mutate(couponData);
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || "",
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value.toString(),
            min_purchase_amount: coupon.min_purchase_amount.toString(),
            max_discount_amount: coupon.max_discount_amount?.toString() || "",
            usage_limit: coupon.usage_limit?.toString() || "",
            valid_until: coupon.valid_until ? format(new Date(coupon.valid_until), 'yyyy-MM-dd') : "",
            is_active: coupon.is_active,
            first_order_only: coupon.first_order_only || false,
        });
        setIsDialogOpen(true);
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCouponStatus = (coupon: Coupon) => {
        if (!coupon.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-700 border-gray-200' };
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' };
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return { label: 'Used Up', color: 'bg-orange-100 text-orange-700 border-orange-200' };
        return { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' };
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-[#1A1A1A] tracking-tight">Coupons & Offers</h1>
                    <p className="text-muted-foreground mt-1 font-body text-sm italic">Manage discount coupons and promotional offers.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        resetForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-luxury-gold hover:bg-luxury-gold/90 text-white rounded-2xl px-6 py-6 font-bold uppercase tracking-widest text-xs shadow-lg shadow-luxury-gold/20">
                            <Plus size={16} className="mr-2" />
                            Create Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#FDFBF9] border-[#E8E1D9] rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-2xl">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-1">
                                {editingCoupon ? "Modify the parameters of this promotional offer." : "Configure a new discount code for your patrons."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="code" className="text-xs font-bold uppercase tracking-widest">Coupon Code *</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="WELCOME10"
                                        required
                                        className="mt-2 uppercase"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Welcome discount for new customers"
                                        className="mt-2"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="discount_type" className="text-xs font-bold uppercase tracking-widest">Discount Type *</Label>
                                    <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: value })}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="discount_value" className="text-xs font-bold uppercase tracking-widest">
                                        Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                                    </Label>
                                    <Input
                                        id="discount_value"
                                        type="number"
                                        step="0.01"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        placeholder={formData.discount_type === 'percentage' ? '10' : '500'}
                                        required
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="min_purchase" className="text-xs font-bold uppercase tracking-widest">Min Purchase (₹)</Label>
                                    <Input
                                        id="min_purchase"
                                        type="number"
                                        step="0.01"
                                        value={formData.min_purchase_amount}
                                        onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                                        placeholder="0"
                                        className="mt-2"
                                    />
                                </div>
                                {formData.discount_type === 'percentage' && (
                                    <div>
                                        <Label htmlFor="max_discount" className="text-xs font-bold uppercase tracking-widest">Max Discount (₹)</Label>
                                        <Input
                                            id="max_discount"
                                            type="number"
                                            step="0.01"
                                            value={formData.max_discount_amount}
                                            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                            placeholder="1000"
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label htmlFor="usage_limit" className="text-xs font-bold uppercase tracking-widest">Usage Limit</Label>
                                    <Input
                                        id="usage_limit"
                                        type="number"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                        placeholder="Unlimited"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="valid_until" className="text-xs font-bold uppercase tracking-widest">Valid Until</Label>
                                    <Input
                                        id="valid_until"
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <div className="flex items-center justify-between p-5 bg-[#FAF7F5] border border-[#E8E1D9]/50 rounded-2xl shadow-sm transition-all hover:bg-[#F5F1EE]">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <Label htmlFor="is_active" className="text-[11px] font-black uppercase tracking-wider cursor-pointer">Status: {formData.is_active ? 'Active' : 'Inactive'}</Label>
                                                <p className="text-[10px] text-muted-foreground">Enable or disable this coupon immediately</p>
                                            </div>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-luxury-gold/5 border border-luxury-gold/20 rounded-2xl shadow-sm transition-all hover:bg-luxury-gold/10">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${formData.first_order_only ? 'bg-luxury-gold text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <TrendingUp size={20} />
                                            </div>
                                            <div>
                                                <Label htmlFor="first_order_only" className="text-[11px] font-black uppercase tracking-wider cursor-pointer">New Customers Only</Label>
                                                <p className="text-[10px] text-muted-foreground italic">Proper logic: Apply only to user's very first order</p>
                                            </div>
                                        </div>
                                        <Switch
                                            id="first_order_only"
                                            checked={formData.first_order_only}
                                            onCheckedChange={(checked) => setFormData({ ...formData, first_order_only: checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        resetForm();
                                    }}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
                                    className="bg-luxury-gold hover:bg-luxury-gold/90 text-white rounded-xl"
                                >
                                    {createCouponMutation.isPending || updateCouponMutation.isPending ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            {editingCoupon ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        editingCoupon ? 'Update Coupon' : 'Create Coupon'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-[#E8E1D9] shadow-luxury overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-4 bg-[#FAF7F5]/30">
                    <div className="relative max-w-sm">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search coupons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 font-body border-[#E8E1D9] focus-visible:ring-luxury-gold/20 h-12 bg-white rounded-2xl"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <Loader2 size={32} className="text-luxury-gold animate-spin" />
                        </div>
                    ) : filteredCoupons.length === 0 ? (
                        <div className="text-center py-32">
                            <Ticket className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground font-body text-sm italic">
                                {searchTerm ? `No coupons found matching "${searchTerm}"` : "No coupons created yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-body">
                                <thead className="bg-[#FAF7F5] text-muted-foreground uppercase text-[10px] tracking-[0.2em] font-black border-b border-[#E8E1D9]">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Code</th>
                                        <th className="px-6 py-4 text-left">Discount</th>
                                        <th className="px-6 py-4 text-center">Usage</th>
                                        <th className="px-6 py-4 text-center">Valid Until</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredCoupons.map((coupon) => {
                                        const status = getCouponStatus(coupon);
                                        return (
                                            <tr key={coupon.id} className="hover:bg-white/80 transition-all duration-300">
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-luxury-gold text-base">{coupon.code}</div>
                                                    {coupon.description && (
                                                        <div className="text-xs text-muted-foreground mt-1">{coupon.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold">
                                                        {coupon.discount_type === 'percentage'
                                                            ? `${coupon.discount_value}%`
                                                            : `₹${coupon.discount_value}`}
                                                    </div>
                                                    {coupon.min_purchase_amount > 0 && (
                                                        <div className="text-xs text-muted-foreground">Min: ₹{coupon.min_purchase_amount}</div>
                                                    )}
                                                    {coupon.first_order_only && (
                                                        <div className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded-md bg-luxury-gold/10 text-[9px] font-black uppercase tracking-tighter text-luxury-gold">
                                                            First Order Only
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm">
                                                        {coupon.used_count} / {coupon.usage_limit || '∞'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {coupon.valid_until ? (
                                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar size={12} />
                                                            {format(new Date(coupon.valid_until), 'MMM dd, yyyy')}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No expiry</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(coupon)}
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-luxury-gold hover:bg-luxury-gold/10 rounded-full"
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setCouponToDelete(coupon)}
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!couponToDelete} onOpenChange={(open) => !open && setCouponToDelete(null)}>
                <AlertDialogContent className="bg-[#FDFBF9] border-[#E8E1D9] rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-xl">Delete Coupon</AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-sm">
                            Are you sure you want to delete the coupon <strong>{couponToDelete?.code}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => couponToDelete && deleteCouponMutation.mutate(couponToDelete.id)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                            {deleteCouponMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminCoupons;
