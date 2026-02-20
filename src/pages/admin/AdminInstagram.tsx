import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Trash2, Instagram, Play, Loader2 } from "lucide-react";
import { useInstagramReels, useCreateReel, useDeleteReel, useUpdateReel, InstagramReel } from "@/hooks/useInstagramReels";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { toast } from "sonner";

const AdminInstagram = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newReelUrl, setNewReelUrl] = useState("");
    const [newReelCaption, setNewReelCaption] = useState("");

    const { data: reels = [], isLoading } = useInstagramReels(supabaseAdmin);
    const createReel = useCreateReel(supabaseAdmin);
    const deleteReel = useDeleteReel(supabaseAdmin);
    const updateReel = useUpdateReel(supabaseAdmin);

    // State to store script loading
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Initial load of Instagram script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            setScriptLoaded(true);
            if ((window as any).instgrm) {
                (window as any).instgrm.Embeds.process();
            }
        };

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Effect for re-processing when reels change
    useEffect(() => {
        if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
        }
    }, [reels, scriptLoaded]);

    const handleAddReel = async () => {
        if (!newReelUrl) {
            toast.error("Please enter a Reel URL");
            return;
        }

        let processedUrl = newReelUrl;

        // Check if user pasted embed code
        if (newReelUrl.includes("<blockquote")) {
            const permalinkMatch = newReelUrl.match(/data-instgrm-permalink="(.*?)"/);
            if (permalinkMatch && permalinkMatch[1]) {
                processedUrl = permalinkMatch[1];
                // Remove query params if present in the extracted URL
                processedUrl = processedUrl.split('?')[0];
            } else {
                toast.error("Could not extract URL from embed code. Please paste the direct link.");
                return;
            }
        }

        // Basic validation for Instagram URL
        if (!processedUrl.includes("instagram.com")) {
            toast.error("Please enter a valid Instagram URL");
            return;
        }

        await createReel.mutateAsync({
            reel_url: processedUrl,
            caption: newReelCaption,
            display_order: reels.length,
            is_active: true
        });

        setIsDialogOpen(false);
        setNewReelUrl("");
        setNewReelCaption("");
    };

    // ... (rest of component)


    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this reel?")) {
            await deleteReel.mutateAsync(id);
        }
    };

    const toggleStatus = async (reel: InstagramReel) => {
        await updateReel.mutateAsync({
            id: reel.id,
            is_active: !reel.is_active
        });
    };

    const getEmbedUrl = (url: string) => {
        // Strip parameters and ensure it ends with /embed/
        const cleanUrl = url.split('?')[0];
        const base = cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;
        return `${base}/embed/?autoplay=1&muted=1`;
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.3em] mb-1 block">Social Presence</span>
                    <h1 className="text-2xl font-heading font-bold text-[#332D2D]">Instagram Reels</h1>
                    <p className="text-muted-foreground mt-1 font-body text-sm italic">Curate your brand's visual stories from Instagram.</p>
                </div>
                <Button
                    className="bg-luxury-gold hover:bg-luxury-gold/90 text-white min-w-[160px] shadow-lg rounded-xl transition-all duration-300 h-11 text-xs font-bold uppercase tracking-wider group"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> Add Reel
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 size={32} className="text-luxury-gold animate-spin" />
                </div>
            ) : reels.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-[#E8E1D9]">
                    <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Instagram className="text-luxury-gold" size={32} />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#332D2D]">No Reels Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                        Start adding your best Instagram content to showcase on the homepage.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {reels.map((reel) => (
                        <div key={reel.id} className="bg-white rounded-2xl overflow-hidden border border-[#E8E1D9] shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col group">
                            {/* Video Preview */}
                            <div className="relative aspect-[9/16] bg-black">
                                <iframe
                                    src={getEmbedUrl(reel.reel_url)}
                                    className="w-full h-full object-cover scale-[1.25]"
                                    frameBorder="0"
                                    scrolling="no"
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                ></iframe>
                                <div className="absolute top-3 right-3 z-10">
                                    <Switch
                                        checked={reel.is_active}
                                        onCheckedChange={() => toggleStatus(reel)}
                                        className="data-[state=checked]:bg-green-500 shadow-lg"
                                    />
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                        {reel.caption || "No caption provided"}
                                    </p>
                                    <a
                                        href={reel.reel_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-luxury-gold mt-2 inline-flex items-center hover:underline bg-luxury-gold/5 px-2 py-1 rounded-full"
                                    >
                                        <Play size={8} className="mr-1 fill-current" /> View on Instagram
                                    </a>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Order: {reel.display_order}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => handleDelete(reel.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Instagram Reel</DialogTitle>
                        <DialogDescription>
                            Enter the details to add a new Instagram Reel to your showcase.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Reel URL</Label>
                            <Input
                                placeholder="https://www.instagram.com/reel/..."
                                value={newReelUrl}
                                onChange={(e) => setNewReelUrl(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground">Copy the full link from the browser or app.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Caption (Optional)</Label>
                            <Input
                                placeholder="Short description..."
                                value={newReelCaption}
                                onChange={(e) => setNewReelCaption(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="bg-luxury-gold hover:bg-luxury-gold/90 text-white"
                            onClick={handleAddReel}
                            disabled={createReel.isPending}
                        >
                            {createReel.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus className="mr-2" size={16} />}
                            Add Reel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminInstagram;
