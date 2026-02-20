import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, X, Plus, Save, Package, Palette, Layers, DollarSign, Tag, Loader2 } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useProduct, useCheckSKU, useCheckSlug } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: product, isLoading: productLoading } = useProduct(id || "", supabaseAdmin);
    const { data: categories = [], isLoading: categoriesLoading } = useCategories(supabaseAdmin);
    const createProduct = useCreateProduct(supabaseAdmin);
    const updateProduct = useUpdateProduct(supabaseAdmin);
    const checkSKU = useCheckSKU(supabaseAdmin);
    const checkSlug = useCheckSlug(supabaseAdmin);

    const [skuError, setSkuError] = useState("");
    const [slugError, setSlugError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [isCheckingSku, setIsCheckingSku] = useState(false);

    const initialFormState = {
        name: "",
        sku: "",
        category_id: "",
        price: "",
        discountPrice: "",
        description: "",
        stock: "0",
        images: [] as string[],
        sizes: [] as string[],
        colors: [] as string[],
        details: [] as string[],
        is_featured: false,
        is_new: false,
        show_limited_stock: false,
        status: "Active" as "Active" | "Inactive" | "Draft",
    };

    const [formData, setFormData] = useState(initialFormState);
    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

    useEffect(() => {
        if (isEditMode && product) {
            setFormData({
                name: product.name,
                sku: product.sku || "",
                category_id: product.category_id || "",
                price: product.price.toString(),
                discountPrice: product.discount_price?.toString() || "",
                description: product.description || "",
                stock: product.stock_quantity.toString(),
                images: product.images || [],
                sizes: product.sizes || [],
                colors: product.colors || [],
                details: product.details || [],
                is_featured: product.is_featured,
                is_new: product.is_new,
                show_limited_stock: !!product.show_limited_stock,
                status: product.status,
            });
        } else if (!isEditMode) {
            const params = new URLSearchParams(window.location.search);
            const preselectedCategory = params.get("category_id");
            if (preselectedCategory) {
                setFormData(prev => ({ ...prev, category_id: preselectedCategory }));
            }
        }
    }, [product, isEditMode]);

    const handleAddDetail = () => {
        setFormData(prev => ({ ...prev, details: [...prev.details, ""] }));
    };

    const updateDetail = (index: number, value: string) => {
        const newDetails = [...formData.details];
        newDetails[index] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const removeDetail = (index: number) => {
        setFormData(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const toggleSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    };

    const validateSKU = async (sku: string) => {
        if (!sku) {
            setSkuError("");
            return true;
        }

        setIsCheckingSku(true);
        try {
            const isDuplicate = await checkSKU.mutateAsync({ sku, excludeId: id });
            if (isDuplicate) {
                setSkuError("This SKU is already assigned to another product");
                return false;
            } else {
                setSkuError("");
                return true;
            }
        } catch (error) {
            console.error("Error checking SKU:", error);
            return true;
        } finally {
            setIsCheckingSku(false);
        }
    };

    const validateSlug = async (name: string) => {
        const slug = generateSlug(name);
        if (!slug) {
            setSlugError("");
            return true;
        }

        try {
            const isDuplicate = await checkSlug.mutateAsync({ slug, excludeId: id });
            if (isDuplicate) {
                setSlugError("A product with a similar name already exists");
                return false;
            } else {
                setSlugError("");
                return true;
            }
        } catch (error) {
            console.error("Error checking slug:", error);
            return true;
        }
    };

    const generateRandomSKU = async () => {
        const category = categories.find(c => c.id === formData.category_id);
        const prefix = category ? category.name.substring(0, 3).toUpperCase() : "PRD";
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const date = new Date().getFullYear().toString().substring(2);
        const newSku = `${prefix}-${random}-${date}`;

        setFormData(prev => ({ ...prev, sku: newSku }));
        await validateSKU(newSku);
        toast.info(`Generated SKU: ${newSku}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.category_id) {
            toast.error("Please fill in all required fields (Name, Price, Category)");
            return;
        }

        setIsValidating(true);
        try {
            // Simultaneous pre-flight checks
            const [skuValid, slugValid] = await Promise.all([
                validateSKU(formData.sku),
                validateSlug(formData.name)
            ]);

            if (!skuValid || !slugValid) {
                const description = !skuValid ? "SKU already exists." : "Product name/slug already exists.";
                toast.error("Validation failed", { description });
                setIsValidating(false);
                return;
            }

            const productData = {
                name: formData.name,
                slug: generateSlug(formData.name),
                description: formData.description,
                category_id: formData.category_id,
                price: parseFloat(formData.price),
                discount_price: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
                sku: formData.sku,
                stock_quantity: parseInt(formData.stock),
                images: formData.images,
                sizes: formData.sizes,
                colors: formData.colors,
                details: formData.details.filter(d => d.trim() !== ""),
                is_featured: formData.is_featured,
                is_new: formData.is_new,
                show_limited_stock: formData.show_limited_stock,
                status: formData.status,
            };

            if (isEditMode && id) {
                await updateProduct.mutateAsync({ id, ...productData });
            } else {
                await createProduct.mutateAsync(productData);
            }
            navigate("/admin/products");
        } catch (error) {
            // Error is handled in the hook's mutation logic with auto-retry
        } finally {
            setIsValidating(false);
        }
    };

    if (isEditMode && productLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 size={32} className="text-luxury-gold animate-spin" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const isPending = createProduct.isPending || updateProduct.isPending || isValidating;

    return (
        <AdminLayout>
            <form onSubmit={handleSubmit} className="max-w-[1800px] mx-auto h-[calc(100vh-80px)] flex flex-col overflow-hidden">
                {/* Compact Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-background/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-heading font-bold text-foreground">
                                {isEditMode ? "Edit Product" : "New Product"}
                            </h1>
                            {isEditMode && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                                    formData.status === "Active" ? "bg-green-100 text-green-700" :
                                        formData.status === "Draft" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {formData.status}
                                </span>
                            )}
                        </div>
                        <div className="h-4 w-px bg-border/60" />
                        <p className="text-muted-foreground text-xs hidden sm:block truncate max-w-sm">
                            {formData.name || "Untitled Product"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/admin/products")}
                            disabled={isPending}
                            className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-muted/50"
                        >
                            Cancel
                        </Button>
                        {!isEditMode && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, status: "Draft" }));
                                    setTimeout(() => {
                                        const form = document.querySelector('form');
                                        if (form) form.requestSubmit();
                                    }, 0);
                                }}
                                disabled={isPending}
                                className="h-8 text-[10px] font-bold uppercase tracking-widest border-border text-muted-foreground hover:bg-muted/50 hidden sm:flex"
                            >
                                Save as Draft
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending}
                            className="h-8 bg-foreground text-white hover:bg-foreground/90 px-4 rounded-lg transition-all shadow-md flex items-center gap-2"
                        >
                            {isPending ? (
                                <Loader2 size={16} className="mr-2 animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            <span className="font-bold text-[10px] uppercase tracking-widest">
                                {isValidating ? "Validating..." : (isEditMode ? "Save Changes" : "Publish")}
                            </span>
                        </Button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden min-h-0">
                    {/* Col 1: Visuals (3/12) */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto pr-1">
                        <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col">
                            <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-luxury-gold/5 text-luxury-gold">
                                            <Upload size={14} />
                                        </div>
                                        <h3 className="font-bold text-sm">Gallery</h3>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{formData.images.length} Images</span>
                                </div>

                                {/* Main Image Preview */}
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted/30 border flex items-center justify-center group/main">
                                    {formData.images.length > 0 ? (
                                        <>
                                            <img
                                                src={formData.images[0]}
                                                alt="Product"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/main:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(0)}
                                                    className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 p-4 text-center">
                                            <Upload size={24} className="opacity-20" />
                                            <span className="text-[10px]">Main Display Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                <div className="grid grid-cols-4 gap-2">
                                    {formData.images.slice(1).map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border group">
                                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx + 1)}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-md border-2 border-dashed border-luxury-gold/40 bg-luxury-gold/5 flex flex-col items-center justify-center hover:bg-luxury-gold/10 transition-all gap-1"
                                    >
                                        <Plus size={14} className="text-luxury-gold" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Col 2: Core Details (5/12) */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-1">
                        <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden">
                            <CardContent className="p-5 space-y-5">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                    <div className="p-1.5 rounded-md bg-luxury-gold/5 text-luxury-gold">
                                        <Package size={14} />
                                    </div>
                                    <h3 className="font-bold text-sm">Core Information</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => {
                                                setFormData({ ...formData, name: e.target.value });
                                                if (slugError) setSlugError("");
                                            }}
                                            onBlur={(e) => validateSlug(e.target.value)}
                                            placeholder="e.g. Premium Silk Saree"
                                            className={cn(
                                                "h-9 text-sm font-medium bg-muted/30 focus-visible:ring-luxury-gold transition-colors",
                                                slugError ? "border-red-500 bg-red-50/10 focus-visible:ring-red-500" : ""
                                            )}
                                            required
                                        />
                                        {slugError && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{slugError}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5 w-full">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="sku" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU</Label>
                                                <button
                                                    type="button"
                                                    onClick={generateRandomSKU}
                                                    className="text-[9px] font-bold text-luxury-gold hover:underline uppercase tracking-tighter"
                                                >
                                                    Generate
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="sku"
                                                    value={formData.sku}
                                                    onChange={(e) => {
                                                        const val = e.target.value.toUpperCase();
                                                        setFormData({ ...formData, sku: val });
                                                        if (skuError) setSkuError("");
                                                    }}
                                                    onBlur={(e) => validateSKU(e.target.value)}
                                                    placeholder="SLK-BW-001"
                                                    className={cn(
                                                        "h-9 text-xs font-mono bg-muted/30 focus-visible:ring-luxury-gold transition-colors",
                                                        skuError ? "border-red-500 bg-red-50/10 focus-visible:ring-red-500" : ""
                                                    )}
                                                />
                                                {isCheckingSku && (
                                                    <div className="absolute right-2 top-2">
                                                        <Loader2 size={12} className="animate-spin text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            {skuError && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">{skuError}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                                            <Select
                                                value={formData.category_id}
                                                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                            >
                                                <SelectTrigger className="h-9 text-xs bg-muted/30">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(category => (
                                                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value: "Active" | "Inactive" | "Draft") => setFormData({ ...formData, status: value })}
                                            >
                                                <SelectTrigger className="h-9 text-xs bg-muted/30">
                                                    <SelectValue placeholder="Select status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Draft">Draft</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 bg-muted/10 p-3 rounded-xl border border-border/40">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</Label>
                                            <div className="relative">
                                                <DollarSign size={10} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="h-9 pl-7 text-sm font-mono bg-white"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="discount" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Discount</Label>
                                            <div className="relative">
                                                <Tag size={10} className="absolute left-2.5 top-2.5 text-green-600" />
                                                <Input
                                                    id="discount"
                                                    type="number"
                                                    value={formData.discountPrice}
                                                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                                                    className="h-9 pl-7 text-sm font-mono bg-white text-green-600"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="stock" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock</Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                className="h-9 text-sm font-mono bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Product narrative..."
                                            className="min-h-[120px] text-xs bg-muted/30 resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_featured"
                                                checked={formData.is_featured}
                                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold"
                                            />
                                            <Label htmlFor="is_featured" className="text-xs cursor-pointer">Featured Product</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_new"
                                                checked={formData.is_new}
                                                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold"
                                            />
                                            <Label htmlFor="is_new" className="text-xs cursor-pointer">New Arrival</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="show_limited_stock"
                                                checked={formData.show_limited_stock}
                                                onChange={(e) => setFormData({ ...formData, show_limited_stock: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold"
                                            />
                                            <Label htmlFor="show_limited_stock" className="text-xs cursor-pointer italic text-orange-600 font-bold">Limited Stock Label</Label>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Col 3: Variants (4/12) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-1">
                        <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden flex flex-col">
                            <CardContent className="p-5 space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                                    <div className="p-1.5 rounded-md bg-luxury-gold/5 text-luxury-gold">
                                        <Layers size={14} />
                                    </div>
                                    <h3 className="font-bold text-sm">Variants & Extras</h3>
                                </div>

                                {/* Sizes */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sizes</Label>
                                        <span className="text-[10px] text-muted-foreground">{formData.sizes.length} selected</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {availableSizes.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={cn(
                                                    "h-7 px-3 rounded-md border text-[10px] font-bold transition-all",
                                                    formData.sizes.includes(size)
                                                        ? "bg-luxury-gold border-luxury-gold text-white"
                                                        : "bg-muted/10 border-border/40 hover:border-luxury-gold/40"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom / Non-standard Sizes selected */}
                                    {formData.sizes.filter(s => !availableSizes.includes(s)).length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Custom Sizes Selected:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {formData.sizes.filter(s => !availableSizes.includes(s)).map((size) => (
                                                    <div
                                                        key={size}
                                                        className="h-7 px-3 pr-1 rounded-md bg-luxury-gold/10 border border-luxury-gold/20 text-[10px] font-bold text-luxury-gold flex items-center gap-1"
                                                    >
                                                        {size}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSize(size)}
                                                            className="p-1 hover:text-red-500"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="custom-size-input"
                                            placeholder="Add custom size..."
                                            className="h-8 text-xs bg-muted/30"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.currentTarget;
                                                    const val = input.value.trim().toUpperCase();
                                                    if (!val) return;
                                                    if (!formData.sizes.includes(val)) {
                                                        setFormData(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
                                                        input.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold hover:text-white"
                                            onClick={() => {
                                                const input = document.getElementById('custom-size-input') as HTMLInputElement;
                                                const val = input.value.trim().toUpperCase();
                                                if (val && !formData.sizes.includes(val)) {
                                                    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus size={14} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div className="space-y-3 pt-3 border-t border-border/30">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Colors</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                id="color-picker"
                                                className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                                                onChange={(e) => {
                                                    const hex = e.target.value.toUpperCase();
                                                    if (!formData.colors.includes(hex)) {
                                                        setFormData(prev => ({ ...prev, colors: [...prev.colors, hex] }));
                                                    }
                                                }}
                                            />
                                            <label htmlFor="color-picker" className="text-[9px] font-bold text-luxury-gold cursor-pointer hover:underline">
                                                ADD COLOR
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {formData.colors.map((c, index) => {
                                            const hex = c.includes('|') ? c.split('|')[1] : c;
                                            return (
                                                <button
                                                    key={`${c}-${index}`}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        colors: prev.colors.filter((_, i) => i !== index)
                                                    }))}
                                                    className="group relative aspect-square rounded-md overflow-hidden border border-border/40 hover:border-red-500/50 transition-colors"
                                                    title={hex}
                                                >
                                                    <div className="w-full h-full" style={{ backgroundColor: hex }} />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20">
                                                        <X size={12} className="text-white drop-shadow-md" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 pt-3 border-t border-border/30">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Details</Label>
                                        <button
                                            type="button"
                                            onClick={handleAddDetail}
                                            className="text-[9px] font-bold text-luxury-gold hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={10} /> ADD ITEM
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                        {formData.details.map((detail, idx) => (
                                            <div key={idx} className="flex gap-2 group">
                                                <Input
                                                    value={detail}
                                                    onChange={(e) => updateDetail(idx, e.target.value)}
                                                    placeholder="Detail..."
                                                    className="h-8 text-xs bg-muted/30"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeDetail(idx)}
                                                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout >
    );
};

export default AdminProductForm;
