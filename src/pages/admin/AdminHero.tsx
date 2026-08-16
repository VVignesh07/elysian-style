import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, ExternalLink, Columns, Maximize2, Sparkles, Loader2 } from "lucide-react";
import { useHeroSlides, useCreateHeroSlide, useUpdateHeroSlide, useDeleteHeroSlide, HeroSlide } from "@/hooks/useHeroSlides";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { toast } from "sonner";
import { StarDoodle, CircleDoodle, SparkleDoodle } from "@/components/DoodleDecorations";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_SLIDES = [
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 0,
    is_active: true,
    layout_type: "split" as const
  },
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 1,
    is_active: true,
    layout_type: "split" as const
  },
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 2,
    is_active: true,
    layout_type: "split" as const
  },
  {
    image_url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png",
    title: "ZERO\nFASHION",
    subtitle: "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.",
    cta_text: "DISCOVER IT",
    cta_link: "#",
    display_order: 3,
    is_active: true,
    layout_type: "split" as const
  }
];

const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#E8E1D9] bg-white overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-5 space-y-4">
                    <Skeleton className="h-6 w-[70%]" />
                    <Skeleton className="h-4 w-[40%]" />
                    <div className="flex justify-between pt-4 border-t border-border/40">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const AdminHero = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [slideToDelete, setSlideToDelete] = useState<string | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        id: "",
        image_url: "",
        title: "",
        subtitle: "",
        cta_text: "Shop Now",
        cta_link: "/collections",
        bg_color: "#F4845F",
        is_active: true,
        display_order: 0,
        layout_type: "split" as "split" | "full"
    });

    const { data: slides = [], isLoading, error } = useHeroSlides(supabaseAdmin);
    const createSlide = useCreateHeroSlide(supabaseAdmin);
    const updateSlide = useUpdateHeroSlide(supabaseAdmin);
    const deleteSlide = useDeleteHeroSlide(supabaseAdmin);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const openAddDialog = () => {
        setIsEditMode(false);
        setFormData({
            id: "",
            image_url: "",
            title: "Define\nYour\nStyle",
            subtitle: "Premium fashion for every occasion.",
            cta_text: "Shop Now",
            cta_link: "/collections",
            bg_color: "#F4845F",
            is_active: true,
            display_order: slides.length,
            layout_type: "split"
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (slide: HeroSlide) => {
        setIsEditMode(true);
        setFormData({
            id: slide.id,
            image_url: slide.image_url,
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            cta_text: slide.cta_text || "",
            cta_link: slide.cta_link || "",
            bg_color: slide.bg_color || "#F4845F",
            is_active: slide.is_active,
            display_order: slide.display_order,
            layout_type: slide.layout_type || "split"
        });
        setIsDialogOpen(true);
    };

    const handleSaveSlide = async () => {
        if (!formData.image_url) {
            toast.error("Please upload an image");
            return;
        }

        try {
            const slideData = {
                image_url: formData.image_url,
                title: formData.title,
                subtitle: formData.subtitle,
                cta_text: formData.cta_text,
                cta_link: formData.cta_link,
                bg_color: formData.bg_color,
                is_active: formData.is_active,
                display_order: formData.display_order,
                layout_type: formData.layout_type
            };

            if (isEditMode) {
                await updateSlide.mutateAsync({
                    id: formData.id,
                    ...slideData
                });
            } else {
                await createSlide.mutateAsync(slideData);
            }

            setIsDialogOpen(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const openDeleteDialog = (id: string) => {
        setSlideToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (slideToDelete) {
            await deleteSlide.mutateAsync(slideToDelete);
            setDeleteDialogOpen(false);
            setSlideToDelete(null);
        }
    };

    const toggleStatus = async (slide: HeroSlide) => {
        await updateSlide.mutateAsync({
            id: slide.id,
            is_active: !slide.is_active
        });
    };

    const handleRestoreDefaults = async () => {
        if (!confirm("This will add the 4 default figurine slides to your database. Proceed?")) return;
        setIsSeeding(true);
        try {
            // Delete all existing slides
            const { error: deleteError } = await supabaseAdmin
                .from('hero_slides')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');
            
            if (deleteError) throw deleteError;
            
            // Insert default ones
            const { error: insertError } = await supabaseAdmin
                .from('hero_slides')
                .insert(DEFAULT_SLIDES);
                
            if (insertError) throw insertError;
            
            toast.success("Default slides restored successfully!");
            // The query will automatically re-fetch if we invalidate it via a page refresh
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || "Failed to restore defaults");
        } finally {
            setIsSeeding(false);
        }
    };

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">Error loading slides</p>
                        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-1 block">Homepage Visuals</span>
                    <h1 className="text-2xl font-heading font-bold text-[#332D2D]">Hero Slider</h1>
                    <p className="text-muted-foreground mt-1 font-body text-sm italic">Manage the main banner images and messaging.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="bg-white border-[#E8E1D9] text-[#332D2D] hover:bg-[#F9F7F4] min-w-[160px] h-11 text-xs font-bold uppercase tracking-wider"
                        onClick={handleRestoreDefaults}
                        disabled={isSeeding}
                    >
                        {isSeeding ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                        Restore Defaults
                    </Button>
                    <Button
                        className="bg-luxury-gold hover:bg-luxury-gold/90 text-white min-w-[160px] shadow-lg rounded-xl transition-all duration-300 h-11 text-xs font-bold uppercase tracking-wider group"
                        onClick={openAddDialog}
                        disabled={createSlide.isPending}
                    >
                        <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> Add New Slide
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <GridSkeleton />
            )}

            {/* Slides Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {slides.map((slide) => (
                        <div key={slide.id} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-luxury transition-all duration-500 border border-[#E8E1D9] bg-white flex flex-col">
                            {/* Slide Image */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                <OptimizedImage
                                    src={slide.image_url}
                                    alt="Slide"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    width={600}
                                />
                                <div className="absolute top-4 right-4 z-10">
                                    <Switch
                                        checked={slide.is_active}
                                        onCheckedChange={() => toggleStatus(slide)}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                    <div className="text-white">
                                        <p className="font-heading text-xl font-bold leading-tight line-clamp-2">
                                            {slide.title || "Untitled Slide"}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-[10px] text-white flex items-center gap-1 uppercase tracking-wider font-bold">
                                            {slide.layout_type === 'full' ? <Maximize2 size={10} /> : <Columns size={10} />}
                                            {slide.layout_type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Slide Details */}
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-bold text-[#332D2D]">Subtitle:</span> {slide.subtitle || "-"}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span className="font-bold text-[#332D2D]">CTA:</span>
                                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] uppercase tracking-wider border border-border">
                                            {slide.cta_text}
                                        </span>
                                        <span className="text-[10px] opacity-70">
                                            ({slide.cta_link})
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Order: {slide.display_order}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
                                            onClick={() => openEditDialog(slide)}
                                        >
                                            <Edit size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-lg"
                                            onClick={() => openDeleteDialog(slide.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Slide Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl overflow-y-auto max-h-[95vh] rounded-3xl border-none shadow-2xl p-0 bg-white">
                    <DialogHeader>
                        <div className="bg-[#f9f7f2] p-8 border-b border-luxury-gold/10 relative overflow-hidden">
                            <StarDoodle className="absolute -top-4 -left-4 w-12 h-12 text-doodle-yellow opacity-40 rotate-12" />
                            <SparkleDoodle className="absolute top-6 right-10 w-8 h-8 text-doodle-pink opacity-30" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-2xl font-heading font-bold text-[#332D2D] flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-luxury-gold" />
                                        {isEditMode ? "Edit Slide" : "Add New Slide"}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground italic mt-1 font-body">
                                        Craft your premium homepage experience.
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Image Section */}
                            <div className="space-y-4">
                                <Label className="text-xs font-bold text-luxury-gold uppercase tracking-[0.2em] mb-2 block">Slide Image</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all duration-500 overflow-hidden cursor-pointer group shadow-sm ${formData.image_url ? 'border-luxury-gold/30' : 'border-[#E8E1D9] hover:border-luxury-gold/50 bg-[#F9F7F4]'
                                        }`}
                                >
                                    {formData.image_url ? (
                                        <>
                                            <OptimizedImage
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                                                width={600}
                                            />
                                            <div className="absolute inset-0 bg-black/20 transition-opacity flex flex-col items-center justify-center gap-3">
                                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30">
                                                    <Upload className="text-white w-8 h-8" />
                                                </div>
                                                <span className="text-white text-xs font-bold uppercase tracking-widest">Update Image</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                                            <div className="p-5 bg-white rounded-full shadow-md border border-luxury-gold/10">
                                                <ImageIcon size={32} className="text-luxury-gold" />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-bold text-[#332D2D] block">Drop image here</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 block">JPG, PNG or WEBP</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-[#f9f7f2] rounded-xl border border-luxury-gold/5">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                        Tip: For the layout type you select, use images that have enough negative space for text overlays.
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            {/* Content Section */}
                            <div className="space-y-6">
                                <div className="space-y-2 relative">
                                    <Label htmlFor="title" className="text-xs font-bold text-luxury-gold uppercase tracking-[0.2em]">Headline</Label>
                                    <Textarea
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter headline..."
                                        className="min-h-[100px] font-heading font-medium text-2xl leading-[1.1] border-[#E8E1D9] rounded-xl focus:border-luxury-gold transition-all bg-white"
                                    />
                                    <CircleDoodle className="absolute -right-3 -top-1 w-6 h-6 text-doodle-purple opacity-20 pointer-events-none" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subtitle" className="text-xs font-bold text-luxury-gold uppercase tracking-[0.2em]">Subtitle</Label>
                                    <Textarea
                                        id="subtitle"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="Enter descriptive text..."
                                        className="min-h-[80px] text-sm text-muted-foreground border-[#E8E1D9] rounded-xl focus:border-luxury-gold transition-all italic bg-white"
                                    />
                                </div>

                                {/* Layout Selector Upgraded */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-luxury-gold uppercase tracking-[0.2em]">Layout Type</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, layout_type: "split" })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${formData.layout_type === 'split'
                                                ? 'border-luxury-gold bg-luxury-gold/5 ring-1 ring-luxury-gold/20'
                                                : 'border-border bg-white hover:border-luxury-gold/20'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${formData.layout_type === 'split' ? 'bg-luxury-gold text-white' : 'bg-muted text-muted-foreground'}`}>
                                                <Columns size={16} />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.layout_type === 'split' ? 'text-[#332D2D]' : 'text-muted-foreground'}`}>Split</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, layout_type: "full" })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${formData.layout_type === 'full'
                                                ? 'border-luxury-gold bg-luxury-gold/5 ring-1 ring-luxury-gold/20'
                                                : 'border-border bg-white hover:border-luxury-gold/20'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${formData.layout_type === 'full' ? 'bg-luxury-gold text-white' : 'bg-muted text-muted-foreground'}`}>
                                                <Maximize2 size={16} />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.layout_type === 'full' ? 'text-[#332D2D]' : 'text-muted-foreground'}`}>Full-Size</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Background Color Picker */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-luxury-gold uppercase tracking-[0.2em]">Background Color</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={formData.bg_color}
                                                onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                                                className="w-12 h-12 rounded-xl border-2 border-[#E8E1D9] cursor-pointer appearance-none bg-transparent p-0.5"
                                                style={{ WebkitAppearance: 'none' }}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={formData.bg_color}
                                                onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                                                placeholder="#F4845F"
                                                className="border-[#E8E1D9] rounded-lg h-10 font-mono text-sm uppercase"
                                            />
                                            <div className="flex gap-2">
                                                {['#F4845F', '#6BBF7A', '#E882B4', '#6EB5FF', '#A982E8', '#0a0a0a', '#1a1a2e', '#2d3436'].map(color => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, bg_color: color })}
                                                        className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${formData.bg_color === color ? 'border-luxury-gold ring-2 ring-luxury-gold/20 scale-110' : 'border-white/50'}`}
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cta_text" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Button Text</Label>
                                        <Input
                                            id="cta_text"
                                            value={formData.cta_text}
                                            onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                            className="border-[#E8E1D9] rounded-lg h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cta_link" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Button Link</Label>
                                        <Input
                                            id="cta_link"
                                            value={formData.cta_link}
                                            onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                            className="border-[#E8E1D9] rounded-lg h-10"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="display_order" className="text-[10px] font-bold text-muted-foreground uppercase">Order</Label>
                                            <Input
                                                id="display_order"
                                                type="number"
                                                value={formData.display_order}
                                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                                className="w-16 h-8 text-xs border-[#E8E1D9] rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Status</Label>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Switch
                                                    checked={formData.is_active}
                                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                                    className="data-[state=checked]:bg-green-500 scale-90"
                                                />
                                                <span className="text-[10px] font-bold text-[#332D2D] uppercase tracking-wider">{formData.is_active ? "Active" : "Hidden"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsDialogOpen(false)}
                                            className="text-xs font-bold uppercase tracking-wider hover:bg-muted rounded-xl px-6"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveSlide}
                                            className="bg-luxury-gold hover:bg-luxury-gold/90 text-white shadow-lg rounded-xl px-6 h-11 text-xs font-bold uppercase tracking-wider"
                                            disabled={createSlide.isPending || updateSlide.isPending}
                                        >
                                            {createSlide.isPending || updateSlide.isPending ? (
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                            ) : null}
                                            {isEditMode ? "Save Changes" : "Create Slide"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this slide?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This slide will be permanently removed from your homepage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteSlide.isPending}
                        >
                            {deleteSlide.isPending ? (
                                <Loader2 size={16} className="mr-2 animate-spin" />
                            ) : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminHero;
