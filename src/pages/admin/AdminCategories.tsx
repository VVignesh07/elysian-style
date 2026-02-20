import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Search, Edit, Trash2, Upload, Package, Loader2 } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const AdminCategories = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        slug: "",
        description: "",
        image: "",
        color: "#3B82F6",
        status: "Active" as "Active" | "Inactive"
    });

    // Supabase hooks
    const { data: categories = [], isLoading, error } = useCategories(supabaseAdmin);
    const createCategory = useCreateCategory(supabaseAdmin);
    const updateCategory = useUpdateCategory(supabaseAdmin);
    const deleteCategory = useDeleteCategory(supabaseAdmin);

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            slug: isEditMode ? prev.slug : generateSlug(name)
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const openAddDialog = () => {
        setIsEditMode(false);
        setFormData({
            id: "",
            name: "",
            slug: "",
            description: "",
            image: "",
            color: "#3B82F6",
            status: "Active"
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: any) => {
        setIsEditMode(true);
        setFormData({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            image: category.image_url || "",
            color: category.color,
            status: category.status
        });
        setIsDialogOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!formData.name.trim()) {
            return;
        }

        const categoryData = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            image: formData.image,
            color: formData.color,
            status: formData.status,
            display_order: isEditMode ? undefined : categories.length
        };

        if (isEditMode) {
            await updateCategory.mutateAsync({
                id: formData.id,
                ...categoryData
            });
        } else {
            await createCategory.mutateAsync(categoryData);
        }

        setIsDialogOpen(false);
    };

    const openDeleteDialog = (id: string) => {
        setCategoryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete) {
            await deleteCategory.mutateAsync(categoryToDelete);
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    };

    const toggleStatus = async (category: any) => {
        await updateCategory.mutateAsync({
            id: category.id,
            status: category.status === "Active" ? "Inactive" : "Active"
        });
    };

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">Error loading categories</p>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-1 block">Curation Architecture</span>
                    <h1 className="text-2xl font-heading font-bold text-[#332D2D]">Collections</h1>
                    <p className="text-muted-foreground mt-1 font-body text-sm italic">Organize your atelier's creations into meaningful lines.</p>
                </div>
                <Button
                    className="bg-luxury-gold hover:bg-luxury-gold/90 text-white min-w-[160px] shadow-lg rounded-xl transition-all duration-300 h-11 text-xs font-bold uppercase tracking-wider group"
                    onClick={openAddDialog}
                    disabled={createCategory.isPending}
                >
                    <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> Add New Line
                </Button>
            </div>

            {/* Search */}
            <div className="mb-10">
                <div className="relative max-w-md group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-luxury-gold transition-colors" />
                    <Input
                        placeholder="Search our archives..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 bg-white border-[#E8E1D9] focus-visible:ring-luxury-gold h-12 rounded-xl text-sm shadow-inner"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 size={32} className="text-luxury-gold animate-spin" />
                </div>
            )}

            {/* Category Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-luxury transition-all duration-500 border border-[#E8E1D9] bg-white">
                            {/* Category Image with Overlay */}
                            <div className="relative h-80 overflow-hidden">
                                {category.image_url ? (
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center"
                                        style={{ backgroundColor: category.color + '10' }}
                                    >
                                        <Package size={64} className="text-luxury-gold/20" />
                                    </div>
                                )}

                                {/* Sophisticated Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />

                                {/* Category Info Overlay */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    {/* Top Row - Status Badge */}
                                    <div className="flex items-start justify-between">
                                        <button
                                            onClick={() => toggleStatus(category)}
                                            disabled={updateCategory.isPending}
                                            className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase transition-all backdrop-blur-md border ${category.status === "Active"
                                                ? "bg-green-500/80 text-white border-white/20 hover:bg-green-600"
                                                : "bg-[#2D2D2D]/80 text-white border-white/10 hover:bg-black"
                                                }`}
                                        >
                                            {category.status}
                                        </button>
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white/50 shadow-inner"
                                            style={{ backgroundColor: category.color }}
                                        />
                                    </div>

                                    {/* Bottom Row - Category Details */}
                                    <div className="space-y-4">
                                        <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                                            <h3 className="font-heading text-2xl font-bold text-white mb-2 tracking-tight">
                                                {category.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-[0.2em]">
                                                    {category.slug}
                                                </span>
                                                <span className="w-1.5 h-[1px] bg-white/30" />
                                                <div className="flex items-center gap-1.5 text-white/70">
                                                    <Package size={12} className="text-luxury-gold" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{category.product_count} Pieces</span>
                                                </div>
                                            </div>
                                        </div>

                                        {category.description && (
                                            <p className="text-xs text-white/60 line-clamp-2 italic font-body leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                {category.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-end gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-xl border border-white/10"
                                                onClick={() => openEditDialog(category)}
                                                disabled={updateCategory.isPending}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 bg-white/10 hover:bg-red-500 text-white backdrop-blur-md rounded-xl border border-white/10"
                                                onClick={() => openDeleteDialog(category.id)}
                                                disabled={deleteCategory.isPending}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Category Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit Category" : "Add New Category"}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? "Update category information" : "Create a new product category with image and description"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoryName">Category Name *</Label>
                                <Input
                                    id="categoryName"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Summer Collection"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categorySlug">Slug</Label>
                                <Input
                                    id="categorySlug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="summer-collection"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoryColor">Theme Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="categoryColor"
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-20 h-10 cursor-pointer"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="#3B82F6"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoryDescription">Description</Label>
                                <Textarea
                                    id="categoryDescription"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this category..."
                                    className="min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        {/* Right Column - Image */}
                        <div className="space-y-2">
                            <Label>Category Image</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative aspect-square rounded-lg border-2 border-dashed border-border hover:border-luxury-gold/50 cursor-pointer overflow-hidden bg-muted/30 group"
                            >
                                {formData.image ? (
                                    <>
                                        <img
                                            src={formData.image}
                                            alt="Category"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="text-white" size={32} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Upload size={32} />
                                        <span className="text-sm">Click to upload</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <p className="text-xs text-muted-foreground">
                                Recommended: 800x800px, JPG or PNG
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveCategory}
                            className="bg-luxury-gold hover:bg-luxury-gold/90 text-white"
                            disabled={createCategory.isPending || updateCategory.isPending}
                        >
                            {(createCategory.isPending || updateCategory.isPending) && (
                                <Loader2 size={16} className="mr-2 animate-spin" />
                            )}
                            {isEditMode ? "Update Category" : "Add Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending && (
                                <Loader2 size={16} className="mr-2 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminCategories;
