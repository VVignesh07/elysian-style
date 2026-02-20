import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { Upload, X, Plus, Save, Package, Palette, Layers, DollarSign, Tag, Loader2, Sparkles } from "lucide-react";
import {
    useCreateProduct,
    useUpdateProduct,
    useProduct,
    useCheckSKU,
    useCheckSlug
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminComboForm = () => {
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

    // Find the Combo category
    const comboCategory = categories.find(c =>
        c.name.toLowerCase() === 'combo' ||
        c.slug.toLowerCase() === 'combo' ||
        c.name.toLowerCase() === 'combos'
    );

    const initialFormState = {
        name: "",
        sku: "",
        category_id: "",
        price: "",
        discountPrice: "",
        description: "",
        stock: "100",
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
    const availableSizes = ["S", "M", "L", "XL", "XXL", "FREESIZE"];

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
        } else if (!isEditMode && comboCategory) {
            setFormData(prev => ({ ...prev, category_id: comboCategory.id }));
        }
    }, [product, isEditMode, comboCategory]);

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
        if (files) {
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
                setSkuError("SKU already exists");
                return false;
            } else {
                setSkuError("");
                return true;
            }
        } catch (error) {
            return true;
        } finally {
            setIsCheckingSku(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields = [];
        if (!formData.name) missingFields.push("Name");
        if (!formData.price) missingFields.push("Price");
        if (!formData.category_id) missingFields.push("Category (Make sure a 'Combo' category exists)");

        if (missingFields.length > 0) {
            toast.error(`Missing fields: ${missingFields.join(", ")}`);
            return;
        }

        setIsValidating(true);
        try {
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
            navigate("/admin/combos");
        } catch (error) {
            console.error(error);
        } finally {
            setIsValidating(false);
        }
    };

    if (isEditMode && productLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 size={32} className="text-luxury-gold animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    const isPending = createProduct.isPending || updateProduct.isPending || isValidating;

    return (
        <AdminLayout>
            <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-8 pb-12">
                {!comboCategory && !categoriesLoading && !isEditMode && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4 flex items-center gap-3 text-red-700">
                            <Tag size={20} />
                            <p className="text-sm font-bold">
                                Warning: 'Combo' category not found. Please create it in <Link to="/admin/categories" className="underline">Categories</Link> first, otherwise you won't be able to save.
                            </p>
                        </CardContent>
                    </Card>
                )}
                <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-20 py-4 border-b">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="text-luxury-gold" size={24} />
                            {isEditMode ? "Edit Combo" : "New Combo Package"}
                        </h1>
                        <p className="text-sm text-muted-foreground">Properly manage your curated product bundles.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate("/admin/combos")}>Cancel</Button>
                        <Button type="submit" disabled={isPending} className="bg-luxury-gold text-white hover:bg-luxury-gold/90">
                            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                            {isEditMode ? "Save Changes" : "Publish Combo"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Combo Name *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Traditional Wedding Combo"
                                            className="h-12 text-lg font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Price (₹) *</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                <Input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                    className="pl-9 h-11"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Discount Price (₹)</Label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={16} />
                                                <Input
                                                    type="number"
                                                    value={formData.discountPrice}
                                                    onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                                                    className="pl-9 h-11 text-green-600 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[150px] resize-none"
                                            placeholder="Describe what's in this bundle..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                                    <Layers size={16} className="text-luxury-gold" />
                                    Bundle Components & Details
                                </h3>
                                <div className="space-y-4">
                                    {formData.details.map((detail, idx) => (
                                        <div key={idx} className="flex gap-2 group">
                                            <Input
                                                value={detail}
                                                onChange={(e) => updateDetail(idx, e.target.value)}
                                                placeholder="e.g. Included: 1 Silk Saree + 1 Stitched Blouse"
                                                className="bg-muted/30"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeDetail(idx)}
                                                className="text-red-500 hover:bg-red-50"
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddDetail}
                                        className="w-full border-dashed"
                                    >
                                        <Plus size={16} className="mr-2" /> Add Component Detail
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Visuals & Inventory */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center justify-between">
                                    Combo Gallery
                                    <span className="text-luxury-gold">{formData.images.length}/8</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {formData.images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="text-white" size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.length < 8 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center hover:bg-muted hover:border-luxury-gold/50 transition-all text-muted-foreground"
                                        >
                                            <Upload size={24} />
                                            <span className="text-[10px] mt-1 font-bold">UPLOAD</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Inventory & Tracking</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold">STOCK</Label>
                                            <Input
                                                type="number"
                                                value={formData.stock}
                                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold">SKU</Label>
                                            <Input
                                                value={formData.sku}
                                                onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                                onBlur={e => validateSKU(e.target.value)}
                                                className={cn(skuError ? "border-red-500" : "")}
                                            />
                                        </div>
                                    </div>
                                    {skuError && <p className="text-[9px] text-red-500 font-bold">{skuError}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Status</Label>
                                    <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active (Visible)</SelectItem>
                                            <SelectItem value="Inactive">Inactive (Hidden)</SelectItem>
                                            <SelectItem value="Draft">Draft (Internal)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs cursor-pointer" htmlFor="featured">Featured Package</Label>
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            checked={formData.is_featured}
                                            onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                            className="w-4 h-4 rounded text-luxury-gold focus:ring-luxury-gold"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs cursor-pointer" htmlFor="new">New Arrival</Label>
                                        <input
                                            type="checkbox"
                                            id="new"
                                            checked={formData.is_new}
                                            onChange={e => setFormData({ ...formData, is_new: e.target.checked })}
                                            className="w-4 h-4 rounded text-luxury-gold focus:ring-luxury-gold"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs cursor-pointer italic text-orange-600 font-bold" htmlFor="show_limited_stock">Limited Stock Label</Label>
                                        <input
                                            type="checkbox"
                                            id="show_limited_stock"
                                            checked={formData.show_limited_stock}
                                            onChange={e => setFormData({ ...formData, show_limited_stock: e.target.checked })}
                                            className="w-4 h-4 rounded text-luxury-gold focus:ring-luxury-gold"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Available Variants</Label>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {availableSizes.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => toggleSize(s)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all",
                                                    formData.sizes.includes(s)
                                                        ? "bg-luxury-gold border-luxury-gold text-white"
                                                        : "bg-muted/10 hover:bg-muted"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {formData.colors.map((c, i) => (
                                            <div
                                                key={i}
                                                className="w-8 h-8 rounded-full border border-white shadow-sm relative group cursor-pointer"
                                                style={{ backgroundColor: c }}
                                                onClick={() => setFormData({ ...formData, colors: formData.colors.filter((_, idx) => idx !== i) })}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-full">
                                                    <X size={12} className="text-white" />
                                                </div>
                                            </div>
                                        ))}
                                        <label className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted text-muted-foreground">
                                            <Plus size={16} />
                                            <input
                                                type="color"
                                                className="hidden"
                                                onChange={e => {
                                                    const hex = e.target.value.toUpperCase();
                                                    if (!formData.colors.includes(hex)) setFormData({ ...formData, colors: [...formData.colors, hex] });
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AdminComboForm;
