import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const AnnouncementBar = () => {
    const { data: settings } = useSettings();

    const isVisible = settings?.announcement_enabled;
    const text = settings?.announcement_text;
    const bgColor = settings?.announcement_bg_color || "#1A1A1A";
    const textColor = settings?.announcement_text_color || "#FFFFFF";
    const isScrolling = settings?.announcement_scrolling;
    const scrollSpeed = settings?.announcement_scroll_speed || 15;
    const couponCode = settings?.announcement_coupon_code;

    const handleCopyCoupon = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (couponCode) {
            const upperCode = couponCode.toUpperCase();
            navigator.clipboard.writeText(upperCode);
            toast.success(`Coupon code ${upperCode} copied!`);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className="text-[10px] sm:text-xs font-medium tracking-widest uppercase py-2.5 px-4 relative transition-all duration-300 border-b border-white/5 overflow-hidden"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <div
                className={`container mx-auto flex items-center justify-center gap-4 text-center ${isScrolling ? 'animate-marquee whitespace-nowrap hover:[animation-play-state:paused]' : ''}`}
                style={isScrolling ? { animationDuration: `${scrollSpeed}s` } : {}}
            >
                <span>{text}</span>
                {couponCode && (
                    <button
                        onClick={handleCopyCoupon}
                        className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded border border-current hover:bg-white hover:text-black transition-all cursor-pointer group"
                        title="Click to copy coupon code"
                    >
                        <span className="font-bold">{couponCode.toUpperCase()}</span>
                        <Copy size={10} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AnnouncementBar;
