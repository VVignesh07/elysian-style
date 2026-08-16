import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      offset={16}
      style={{ top: '70px' }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#111111]/95 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-xl w-auto min-w-[280px] max-w-[320px]",
          title: "font-body text-xs font-semibold tracking-wide text-white/90 leading-tight line-clamp-1",
          description: "font-body text-[9px] text-white/50 mt-0.5 uppercase tracking-widest font-medium",
          actionButton: "group-[.toast]:bg-luxury-gold group-[.toast]:text-white font-bold uppercase tracking-widest text-[9px] rounded-lg",
          cancelButton: "group-[.toast]:bg-[#222] group-[.toast]:text-white/60 rounded-lg",
          icon: "group-data-[type=success]:text-luxury-gold group-data-[type=error]:text-red-500 group-data-[type=info]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
