import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Loader2, Check, Copy, QrCode } from "lucide-react";

const ALLOWED_COD_PINCODES = [
    '626106', '626129', '626104', '626115', '626109', '626101', // Existing
    '625001', '625002', '625003', '625004', '625005', '625006', '625007', '625008', '625009', '625010',
    '625011', '625012', '625013', '625014', '625015', '625016', '625017', '625018', '625019', '625020'  // Madurai
];


// Schema for form validation
const checkoutSchema = z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(4, "Invalid postal code"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    paymentMethod: z.enum(["cod", "upi"]),
    saveInfo: z.boolean().default(false),
});

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [isProcessing, setIsProcessing] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);

    // Load saved info on initial render
    const getSavedData = () => {
        const saved = localStorage.getItem("savedCheckoutInfo");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing saved checkout info", e);
            }
        }
        return {
            email: "",
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            phone: "",
            paymentMethod: "upi",
            saveInfo: false
        };
    };

    const form = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: getSavedData(),
    });

    const [couponId, setCouponId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

    // Initial check for authentication
    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login", { state: { from: "/checkout" } });
        }
    }, [authLoading, user, navigate]);

    const handleApplyCoupon = async () => {
        const cleanedCode = couponCode.trim().toUpperCase();
        if (!cleanedCode) {
            toast.error("Please enter a coupon code");
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Fetch coupon from database
            const { data: coupon, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', cleanedCode)
                .eq('is_active', true)
                .single();

            if (error || !coupon) {
                toast.error("Invalid or inactive coupon code");
                setDiscount(0);
                setCouponId(null);
                return;
            }

            // 2. Basic Validations
            const now = new Date();
            if (coupon.valid_from && new Date(coupon.valid_from) > now) {
                toast.error("This promotional offer hasn't started yet");
                return;
            }
            if (coupon.valid_until && new Date(coupon.valid_until) < now) {
                toast.error("This coupon has expired");
                return;
            }
            if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
                toast.error("Coupon usage limit has been reached");
                return;
            }
            if (cartTotal < (coupon.min_purchase_amount || 0)) {
                toast.error(`Minimum purchase of ₹${coupon.min_purchase_amount.toLocaleString('en-IN')} required`);
                return;
            }

            // 3. First Order Only Check
            if (coupon.first_order_only) {
                const userEmail = form.getValues('email') || user?.email;

                if (!userEmail) {
                    toast.error("Please enter your email to validate this first-order coupon");
                    return;
                }

                const { count, error: orderCheckError } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('email', userEmail);

                if (orderCheckError) {
                    console.error("Error checking order history:", orderCheckError);
                    throw orderCheckError;
                }

                if (count && count > 0) {
                    toast.error("This coupon is strictly for new customers' first order");
                    setDiscount(0);
                    setCouponId(null);
                    return;
                }
            }

            // 4. Calculate Discount
            let discountAmount = 0;
            if (coupon.discount_type === 'percentage') {
                discountAmount = Math.floor((cartTotal * coupon.discount_value) / 100);
                if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                    discountAmount = coupon.max_discount_amount;
                }
            } else {
                discountAmount = coupon.discount_value;
            }

            // Ensure discount doesn't exceed total
            discountAmount = Math.min(discountAmount, cartTotal);

            setDiscount(discountAmount);
            setCouponId(coupon.id);
            toast.success("Coupon applied successfully!", {
                description: `₹${discountAmount.toLocaleString('en-IN')} has been deducted from your total.`
            });

        } catch (error: any) {
            console.error("Coupon validation error:", error);
            toast.error("System error during coupon validation");
        } finally {
            setIsProcessing(false);
        }
    };

    const postalCode = form.watch("postalCode");
    const paymentMethod = form.watch("paymentMethod");
    const isCodAllowed = ALLOWED_COD_PINCODES.includes(postalCode);

    // Shipping logic: COD is 50, UPI is 0
    const shippingFee = paymentMethod === 'cod' ? 50 : 0;
    const finalTotal = cartTotal - discount + shippingFee;

    useEffect(() => {
        if (paymentMethod === 'cod' && !isCodAllowed) {
            form.setValue('paymentMethod', 'upi');
            toast.error("Cash on Delivery is not available for this location");
        }
    }, [postalCode, paymentMethod, isCodAllowed, form]);

    const getUpiUrl = () => {
        const pa = 'vigneshvpa10@oksbi';
        const pn = 'Vignesh';
        // Some apps handle amounts better without trailing .00
        const am = finalTotal % 1 === 0 ? finalTotal.toFixed(0) : finalTotal.toFixed(2);
        const tn = encodeURIComponent('Zero Fashion Order');
        return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
    };

    const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
        setIsProcessing(true);

        try {
            // 1. Calculate totals
            const totalAmount = cartTotal;
            const discountAmount = discount;
            const finalAmount = totalAmount - discountAmount + shippingFee;

            // 2. Insert into orders table
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    customer_name: `${values.firstName} ${values.lastName}`,
                    email: values.email,
                    phone: values.phone,
                    shipping_address: {
                        street: values.address,
                        city: values.city,
                        state: values.state,
                        postal_code: values.postalCode,
                        country: "India"
                    },
                    status: 'Pending',
                    payment_method: values.paymentMethod,
                    payment_status: values.paymentMethod === 'cod' ? 'Pending' : 'Paid',
                    total_amount: finalAmount,
                    discount_amount: discountAmount,
                    shipping_amount: shippingFee,
                    tracking_number: null,
                    coupon_id: couponId // Track which coupon was used
                } as any)
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Update Coupon Usage count if applicable
            if (couponId) {
                await supabase.rpc('increment_coupon_usage', { coupon_id: couponId });
            }
            if (!orderData) throw new Error("Failed to create order");

            // 4. Insert order items
            const orderItems = cartItems.map(item => ({
                order_id: orderData.id,
                product_id: item.id, // Assuming item.id is UUID. If not, might need handling.
                product_name: item.name,
                quantity: item.quantity,
                price: item.price, // Store original price
                selected_size: item.selectedSize,
                selected_color: item.selectedColor,
                image_url: item.image
            }));

            const { error: itemsError } = await supabase
                .from('order_items' as any)
                .insert(orderItems as any);

            if (itemsError) throw itemsError;

            // 5. Success Handling
            // Save or clear info based on checkbox
            if (values.saveInfo) {
                localStorage.setItem("savedCheckoutInfo", JSON.stringify({
                    email: values.email,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    address: values.address,
                    city: values.city,
                    state: values.state,
                    postalCode: values.postalCode,
                    phone: values.phone,
                    paymentMethod: values.paymentMethod,
                    saveInfo: true
                }));
            } else {
                localStorage.removeItem("savedCheckoutInfo");
            }

            toast.success("Order placed successfully!");
            clearCart();
            setIsProcessing(false);

            // Navigate to order success page with order details
            navigate("/order-success", {
                state: {
                    orderId: orderData.order_number,
                    total: finalAmount
                }
            });


        } catch (error: any) {
            console.error("Order placement failed:", error);
            toast.error("Failed to place order. Please try again.", {
                description: error.message || "Unknown error occurred"
            });
            setIsProcessing(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col pt-32 px-6">
                <Navbar />
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-7 space-y-8">
                            <Skeleton className="h-12 w-1/2" />
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                        <div className="lg:col-span-5">
                            <Skeleton className="h-96 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container px-6 pt-32 pb-20 flex flex-col items-center justify-center text-center">
                    <h2 className="font-heading text-2xl mb-4">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-8">Add some items to get started.</p>
                    <Link to="/" className="luxury-btn-primary px-8 py-3">Continue Shopping</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="mb-8">
                        <nav className="flex items-center gap-2 text-xs font-body text-muted-foreground uppercase tracking-widest mb-4">
                            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-foreground">Checkout</span>
                        </nav>
                        <h1 className="font-heading text-3xl lg:text-4xl font-light">Checkout</h1>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 xl:gap-20">
                        {/* Left - Forms */}
                        <div className="lg:col-span-7">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h2 className="font-heading text-xl font-medium">Customer Information</h2>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="address@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    {/* Shipping Address */}
                                    <div className="space-y-4">
                                        <h2 className="font-heading text-xl font-medium">Delivery Point</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="First Name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Last Name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Street Address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="City" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>State</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="State / Province" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="postalCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Postal Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="PIN Code" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Phone Number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <h2 className="font-heading text-xl font-medium">Transaction Protocol</h2>
                                        <FormField
                                            control={form.control}
                                            name="paymentMethod"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                                                <FormControl>
                                                                    <RadioGroupItem value="upi" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal cursor-pointer flex-1">
                                                                    UPI (Google Pay, PhonePe)
                                                                </FormLabel>
                                                            </FormItem>
                                                            {isCodAllowed && (
                                                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="cod" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal cursor-pointer flex-1">
                                                                        Cash on Delivery
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )}
                                                        </RadioGroup>
                                                    </FormControl>

                                                    {field.value === 'upi' && (
                                                        <div className="mt-6 p-6 border-2 border-dashed border-luxury-gold/30 rounded-xl bg-luxury-gold/5 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500">
                                                            <div className="text-center mb-6">
                                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                                    <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-[#634832]">Unified Payments Interface</h4>
                                                                    <div className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                                                        <Check size={10} strokeWidth={3} /> VERIFIED
                                                                    </div>
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground italic">Follow the protocol below for a secure transaction</p>
                                                            </div>

                                                            <div className="grid md:grid-cols-2 gap-6 w-full mb-6">
                                                                {/* Method 1: QR Code */}
                                                                <div className="flex flex-col items-center bg-white p-5 rounded-xl shadow-sm border border-border/50 relative overflow-hidden group">
                                                                    <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold/20"></div>
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Phase 1: Scan & Pay</span>
                                                                    <div className="relative p-2 bg-white rounded-lg border-2 border-luxury-gold/10 group-hover:border-luxury-gold/30 transition-colors">
                                                                        <img
                                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=jpg&data=${encodeURIComponent(getUpiUrl())}`}
                                                                            alt="UPI QR Code"
                                                                            className="w-40 h-40 object-contain mx-auto"
                                                                        />
                                                                    </div>
                                                                    <div className="mt-4 text-center">
                                                                        <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-tighter">Amount Due</div>
                                                                        <div className="text-xl font-bold text-[#634832]">
                                                                            ₹{finalTotal.toLocaleString('en-IN')}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Method 2: Direct Link */}
                                                                <div className={`flex flex-col items-center p-5 rounded-xl shadow-sm border border-border/50 relative overflow-hidden ${isMobile ? 'bg-white' : 'bg-muted/30 opacity-60'}`}>
                                                                    <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold/20"></div>
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Phase 2: Instant Link</span>
                                                                    <div className="flex-1 flex flex-col items-center justify-center w-full space-y-4">
                                                                        {isMobile ? (
                                                                            <a
                                                                                href={getUpiUrl()}
                                                                                className="w-full py-4 px-4 bg-[#634832] text-white rounded-lg text-center text-xs font-bold uppercase tracking-widest hover:bg-[#634832]/90 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3"
                                                                            >
                                                                                <QrCode size={18} />
                                                                                Launch App
                                                                            </a>
                                                                        ) : (
                                                                            <div className="w-full py-4 px-4 bg-muted text-muted-foreground rounded-lg text-center text-[10px] font-bold uppercase tracking-widest border border-dashed border-border flex items-center justify-center gap-2">
                                                                                Mobile Only
                                                                            </div>
                                                                        )}
                                                                        <div className="text-[10px] text-center text-muted-foreground space-y-1">
                                                                            <p>{isMobile ? "Best for GPay, PhonePe, Paytm" : "Direct access is restricted to mobile"}</p>
                                                                            <p className="font-semibold text-luxury-gold underline">Secure Protocol Active</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="w-full space-y-4">
                                                                <div className="grid grid-cols-3 gap-2 py-2">
                                                                    {[
                                                                        { step: 1, text: "Scan or Click" },
                                                                        { step: 2, text: "Verify Amount" },
                                                                        { step: 3, text: "Submit Order" }
                                                                    ].map((s) => (
                                                                        <div key={s.step} className="flex flex-col items-center text-center">
                                                                            <div className="h-5 w-5 rounded-full bg-[#634832] text-white text-[9px] flex items-center justify-center font-bold mb-1 shadow-sm">
                                                                                {s.step}
                                                                            </div>
                                                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{s.text}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="saveInfo"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="cursor-pointer">
                                                        Save this information for next time
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full luxury-btn-primary h-14 sm:h-16 font-medium text-base sm:text-lg flex items-center justify-center gap-2 mt-8 tracking-[0.2em] uppercase active:scale-[0.98] transition-transform"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Place Order <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </Form>
                        </div>

                        {/* Right - Order Summary */}
                        <div className="lg:col-span-5">
                            <div className="bg-muted/20 p-6 lg:p-8 rounded-lg border border-border/50 sticky top-24">
                                <h2 className="font-heading text-xl font-medium mb-6 uppercase tracking-widest text-luxury-gold">Portfolio Summary</h2>

                                <div className="space-y-4 mb-6">
                                    {cartItems.map(item => (
                                        <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                                            <div className="h-16 w-12 rounded bg-muted overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                                                    <span className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Qty: {item.quantity}
                                                    {item.selectedSize && ` | Size: ${item.selectedSize}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-6" />

                                <div className="flex gap-2 mb-6">
                                    <Input
                                        placeholder="Discount Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="bg-background"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="px-4 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className={shippingFee === 0 ? "text-green-600" : "text-foreground font-medium"}>
                                            {shippingFee === 0 ? "Free" : `₹${shippingFee.toLocaleString('en-IN')}`}
                                        </span>
                                    </div>
                                    <div className="mt-2 p-2 bg-background rounded border border-border/40 text-[10px] space-y-1">
                                        <div className="flex items-center gap-1.5 text-foreground/80">
                                            <span className="text-green-600">✨</span>
                                            <span>Enjoy <strong>FREE Shipping</strong> on all UPI / Prepaid Orders</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-foreground/80">
                                            <span>🚚</span>
                                            <span>Cash on Delivery Available (+₹50)</span>
                                        </div>
                                    </div>
                                    {discount > 0 && (

                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-₹{discount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-lg font-medium">
                                        <span>Total</span>
                                        <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
                                    Secure Checkout - 100% Encrypted
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />


        </div>
    );
};

export default Checkout;
