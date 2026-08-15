import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#222] group-[.toaster]:border group-[.toaster]:border-gray-100 group-[.toaster]:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] group-[.toaster]:rounded-full px-6 py-3 font-body font-medium flex items-center gap-3",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          icon: "group-data-[type=success]:text-black group-data-[type=error]:text-red-500 group-data-[type=info]:text-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
