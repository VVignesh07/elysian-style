import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
    SheetDescription
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ColorSwatch } from "@/components/ui/ColorSwatch";

const CartDrawer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, removeFromCart, addToCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 bg-background border-l border-border">
                <SheetHeader className="px-6 py-4 border-b border-border/40">
                    <SheetTitle className="flex items-center gap-2 font-heading text-xl font-light">
                        <ShoppingBag size={20} />
                        Your Bag <span className="text-muted-foreground text-sm font-body">({cartItems.length})</span>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Review your selected items before checking out.
                    </SheetDescription>
                </SheetHeader>

                {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                            <ShoppingBag size={32} className="text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-heading text-lg font-medium">Your bag is empty</h3>
                            <p className="text-sm font-body text-muted-foreground">Looks like you haven't added anything yet.</p>
                        </div>
                        <SheetClose asChild>
                            <button className="luxury-btn-primary px-8 py-3 text-sm mt-4">
                                Start Shopping
                            </button>
                        </SheetClose>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6">
                            <div className="flex flex-col gap-6 py-6">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 group">
                                        <div className="h-24 w-20 rounded-md overflow-hidden bg-muted border border-border/40 shrink-0">
                                            <OptimizedImage
                                                src={item.image}
                                                alt={item.name}
                                                width={100}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-body text-sm font-medium leading-snug line-clamp-2">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {item.selectedColor && (
                                                        <div className="flex items-center gap-1">
                                                            <ColorSwatch color={item.selectedColor} size="xs" />
                                                            <span>{item.selectedColor}</span>
                                                        </div>
                                                    )}
                                                    {item.selectedColor && item.selectedSize && <span>•</span>}
                                                    {item.selectedSize && <span>Size {item.selectedSize}</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center border border-border rounded-md h-7">
                                                    <button
                                                        onClick={() => item.quantity > 1 ? addToCart(item, -1, item.selectedSize, item.selectedColor) : removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                                        className="px-2 h-full flex items-center justify-center hover:bg-muted transition-colors border-r border-border text-foreground/70"
                                                    >
                                                        <Minus size={10} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(item, 1, item.selectedSize, item.selectedColor)}
                                                        className="px-2 h-full flex items-center justify-center hover:bg-muted transition-colors border-l border-border text-foreground/70"
                                                    >
                                                        <Plus size={10} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-medium">
                                                        ₹{((item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price) * item.quantity).toLocaleString('en-IN')}
                                                    </span>
                                                    {item.discountPrice && item.discountPrice < item.price && (
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="border-t border-border bg-background p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-xs text-muted-foreground">Calculated at checkout</span>
                                </div>
                                <div className="mt-2 p-2 bg-muted/30 rounded border border-border/40 text-[10px] space-y-1">
                                    <div className="flex items-center gap-1.5 text-foreground/80">
                                        <span className="text-green-600">✨</span>
                                        <span>Enjoy <strong>FREE Shipping</strong> on all UPI / Prepaid Orders</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-foreground/80">
                                        <span>🚚</span>
                                        <span>Cash on Delivery Available (+₹50)</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />
                            <div className="flex items-center justify-between font-medium text-lg">
                                <span>Total</span>
                                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setIsCartOpen(false);
                                    if (!user) {
                                        navigate("/login", { state: { from: "/checkout" } });
                                    } else {
                                        navigate("/checkout");
                                    }
                                }}
                                className="w-full luxury-btn-primary h-12 flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] active:scale-[0.99] transition-all"
                            >
                                Checkout <ArrowRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
