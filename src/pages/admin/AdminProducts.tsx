import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts, useDeleteProduct, useAdminProducts, ProductWithCategory } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package, Tag, Loader2, Copy, Filter } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Skeleton } from "@/components/ui/skeleton";
import AdminPagination from "@/components/admin/AdminPagination";

const TableSkeleton = () => (
    <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-border/10">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[40%]" />
                    <Skeleton className="h-3 w-[20%]" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
        ))}
    </div>
);


const AdminProducts = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    // Debounce search term would be ideal, but for now we'll pass it directly or wait for Enter (refinement later)

    const pageSize = 20;
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const { data: { products = [], totalCount = 0 } = {}, isLoading } = useAdminProducts(
        page,
        pageSize,
        searchTerm,
        selectedCategory === "all" ? undefined : selectedCategory,
        supabaseAdmin
    );

    // We no longer need useProducts for all data
    // const { data: products = [], isLoading } = useProducts(...)

    const { data: categories = [] } = useCategories(supabaseAdmin);
    const deleteProduct = useDeleteProduct(supabaseAdmin);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    // Reset page when search changes
    // In a real app, useDebounce for search

    const openDeleteDialog = (id: string) => {
        setProductToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (productToDelete !== null) {
            try {
                await deleteProduct.mutateAsync(productToDelete);
                setDeleteDialogOpen(false);
                setProductToDelete(null);
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    const getCategoryName = (id: string) => {
        return categories.find(c => c.id === id)?.name || "Uncategorized";
    };

    const handleDuplicate = (product: ProductWithCategory) => {
        // Exclude ids and set status to draft, append " - Copy" to name
        const duplicateData = {
            ...product,
            name: `${product.name} - Copy`,
            sku: `${product.sku}-COPY`,
            status: "Draft",
            slug: `${product.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        };

        // Remove DB specific fields that shouldn't be copied
        delete (duplicateData as any).id;
        delete (duplicateData as any).created_at;
        delete (duplicateData as any).updated_at;

        // Navigate to new product page with state
        navigate('/admin/products/new', { state: { duplicateData } });
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <Package className="text-luxury-gold" size={32} />
                        Products
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your product inventory from Supabase.</p>
                </div>

                <Link to="/admin/products/new">
                    <Button className="bg-luxury-gold hover:bg-luxury-gold/90 text-white min-w-[160px] shadow-sm">
                        <Plus size={18} className="mr-2" /> Add Product
                    </Button>
                </Link>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/30 border-b">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search pieces..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(0);
                                    }}
                                    className="pl-9 h-10 bg-background/50 border-luxury-gold/20 focus-visible:ring-luxury-gold text-xs"
                                />
                            </div>

                            <Select
                                value={selectedCategory}
                                onValueChange={(value) => {
                                    setSelectedCategory(value);
                                    setPage(0);
                                }}
                            >
                                <SelectTrigger className="w-[160px] h-10 bg-background/50 border-luxury-gold/20 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-luxury-gold/50" />
                                        <SelectValue placeholder="All Lines" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px]">
                                    <SelectItem value="all">All Collections</SelectItem>
                                    <SelectSeparator />

                                    {/* Render all Root Categories and their children */}
                                    {categories.filter(c => !c.parent_id)
                                        .map(root => {
                                            const children = categories.filter(c => c.parent_id === root.id);

                                            // If it has children, render as a group
                                            if (children.length > 0) {
                                                return (
                                                    <SelectGroup key={root.id}>
                                                        <SelectLabel className="px-2 py-1.5 text-[10px] font-bold text-luxury-gold uppercase tracking-widest bg-luxury-gold/5">
                                                            {root.name}
                                                        </SelectLabel>
                                                        {/* Root itself is selectable */}
                                                        <SelectItem value={root.id} className="pl-4 italic">
                                                            All {root.name}
                                                        </SelectItem>
                                                        {children.map(child => (
                                                            <SelectItem key={child.id} value={child.id} className="pl-6">
                                                                {child.name}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectSeparator className="opacity-50" />
                                                    </SelectGroup>
                                                );
                                            }

                                            // If no children, render as a single item
                                            return (
                                                <SelectItem key={root.id} value={root.id}>
                                                    {root.name}
                                                </SelectItem>
                                            );
                                        })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground ml-auto bg-background/50 px-4 py-2 rounded-xl border border-border/40 uppercase tracking-widest shadow-inner">
                            <Tag size={12} className="text-luxury-gold" />
                            <span><span className="text-foreground">{totalCount}</span> Archive Records</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm font-body text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-4">Product Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Pricing</th>
                                    <th className="px-6 py-4">Inventory</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-0 py-0">
                                            <TableSkeleton />
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            {searchTerm ? "No products found matching your search." : "No products added yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-muted/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted border border-border/50 ring-1 ring-border/20 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                                                        <OptimizedImage
                                                            src={product.images?.[0] || ''}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                            width={60}
                                                        />
                                                        {product.is_featured && (
                                                            <div className="absolute top-0 right-0 p-1">
                                                                <div className="w-2 h-2 bg-luxury-gold rounded-full shadow-[0_0_8px_rgba(197,165,114,0.8)]"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground text-sm leading-tight flex items-center gap-2">
                                                            {product.name}
                                                            {product.is_new && (
                                                                <span className="text-[9px] px-1.5 py-0.5 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 rounded-full font-bold uppercase">New</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-tighter">
                                                            SKU: {product.sku || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-[11px] font-medium border border-border/50 text-muted-foreground">
                                                    <Tag size={10} />
                                                    {getCategoryName(product.category_id)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                                                    {product.discount_price && (
                                                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded mt-0.5 inline-block w-fit">
                                                            Save ₹{(product.price - product.discount_price).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-xs font-bold",
                                                        product.stock_quantity <= 5 ? "text-red-500" : "text-muted-foreground"
                                                    )}>
                                                        {product.stock_quantity} in stock
                                                    </span>
                                                    <div className="w-20 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                product.stock_quantity === 0 ? "bg-red-500 w-0" :
                                                                    product.stock_quantity <= 5 ? "bg-red-500 w-[20%]" :
                                                                        "bg-luxury-gold w-full"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                    product.status === "Active" ? "bg-green-50 text-green-700 border-green-100" :
                                                        product.status === "Draft" ? "bg-orange-50 text-orange-700 border-orange-100" :
                                                            "bg-red-50 text-red-700 border-red-100"
                                                )}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg shadow-sm border border-transparent hover:border-amber-100"
                                                        onClick={() => handleDuplicate(product)}
                                                        title="Duplicate Product"
                                                    >
                                                        <Copy size={16} />
                                                    </Button>
                                                    <Link to={`/admin/products/edit/${product.id}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg shadow-sm border border-transparent hover:border-blue-100"
                                                            title="Edit Product"
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg shadow-sm border border-transparent hover:border-red-100"
                                                        onClick={() => openDeleteDialog(product.id)}
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <AdminPagination
                        currentPage={page}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="border-luxury-gold/20 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-heading font-bold">Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground py-2">
                            This action cannot be undone. This product will be permanently removed from the Supabase database and inventory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4 gap-2">
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6"
                        >
                            {deleteProduct.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminProducts;
