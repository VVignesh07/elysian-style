import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Search,
    Plus,
    Trash2,
    ShoppingBag,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/hooks/useProducts";
import { OrderStatus, ShippingAddress } from "@/types/order.types";

interface ManualOrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    selected_size: string | null;
    selected_color: string | null;
    image_url: string | null;
}

interface ManualOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ManualOrderDialog = ({ isOpen, onClose }: ManualOrderDialogProps) => {
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India"
    });
    const [orderItems, setOrderItems] = useState<ManualOrderItem[]>([]);
    const [productSearch, setProductSearch] = useState("");

    // Fetch products for selection
    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['admin-products-search', productSearch],
        queryFn: async () => {
            let query = supabaseAdmin
                .from('products')
                .select('*')
                .eq('status', 'Active')
                .limit(10);

            if (productSearch) {
                query = query.ilike('name', `%${productSearch}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Product[];
        }
    });

    const handleAddProduct = (product: Product) => {
        const newItem: ManualOrderItem = {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            price: product.discount_price || product.price,
            selected_size: product.sizes.length > 0 ? product.sizes[0] : null,
            selected_color: product.colors.length > 0 ? product.colors[0] : null,
            image_url: product.images.length > 0 ? product.images[0] : null
        };
        setOrderItems([...orderItems, newItem]);
        setProductSearch("");
    };

    const handleUpdateItem = (index: number, updates: Partial<ManualOrderItem>) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], ...updates };
        setOrderItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const createOrderMutation = useMutation({
        mutationFn: async () => {
            // 1. Create order
            const shipping_address: ShippingAddress = {
                street: customerInfo.street,
                city: customerInfo.city,
                state: customerInfo.state,
                postal_code: customerInfo.postal_code,
                country: customerInfo.country
            };

            const { data: order, error: orderError } = await supabaseAdmin
                .from('orders')
                .insert({
                    customer_name: customerInfo.name,
                    email: customerInfo.email || `${customerInfo.phone}@whatsapp.manual`,
                    phone: customerInfo.phone,
                    shipping_address: shipping_address as any,
                    total_amount: totalAmount,
                    payment_method: 'WhatsApp/Manual',
                    payment_status: 'Paid',
                    status: 'Processing' as OrderStatus
                } as any)
                .select()
                .single();

            if (orderError) throw orderError;
            if (!order) throw new Error("Order creation failed - no data returned");

            // 2. Create order items
            const itemsToInsert = orderItems.map(item => ({
                order_id: (order as any).id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                selected_size: item.selected_size,
                selected_color: item.selected_color,
                image_url: item.image_url
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('order_items')
                .insert(itemsToInsert as any);

            if (itemsError) throw itemsError;

            return order;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.success("Manual order created successfully!");
            handleClose();
        },
        onError: (error: any) => {
            console.error("Order Creation Error:", error);
            toast.error("Failed to create order", { description: error.message });
        }
    });

    const handleClose = () => {
        setStep(1);
        setCustomerInfo({
            name: "",
            email: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: "India"
        });
        setOrderItems([]);
        setProductSearch("");
        onClose();
    };

    const isNextDisabled = () => {
        if (step === 1) {
            return !customerInfo.name || !customerInfo.phone || !customerInfo.street || !customerInfo.city;
        }
        return orderItems.length === 0;
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-[#E8E1D9] shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <ShoppingBag size={20} />
                        </div>
                        Create WhatsApp Order
                    </DialogTitle>
                    <DialogDescription className="font-body italic pt-1">
                        Manually record orders received via WhatsApp or alternative channels.
                    </DialogDescription>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-4 py-8">
                    <div className={`flex items-center gap-2 ${step === 1 ? 'text-luxury-gold' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === 1 ? 'border-luxury-gold bg-luxury-gold text-white' : 'border-[#E8E1D9]'}`}>1</div>
                        <span className="text-xs font-black uppercase tracking-widest leading-none">Customer info</span>
                    </div>
                    <div className="w-12 h-[1px] bg-[#E8E1D9]" />
                    <div className={`flex items-center gap-2 ${step === 2 ? 'text-luxury-gold' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === 2 ? 'border-luxury-gold bg-luxury-gold text-white' : 'border-[#E8E1D9]'}`}>2</div>
                        <span className="text-xs font-black uppercase tracking-widest leading-none">Items & Finish</span>
                    </div>
                </div>

                {step === 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="cust_name" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                    <CheckCircle2 size={12} className="text-green-500" /> Customer Name *
                                </Label>
                                <Input
                                    id="cust_name"
                                    value={customerInfo.name}
                                    onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                    placeholder="e.g. Rahul Sharma"
                                    className="rounded-xl border-[#E8E1D9] focus-visible:ring-luxury-gold/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cust_phone" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                    <CheckCircle2 size={12} className="text-green-500" /> WhatsApp Number *
                                </Label>
                                <Input
                                    id="cust_phone"
                                    value={customerInfo.phone}
                                    onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className="rounded-xl border-[#E8E1D9] focus-visible:ring-luxury-gold/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cust_email" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                    Email Address <span className="text-[8px] opacity-40 italic ml-1">(Optional)</span>
                                </Label>
                                <Input
                                    id="cust_email"
                                    value={customerInfo.email}
                                    onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    placeholder="customer@email.com"
                                    className="rounded-xl border-[#E8E1D9] focus-visible:ring-luxury-gold/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="cust_street" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                    <CheckCircle2 size={12} className="text-green-500" /> Delivery Address *
                                </Label>
                                <Input
                                    id="cust_street"
                                    value={customerInfo.street}
                                    onChange={e => setCustomerInfo({ ...customerInfo, street: e.target.value })}
                                    placeholder="Flat No, Street, Area"
                                    className="rounded-xl border-[#E8E1D9] focus-visible:ring-luxury-gold/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cust_city" className="text-[10px] font-black uppercase tracking-widest opacity-60">City *</Label>
                                    <Input
                                        id="cust_city"
                                        value={customerInfo.city}
                                        onChange={e => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                                        placeholder="City"
                                        className="rounded-xl border-[#E8E1D9] focus-visible:ring-luxury-gold/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cust_state" className="text-[10px] font-black uppercase tracking-widest opacity-60">State *</Label>
                                    <Input
                                        id="cust_state"
                                        value={customerInfo.state}
                                        onChange={e => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                                        placeholder="State"
                                        className="rounded-xl border-[#E8E1D9] focus-visible:ring-luxury-gold/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cust_zip" className="text-[10px] font-black uppercase tracking-widest opacity-60">Pincode *</Label>
                                <Input
                                    id="cust_zip"
                                    value={customerInfo.postal_code}
                                    onChange={e => setCustomerInfo({ ...customerInfo, postal_code: e.target.value })}
                                    placeholder="600001"
                                    className="rounded-xl border-[#E8E1D9] focus-visible:ring-luxury-gold/20"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-4">
                        <div className="md:col-span-4 space-y-6 bg-[#FAF7F5]/50 p-6 rounded-[2rem] border border-[#E8E1D9]/50">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Search Products</Label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={productSearch}
                                        onChange={e => setProductSearch(e.target.value)}
                                        placeholder="Find item..."
                                        className="pl-10 rounded-xl border-[#E8E1D9] bg-white h-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                {productsLoading ? (
                                    <Loader2 size={24} className="mx-auto animate-spin text-luxury-gold my-8" />
                                ) : products.length === 0 ? (
                                    <p className="text-[10px] text-center italic text-muted-foreground py-8">No matching active products</p>
                                ) : products.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleAddProduct(product)}
                                        className="w-full p-3 rounded-xl border border-transparent hover:border-luxury-gold hover:bg-luxury-gold/5 flex items-center justify-between group transition-all"
                                    >
                                        <div className="text-left overflow-hidden">
                                            <p className="text-xs font-bold truncate pr-2">{product.name}</p>
                                            <p className="text-[10px] text-luxury-gold font-black mt-0.5">₹{(product.discount_price || product.price).toLocaleString('en-IN')}</p>
                                        </div>
                                        <Plus size={16} className="text-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center justify-between">
                                    Order Items ({orderItems.length})
                                    <span className="text-luxury-gold font-black">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
                                </Label>

                                <div className="space-y-4 min-h-[300px]">
                                    {orderItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-[#E8E1D9] rounded-[2rem] text-center gap-4">
                                            <ShoppingBag className="w-10 h-10 text-[#E8E1D9]" />
                                            <p className="text-xs italic text-muted-foreground">Select products from the left to build the order.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                            {orderItems.map((item, index) => (
                                                <div key={index} className="bg-white p-5 rounded-2xl border border-[#E8E1D9] flex gap-4 relative group">
                                                    {item.image_url ? (
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 bg-[#FDFBF9] rounded-xl flex items-center justify-center border border-[#E8E1D9] text-[#E8E1D9] flex-shrink-0">
                                                            <ShoppingBag size={20} />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex justify-between">
                                                            <h4 className="text-sm font-bold truncate max-w-[200px]">{item.product_name}</h4>
                                                            <button
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-4">
                                                            <div className="col-span-1 space-y-1">
                                                                <Label className="text-[8px] uppercase tracking-widest opacity-40">Qty</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={e => handleUpdateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                                                                    className="h-8 rounded-lg text-xs"
                                                                />
                                                            </div>
                                                            <div className="col-span-1.5 space-y-1">
                                                                <Label className="text-[8px] uppercase tracking-widest opacity-40">Size</Label>
                                                                <Input
                                                                    value={item.selected_size || ''}
                                                                    onChange={e => handleUpdateItem(index, { selected_size: e.target.value })}
                                                                    placeholder="M, L..."
                                                                    className="h-8 rounded-lg text-xs"
                                                                />
                                                            </div>
                                                            <div className="col-span-1.5 space-y-1">
                                                                <Label className="text-[8px] uppercase tracking-widest opacity-40">Color</Label>
                                                                <Input
                                                                    value={item.selected_color || ''}
                                                                    onChange={e => handleUpdateItem(index, { selected_color: e.target.value })}
                                                                    placeholder="Black..."
                                                                    className="h-8 rounded-lg text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-8 gap-3 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={step === 1 ? handleClose : () => setStep(1)}
                        disabled={createOrderMutation.isPending}
                        className="font-body text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#FDFBF9]"
                    >
                        {step === 1 ? 'Discard' : 'Back'}
                    </Button>

                    <Button
                        onClick={step === 1 ? () => setStep(2) : () => createOrderMutation.mutate()}
                        disabled={isNextDisabled() || createOrderMutation.isPending}
                        className="font-body text-[10px] font-black uppercase tracking-widest bg-coco-bean hover:bg-coco-bean/90 text-white rounded-xl h-11 px-8 shadow-lg shadow-coco-bean/20"
                    >
                        {createOrderMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                        {step === 1 ? (
                            <>Construct Order <Plus size={14} className="ml-2" /></>
                        ) : (
                            <>Initialize Shipment <CheckCircle2 size={14} className="ml-2" /></>
                        )}
                    </Button>
                </DialogFooter>

                {createOrderMutation.isError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                        <AlertCircle size={18} />
                        <p className="text-xs font-body italic">Processing failed. Critical system error detected.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ManualOrderDialog;
