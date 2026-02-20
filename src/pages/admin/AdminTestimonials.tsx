import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Trash2,
    Star,
    MessageSquare,
    User,
    Package,
    Calendar,
    MoreVertical,
    ExternalLink,
    Edit,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAllReviews, useDeleteReview, useUpdateReview } from "@/hooks/useReviews";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const TableSkeleton = () => (
    <div className="space-y-4 p-8">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-4 border-b border-border/10">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[40%]" />
                    <Skeleton className="h-3 w-[20%]" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
        ))}
    </div>
);

const AdminTestimonials = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [editingReview, setEditingReview] = useState<{ id: string, rating: number, comment: string } | null>(null);
    const { data: reviews = [], isLoading } = useAllReviews(supabaseAdmin, {
        // Aggressive caching
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });
    const deleteReview = useDeleteReview(supabaseAdmin);
    const updateReview = useUpdateReview(supabaseAdmin);

    const filteredReviews = reviews.filter(rev =>
        rev.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this testimonial?")) {
            deleteReview.mutate(id);
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReview) return;

        updateReview.mutate({
            id: editingReview.id,
            rating: editingReview.rating,
            comment: editingReview.comment
        }, {
            onSuccess: () => {
                setEditingReview(null);
            }
        });
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-1 block">Curation Hub</span>
                    <h1 className="text-2xl font-heading font-bold text-[#332D2D]">Testimonials</h1>
                    <p className="text-muted-foreground mt-1 font-body text-sm italic">Curation and management of your patrons' feedback.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Reviews</span>
                        <span className="text-base font-heading font-bold text-[#332D2D]">{reviews.length} <span className="text-[10px] font-normal text-muted-foreground italic ml-1 underline decoration-luxury-gold/30 underline-offset-4 tracking-normal">Expressions</span></span>
                    </div>
                </div>
            </div>

            <Card className="border-[#E8E1D9] shadow-sm overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border-t-4 border-t-luxury-gold">
                <CardHeader className="bg-[#FDFBF9]/50 border-b border-[#E8E1D9] p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative flex-1 max-w-md group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-luxury-gold transition-colors" />
                            <Input
                                placeholder="Search our archives..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 bg-white border-[#E8E1D9] focus-visible:ring-luxury-gold h-12 rounded-xl text-sm shadow-inner"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm font-body text-left">
                            <thead className="bg-[#FDFBF9] text-muted-foreground uppercase text-[10px] tracking-[0.2em] font-bold border-b border-[#E8E1D9]">
                                <tr>
                                    <th className="px-8 py-5">Patron</th>
                                    <th className="px-8 py-5">Piece</th>
                                    <th className="px-8 py-5">Rating</th>
                                    <th className="px-8 py-5">Feedback</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-0 py-0">
                                            <TableSkeleton />
                                        </td>
                                    </tr>
                                ) : filteredReviews.length > 0 ? (
                                    filteredReviews.map((rev) => (
                                        <tr
                                            key={rev.id}
                                            className="hover:bg-[#FDFBF9] transition-all duration-300 group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-luxury-gold/5 flex items-center justify-center text-[10px] font-bold text-luxury-gold border border-luxury-gold/10 shadow-sm">
                                                        {rev.user_name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#332D2D] text-sm group-hover:text-luxury-gold transition-colors">{rev.user_name}</div>
                                                        <div className="text-[10px] text-muted-foreground italic">{rev.user_email || 'Implicit Patron'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 group/link">
                                                        <Package size={12} className="text-luxury-gold/50" />
                                                        <Link
                                                            to={`/product/${rev.product_id}`}
                                                            className="text-xs font-bold text-[#332D2D] hover:text-luxury-gold flex items-center gap-1 transition-colors underline decoration-luxury-gold/20 underline-offset-4"
                                                        >
                                                            {rev.products?.name}
                                                        </Link>
                                                    </div>
                                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-5">
                                                        {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={i < rev.rating ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/10"}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 max-w-sm">
                                                <div className="relative">
                                                    <MessageSquare size={12} className="absolute -left-5 top-0.5 text-luxury-gold/20" />
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">"{rev.comment}"</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-all duration-300">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setEditingReview({ id: rev.id, rating: rev.rating, comment: rev.comment })}
                                                        className="h-10 w-10 border-[#E8E1D9] hover:border-luxury-gold hover:text-luxury-gold rounded-xl shadow-sm transition-all bg-white"
                                                        title="Edit Testimonial"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                        className="h-10 w-10 border-[#E8E1D9] hover:border-luxury-gold hover:text-luxury-gold rounded-xl shadow-sm transition-all bg-white"
                                                        title="View Product"
                                                    >
                                                        <Link to={`/product/${rev.product_id}`} target="_blank">
                                                            <ExternalLink size={16} />
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleDelete(rev.id)}
                                                        className="h-10 w-10 border-[#E8E1D9] hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl shadow-sm transition-all bg-white"
                                                        title="Delete Testimonial"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-6 py-8">
                                                <div className="w-20 h-20 rounded-full bg-luxury-gold/5 flex items-center justify-center border border-luxury-gold/10">
                                                    <MessageSquare size={32} className="text-luxury-gold/20" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-heading text-xl font-bold text-[#332D2D] uppercase tracking-tight">Silent Halls</h3>
                                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto italic font-body">
                                                        {searchTerm ? `Our archives hold no echoes of "${searchTerm}".` : "Your boutique awaits its first patrons' expressions."}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Review Dialog */}
            <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl">Edit Testimonial</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Modify the details of this patron's expression.
                        </DialogDescription>
                    </DialogHeader>
                    {editingReview && (
                        <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2 text-center">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Rating</Label>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setEditingReview(prev => prev ? { ...prev, rating: s } : null)}
                                                className="hover:scale-110 transition-transform p-1"
                                            >
                                                <Star
                                                    size={28}
                                                    className={s <= editingReview.rating ? "fill-luxury-gold text-luxury-gold" : "text-muted-foreground/20"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-comment" className="text-[10px] font-bold uppercase tracking-widest">Testimonial Content</Label>
                                    <Textarea
                                        id="edit-comment"
                                        value={editingReview.comment}
                                        onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                                        className="bg-muted/30 min-h-[120px] font-body text-sm"
                                        placeholder="Edit the customer's feedback..."
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button type="button" variant="outline" onClick={() => setEditingReview(null)} className="flex-1 sm:flex-none">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={updateReview.isPending}
                                    className="flex-1 sm:flex-none bg-luxury-gold text-white hover:bg-black"
                                >
                                    {updateReview.isPending ? (
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                    ) : (
                                        <Package size={16} className="mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

// Simple Eye icon since it's not imported from lucide-react in current list
const Eye = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default AdminTestimonials;
