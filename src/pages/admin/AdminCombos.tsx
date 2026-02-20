import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    useAdminProducts,
    useDeleteProduct,
} from "@/hooks/useProducts";
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
    Plus,
    Search,
    Edit,
    Trash2,
    Tag,
    Sparkles
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Skeleton } from "@/components/ui/skeleton";
import AdminPagination from "@/components/admin/AdminPagination";
import { toast } from "sonner";

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

const AdminCombos = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const pageSize = 20;

    const { data: categories = [], isLoading: categoriesLoading } = useCategories(supabaseAdmin);

    // Find the Combo category ID
    const comboCategory = useMemo(() =>
        categories.find(c => c.name.toLowerCase() === 'combo' || c.slug.toLowerCase() === 'combo' || c.name.toLowerCase() === 'combos'),
        [categories]
    );

    // Use a dummy ID if not found to prevent showing all products
    const filterCategoryId = useMemo(() => {
        if (categoriesLoading) return undefined;
        return comboCategory?.id || "00000000-0000-0000-0000-000000000000";
    }, [categoriesLoading, comboCategory]);

    const { data: { products = [], totalCount = 0 } = {}, isLoading: productsLoading } = useAdminProducts(
        page,
        pageSize,
        searchTerm,
        filterCategoryId,
        supabaseAdmin
    );

    const isLoading = categoriesLoading || productsLoading;

    // Actions
    const deleteProduct = useDeleteProduct(supabaseAdmin);

    // Dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

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

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <Sparkles className="text-luxury-gold" size={32} />
                        Combos & Bundles
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your curated product combinations.</p>
                </div>

                <div className="flex gap-3">
                    <Link to="/admin/categories">
                        <Button variant="outline" className="border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold/5">
                            Manage Categories
                        </Button>
                    </Link>
                    <Button
                        onClick={() => navigate("/admin/combos/new")}
                        className="bg-luxury-gold hover:bg-luxury-gold/90 text-white min-w-[160px] shadow-sm"
                    >
                        <Plus size={18} className="mr-2" /> Add Combo
                    </Button>
                </div>
            </div>

            {!comboCategory && !isLoading && (
                <Card className="mb-8 border-orange-200 bg-orange-50/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                            <Tag size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-900">Combo Category Missing</h3>
                            <p className="text-sm text-orange-800/70">
                                To see combos here, please create a category named "Combo" in the <Link to="/admin/categories" className="underline font-bold">Categories</Link> section.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/30 border-b">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full max-w-sm">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search combos..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(0);
                                }}
                                className="pl-10 bg-background/50 border-luxury-gold/20 focus-visible:ring-luxury-gold"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto bg-background/50 px-3 py-1.5 rounded-full border">
                            <Sparkles size={14} className="text-luxury-gold" />
                            <span>Total: <span className="font-bold text-foreground">{totalCount}</span> Combos</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm font-body text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-4">Combo Info</th>
                                    <th className="px-6 py-4">Pricing</th>
                                    <th className="px-6 py-4">Inventory</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-0 py-0">
                                            <TableSkeleton />
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            {searchTerm ? "No combos found matching your search." : "No combos added yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted border border-border/50 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                                                        <OptimizedImage
                                                            src={product.images?.[0] || ''}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                            width={60}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground text-sm leading-tight flex items-center gap-2">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-tighter">
                                                            SKU: {product.sku || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                                                    {product.discount_price && (
                                                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded mt-0.5 inline-block w-fit">
                                                            Sale: ₹{product.discount_price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    product.stock_quantity <= 5 ? "text-red-500" : "text-muted-foreground"
                                                )}>
                                                    {product.stock_quantity} in stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                    product.status === "Active" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
                                                )}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-white">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                        onClick={() => navigate(`/admin/combos/edit/${product.id}`)}
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => openDeleteDialog(product.id)}>
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

                    <AdminPagination
                        currentPage={page}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Combo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this combo from your inventory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminCombos;
