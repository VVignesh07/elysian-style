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
import { Plus, Search, Edit, Trash2, Upload, Package, Loader2, ChevronDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { cn } from "@/lib/utils";

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
        status: "Active" as "Active" | "Inactive",
        parent_id: "" as string | null
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
            status: "Active",
            parent_id: null
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
            status: category.status,
            parent_id: category.parent_id || null
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
            parent_id: formData.parent_id || null, // Ensure this is stored properly
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

    const handleQuickStart = async () => {
        const hasMen = categories.some(c => c.name.toUpperCase() === 'MEN');
        const hasWomen = categories.some(c => c.name.toUpperCase() === 'WOMEN');

        if (!hasMen) {
            await createCategory.mutateAsync({
                name: "MEN",
                slug: "men",
                description: "Fashion for men",
                display_order: 1,
                status: "Active"
            });
        }

        if (!hasWomen) {
            await createCategory.mutateAsync({
                name: "WOMEN",
                slug: "women",
                description: "Fashion for women",
                display_order: 2,
                status: "Active"
            });
        }
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
                <div className="flex items-center gap-3">
                    {categories.filter(c => ['MEN', 'WOMEN'].includes(c.name.toUpperCase())).length < 2 && (
                        <Button
                            variant="outline"
                            className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold/5 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest hidden md:flex items-center gap-2"
                            onClick={handleQuickStart}
                            disabled={createCategory.isPending}
                        >
                            <Package size={14} /> Quick Start (Men/Women)
                        </Button>
                    )}
                    <Button
                        className="bg-luxury-gold hover:bg-luxury-gold/90 text-white min-w-[160px] shadow-lg rounded-xl transition-all duration-300 h-11 text-xs font-bold uppercase tracking-wider group"
                        onClick={openAddDialog}
                        disabled={createCategory.isPending}
                    >
                        <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> Add New Line
                    </Button>
                </div>
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
                    {filteredCategories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((category) => {
                        const parent = categories.find(c => c.id === category.parent_id);
                        const isChild = !!category.parent_id;

                        return (
                            <div key={category.id} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-luxury transition-all duration-500 border border-[#E8E1D9] bg-white">
                                {/* Category Image with Overlay */}
                                <div className="relative h-64 overflow-hidden">
                                    {category.image_url ? (
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center bg-muted/30"
                                        >
                                            <Package size={48} className="text-luxury-gold/20" />
                                        </div>
                                    )}

                                    {/* Sophisticated Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Quick Actions (Floating) */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 bg-white/90 hover:bg-white text-luxury-gold shadow-lg rounded-full backdrop-blur-sm"
                                            onClick={() => openEditDialog(category)}
                                        >
                                            <Edit size={18} />
                                        </Button>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="inline-block">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn(
                                                                "h-10 w-10 shadow-lg rounded-full backdrop-blur-sm transition-all",
                                                                (category.product_count || 0) > 0 || categories.some(c => c.parent_id === category.id)
                                                                    ? "bg-gray-100/80 text-gray-400 cursor-not-allowed"
                                                                    : "bg-red-500/90 hover:bg-red-500 text-white"
                                                            )}
                                                            onClick={() => openDeleteDialog(category.id)}
                                                            disabled={(category.product_count || 0) > 0 || categories.some(c => c.parent_id === category.id)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </div>
                                                </TooltipTrigger>
                                                {((category.product_count || 0) > 0 || categories.some(c => c.parent_id === category.id)) && (
                                                    <TooltipContent className="bg-[#332D2D] text-white border-none text-[10px] font-bold uppercase tracking-widest p-3 rounded-lg shadow-xl">
                                                        <p>
                                                            {(category.product_count || 0) > 0
                                                                ? `Cannot delete: ${category.product_count} products assigned`
                                                                : "Cannot delete: Has sub-collections"}
                                                        </p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>

                                {/* Category Content */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-heading text-lg font-bold text-[#332D2D] leading-tight">
                                                    {category.name}
                                                </h3>
                                                {isChild && (
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 rounded-full font-bold uppercase tracking-widest">Child</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-0.5">{category.slug}</span>
                                        </div>
                                        <button
                                            onClick={() => toggleStatus(category)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors border",
                                                category.status === "Active"
                                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                            )}
                                        >
                                            {category.status}
                                        </button>
                                    </div>

                                    {parent && (
                                        <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg border border-border/50">
                                            <div className="h-6 w-6 rounded bg-luxury-gold/10 flex items-center justify-center">
                                                <ChevronDown size={14} className="text-luxury-gold -rotate-90" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Under Collection</span>
                                                <span className="text-xs font-bold text-[#332D2D]">{parent.name}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Package size={14} className="text-luxury-gold/50" />
                                            <span className="text-xs font-medium">{category.product_count || 0} Pieces</span>
                                        </div>
                                        <div
                                            className="w-3 h-3 rounded-full shadow-inner border border-black/5"
                                            style={{ backgroundColor: category.color }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Category Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-white rounded-2xl overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-heading font-bold text-[#332D2D]">
                            {isEditMode ? "Refine Collection" : "Curate New Line"}
                        </DialogTitle>
                        <DialogDescription className="font-body italic">
                            Delineate the details of this collection's place in your atelier.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 grid grid-cols-2 gap-8">
                        {/* Left Column - Meta */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="categoryName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Label</Label>
                                <Input
                                    id="categoryName"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Summer Soiree"
                                    className="border-[#E8E1D9] focus-visible:ring-luxury-gold h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parentCategory" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Parent Collection (Men/Women/etc)</Label>
                                <Select
                                    value={formData.parent_id || "root"}
                                    onValueChange={(value) => setFormData({ ...formData, parent_id: value === "root" ? null : value })}
                                >
                                    <SelectTrigger id="parentCategory" className="border-[#E8E1D9] focus:ring-luxury-gold h-11 bg-muted/20">
                                        <SelectValue placeholder="Select parent collection..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#E8E1D9]">
                                        <SelectItem value="root" className="font-bold text-luxury-gold">None (Root Collection)</SelectItem>
                                        <SelectSeparator />

                                        <SelectGroup>
                                            <SelectLabel className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30">Main Collections</SelectLabel>
                                            {categories.filter(c => !c.parent_id && c.id !== formData.id).length === 0 && (
                                                <div className="px-4 py-2 text-xs text-muted-foreground italic">No root categories found. Create "Men" or "Women" first.</div>
                                            )}
                                            {categories
                                                .filter(c => !c.parent_id && c.id !== formData.id)
                                                .map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectGroup>

                                        <SelectSeparator />

                                        <SelectGroup>
                                            <SelectLabel className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30">Sub-Collections</SelectLabel>
                                            {categories
                                                .filter(c => c.parent_id && c.id !== formData.id)
                                                .map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground italic">Crucial: Select "Men" or "Women" here to categorize correctly.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categorySlug" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Identifier (Slug)</Label>
                                <Input
                                    id="categorySlug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="summer-collection"
                                    className="border-[#E8E1D9] font-mono text-xs h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryDescription" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Narrative</Label>
                                <Textarea
                                    id="categoryDescription"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="The story behind this line..."
                                    className="min-h-[100px] resize-none border-[#E8E1D9] focus-visible:ring-luxury-gold"
                                />
                            </div>
                        </div>

                        {/* Right Column - Visuals */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Portfolio Image</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-square rounded-2xl border-2 border-dashed border-[#E8E1D9] hover:border-luxury-gold cursor-pointer overflow-hidden bg-muted/10 group flex items-center justify-center transition-all duration-300"
                                >
                                    {formData.image ? (
                                        <>
                                            <img
                                                src={formData.image}
                                                alt="Category Preview"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <Upload className="text-white" size={32} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                                                <Upload size={24} className="text-luxury-gold/60" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Upload Aesthetic</span>
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryTheme" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Accent Hue</Label>
                                <div className="flex gap-3">
                                    <Input
                                        id="categoryTheme"
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-14 h-11 cursor-pointer border-[#E8E1D9] p-1 rounded-lg"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="#000000"
                                        className="flex-1 border-[#E8E1D9] font-mono text-sm h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-muted/20 border-t border-border/50">
                        <Button variant="ghost" className="text-muted-foreground hover:text-[#332D2D] font-bold uppercase tracking-widest text-[10px]" onClick={() => setIsDialogOpen(false)}>
                            Discard
                        </Button>
                        <Button
                            onClick={handleSaveCategory}
                            className="bg-luxury-gold hover:bg-luxury-gold/90 text-white shadow-luxury rounded-xl px-8 h-12 text-xs font-bold uppercase tracking-[0.2em]"
                            disabled={createCategory.isPending || updateCategory.isPending}
                        >
                            {(createCategory.isPending || updateCategory.isPending) && (
                                <Loader2 size={16} className="mr-2 animate-spin" />
                            )}
                            {isEditMode ? "Finalize Changes" : "Create Line"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-heading font-bold text-[#332D2D]">Sunset this collection?</AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-muted-foreground italic">
                            This action is permanent and will remove the collection from your digital catalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-xl border-[#E8E1D9] font-bold uppercase tracking-widest text-[10px]">Back</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]"
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending && (
                                <Loader2 size={16} className="mr-2 animate-spin" />
                            )}
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminCategories;
