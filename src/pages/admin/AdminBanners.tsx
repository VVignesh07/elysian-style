import { useState } from "react";
import {
    useAllBanners,
    useCreateBanner,
    useUpdateBanner,
    useDeleteBanner,
    useToggleBannerStatus,
    PromotionalBanner as BannerType,
    CreateBannerInput
} from "@/hooks/useBanners";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Sparkles, Star, RotateCcw } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import AdminLayout from "@/components/admin/AdminLayout";
import PromotionalBanner from "@/components/PromotionalBanner";
import { StarDoodle, SparkleDoodle } from "@/components/DoodleDecorations";


const AdminBanners = () => {
    const { data: banners = [], isLoading, error } = useAllBanners(supabaseAdmin);
    const createBanner = useCreateBanner(supabaseAdmin);
    const updateBanner = useUpdateBanner(supabaseAdmin);
    const deleteBanner = useDeleteBanner(supabaseAdmin);
    const toggleStatus = useToggleBannerStatus(supabaseAdmin);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerType | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<CreateBannerInput>({
        title: "",
        subtitle: "",
        description: "",
        image_url: "",
        button_text: "",
        button_link: "",
        position: "mid-page",
        priority: 0,
        is_active: true,
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            setFormData(prev => ({ ...prev, image_url: imageUrl }));
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload image");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.image_url) {
            toast.error("Title and image are required");
            return;
        }

        try {
            if (editingBanner) {
                await updateBanner.mutateAsync({
                    id: editingBanner.id,
                    updates: formData,
                });
                toast.success("Banner updated successfully");
            } else {
                await createBanner.mutateAsync(formData);
                toast.success("Banner created successfully");
            }

            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error("Failed to save banner");
            console.error(error);
        }
    };

    const handleRestoreDefault = async () => {
        try {
            await createBanner.mutateAsync({
                title: "Autumn Collection",
                subtitle: "Limited Time",
                description: "Up to 30% OFF on selected styles",
                image_url: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800", // Unsplash Fall Fashion
                button_text: "Shop Collection",
                button_link: "/collections",
                position: "mid-page",
                priority: 10,
                is_active: true,
            });
            toast.success("Default banner restored properly");
        } catch (error) {
            toast.error("Failed to restore default banner");
            console.error(error);
        }
    };

    const handleEdit = (banner: BannerType) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || "",
            description: banner.description || "",
            image_url: banner.image_url,
            button_text: banner.button_text || "",
            button_link: banner.button_link || "",
            position: banner.position,
            priority: banner.priority,
            is_active: banner.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            await deleteBanner.mutateAsync(id);
            toast.success("Banner deleted successfully");
        } catch (error) {
            toast.error("Failed to delete banner");
            console.error(error);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleStatus.mutateAsync({ id, is_active: !currentStatus });
            toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update banner status");
            console.error(error);
        }
    };

    const resetForm = () => {
        setEditingBanner(null);
        setFormData({
            title: "",
            subtitle: "",
            description: "",
            image_url: "",
            button_text: "",
            button_link: "",
            position: "hero",
            priority: 0,
            is_active: true,
        });
    };

    return (
        <AdminLayout>
            <div className="p-8 relative">
                {/* Header with Funky Styling */}
                <div className="flex justify-between items-center mb-12 relative">
                    <div className="relative">
                        <StarDoodle className="absolute -top-10 -left-10 w-12 h-12 text-luxury-gold opacity-30 animate-pulse" />
                        <h1 className="text-4xl font-heading font-light mb-2 relative z-10">
                            Promotional <span className="italic">Banners</span>
                        </h1>
                        <p className="text-muted-foreground font-body">Manage your funky promotional graphics</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="gap-2 border-dashed border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/5"
                            onClick={handleRestoreDefault}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Restore Default
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-luxury-gold hover:bg-luxury-gold/90 text-white rounded-none">
                                    <Plus className="w-4 h-4" />
                                    Add Banner
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-luxury-gold/20">
                                <DialogHeader>
                                    <DialogTitle className="font-heading text-2xl font-light">
                                        {editingBanner ? 'Update Banner' : 'Create New Banner'}
                                    </DialogTitle>
                                    <DialogDescription className="font-body">
                                        Design your next funky promotion
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest opacity-70">Banner Image *</Label>
                                        <div className="border-2 border-dashed border-luxury-gold/20 rounded-none p-4 bg-muted/30">
                                            {formData.image_url ? (
                                                <div className="relative">
                                                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 rounded-none"
                                                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center gap-2 cursor-pointer py-8">
                                                    <Upload className="w-8 h-8 text-luxury-gold/50" />
                                                    <span className="text-sm text-muted-foreground font-body italic">Click to upload your graphic</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                        disabled={uploading}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-xs uppercase tracking-widest opacity-70">Title *</Label>
                                        <Input
                                            id="title"
                                            className="rounded-none border-luxury-gold/10"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Autumn Collection"
                                            required
                                        />
                                    </div>

                                    {/* Subtitle */}
                                    <div className="space-y-2">
                                        <Label htmlFor="subtitle" className="text-xs uppercase tracking-widest opacity-70">Subtitle</Label>
                                        <Input
                                            id="subtitle"
                                            className="rounded-none border-luxury-gold/10"
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                            placeholder="Limited Time"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs uppercase tracking-widest opacity-70">Description</Label>
                                        <Textarea
                                            id="description"
                                            className="rounded-none border-luxury-gold/10"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Up to 30% OFF on selected styles"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Button Text */}
                                        <div className="space-y-2">
                                            <Label htmlFor="button_text" className="text-xs uppercase tracking-widest opacity-70">Button Text</Label>
                                            <Input
                                                id="button_text"
                                                className="rounded-none border-luxury-gold/10"
                                                value={formData.button_text}
                                                onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                                                placeholder="Shop Collection"
                                            />
                                        </div>

                                        {/* Button Link */}
                                        <div className="space-y-2">
                                            <Label htmlFor="button_link" className="text-xs uppercase tracking-widest opacity-70">Button Link</Label>
                                            <Input
                                                id="button_link"
                                                className="rounded-none border-luxury-gold/10"
                                                value={formData.button_link}
                                                onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                                                placeholder="/collections"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Position */}
                                        <div className="space-y-2">
                                            <Label htmlFor="position" className="text-xs uppercase tracking-widest opacity-70">Position</Label>
                                            <Select
                                                value={formData.position}
                                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, position: value }))}
                                            >
                                                <SelectTrigger className="rounded-none border-luxury-gold/10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hero">Hero (Top)</SelectItem>
                                                    <SelectItem value="mid-page">Mid-page</SelectItem>
                                                    <SelectItem value="footer">Footer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Priority */}
                                        <div className="space-y-2">
                                            <Label htmlFor="priority" className="text-xs uppercase tracking-widest opacity-70">Priority</Label>
                                            <Input
                                                id="priority"
                                                type="number"
                                                className="rounded-none border-luxury-gold/10"
                                                value={formData.priority}
                                                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Active Status */}
                                    <div className="flex items-center gap-3 bg-muted/30 p-4 border-l-2 border-luxury-gold">
                                        <Switch
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                        />
                                        <Label className="font-body italic opacity-80 cursor-pointer">Live on Website</Label>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4">
                                        <Button type="button" variant="ghost" className="rounded-none" onClick={() => setIsDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="rounded-none bg-black text-white hover:bg-black/90 px-8" disabled={uploading || createBanner.isPending || updateBanner.isPending}>
                                            {uploading ? 'Processing...' : editingBanner ? 'Save Changes' : 'Launch Banner'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Live Preview Section */}
                <div className="mb-16 relative">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-luxury-gold animate-pulse" />
                        <h2 className="text-xl font-heading font-light uppercase tracking-widest">Live Site <span className="italic">Preview</span></h2>
                    </div>
                    <div className="border-4 border-double border-luxury-gold/20 p-2 bg-white shadow-2xl overflow-hidden group">
                        <div className="scale-[0.98] transition-transform duration-500 group-hover:scale-100">
                            <PromotionalBanner position="mid-page" />
                        </div>
                        <div className="mt-4 p-4 bg-muted/30 text-center font-body text-xs italic tracking-widest uppercase opacity-60">
                            This is how your banner looks on the homepage
                        </div>
                    </div>
                    <SparkleDoodle className="absolute -bottom-10 -right-10 w-16 h-16 text-luxury-gold opacity-20" />
                </div>

                {/* Banners List */}
                <div className="space-y-6 relative">
                    <h2 className="text-xl font-heading font-light uppercase tracking-widest mb-6">Banner <span className="italic">Management</span></h2>

                    {error ? (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-none mb-8 shadow-sm">
                            <p className="font-bold flex items-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Database Integration Error
                            </p>
                            <p className="mt-2 text-sm opacity-90">
                                {(error as any).message || "Unknown error"}.
                                Please ensure the `promotional_banners` table exists in your Supabase project.
                            </p>
                            <Button variant="outline" size="sm" className="mt-4 border-red-200 hover:bg-red-100 text-red-700" onClick={() => window.location.reload()}>
                                Try Refreshing
                            </Button>
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                            <RotateCcw className="w-10 h-10 animate-spin text-luxury-gold" />
                            <p className="font-body italic tracking-widest uppercase text-xs">Fetching graphics...</p>
                        </div>
                    ) : banners.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-luxury-gold/10 bg-luxury-gold/5">
                            <SparkleDoodle className="w-12 h-12 text-luxury-gold/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-body italic mb-6">No active graphics found. Ready to create your first masterpiece?</p>
                            <Button variant="outline" className="gap-2 border-luxury-gold/30 text-luxury-gold" onClick={() => setIsDialogOpen(true)}>
                                <Plus className="w-4 h-4" />
                                Create Now
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {banners.map((banner) => (
                                <div
                                    key={banner.id}
                                    className={`group border-l-4 transition-all duration-300 bg-white hover:shadow-xl ${banner.is_active ? 'border-luxury-gold' : 'border-zinc-300 opacity-80'}`}
                                >
                                    <div className="grid lg:grid-cols-[400px_1fr] gap-0">
                                        <div className="relative overflow-hidden h-64 lg:h-auto">
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {!banner.is_active && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                                    <span className="bg-zinc-800 text-white px-4 py-1 text-xs uppercase tracking-widest font-body">Inactive</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8 space-y-6 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[10px] uppercase tracking-[0.2em] font-body bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
                                                                {banner.position}
                                                            </span>
                                                            <span className="text-[10px] uppercase tracking-[0.2em] font-body bg-luxury-gold/10 px-2 py-0.5 rounded text-luxury-gold">
                                                                Priority: {banner.priority}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-2xl font-heading font-light tracking-wide">{banner.title}</h3>
                                                        {banner.subtitle && (
                                                            <p className="text-xs uppercase tracking-[0.3em] text-luxury-gold/60 mt-1 font-body">{banner.subtitle}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="hover:bg-luxury-gold/10"
                                                            onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                                                            title={banner.is_active ? "Deactivate" : "Activate"}
                                                        >
                                                            {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-40" />}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2 border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold/5 rounded-none"
                                                            onClick={() => handleEdit(banner)}
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="hover:text-red-500 hover:bg-red-50 rounded-none"
                                                            onClick={() => handleDelete(banner.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {banner.description && (
                                                    <p className="text-sm text-zinc-500 font-body leading-relaxed max-w-xl">{banner.description}</p>
                                                )}
                                            </div>

                                            <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-body opacity-40">
                                                    <span>Launch: {new Date(banner.created_at).toLocaleDateString()}</span>
                                                </div>
                                                {banner.button_text && (
                                                    <span className="text-[10px] font-body uppercase tracking-[0.2em] italic border-b border-luxury-gold text-luxury-gold">
                                                        CTA: {banner.button_text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBanners;
