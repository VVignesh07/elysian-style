import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Store, Mail, Phone, MapPin, Globe, Loader2 } from "lucide-react";

import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const AdminSettings = () => {
    const { data: dbSettings, isLoading: isFetching } = useSettings(supabaseAdmin);
    const updateSettingsMutation = useUpdateSettings(supabaseAdmin);
    const [settings, setSettings] = useState({
        store_name: "Zero Fashion",
        store_email: "contact@zerofashion.in",
        store_phone: "+91 98765 43210",
        store_address: "Zero Fashion Studio, India",
        currency: "INR",
        social_instagram: "@zerofashion_official",
        social_facebook: "zerofashion.original",
        announcement_enabled: false,
        announcement_text: "",
        announcement_bg_color: "#1A1A1A",
        announcement_text_color: "#FFFFFF",
        announcement_scrolling: false,
        announcement_scroll_speed: 15,
        announcement_coupon_code: ""
    });

    useEffect(() => {
        if (dbSettings) {
            setSettings(prev => ({
                ...prev,
                ...dbSettings
            }));
        }
    }, [dbSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const finalValue = name === "announcement_coupon_code" ? value.toUpperCase() : value;
        setSettings(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSave = () => {
        updateSettingsMutation.mutate(settings);
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="text-luxury-gold animate-spin" />
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your store configuration and preferences.</p>
                </div>
                <Button onClick={handleSave} disabled={updateSettingsMutation.isPending} className="bg-luxury-gold text-white hover:bg-black transition-colors">
                    <Save size={16} className="mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid gap-8 max-w-4xl">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Store size={20} className="text-luxury-gold" />
                            General Information
                        </CardTitle>
                        <CardDescription>
                            Basic details about your store visible to customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="store_name">Store Name</Label>
                            <Input
                                id="store_name"
                                name="store_name"
                                value={settings.store_name}
                                onChange={handleChange}
                                className="max-w-md"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Currency Code</Label>
                            <Input
                                id="currency"
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                                className="max-w-[120px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <MapPin size={20} className="text-luxury-gold" />
                            Contact Details
                        </CardTitle>
                        <CardDescription>
                            How customers can reach you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="storeEmail">Support Email</Label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="store_email"
                                        name="store_email"
                                        value={settings.store_email}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="storePhone">Support Phone</Label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="store_phone"
                                        name="store_phone"
                                        value={settings.store_phone}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="storeAddress">Physical Address</Label>
                            <Input
                                id="store_address"
                                name="store_address"
                                value={settings.store_address}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Announcement Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Store size={20} className="text-luxury-gold" />
                            Announcement Bar
                        </CardTitle>
                        <CardDescription>
                            Display a message at the top of your site.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="announcement_enabled"
                                name="announcement_enabled"
                                checked={settings.announcement_enabled}
                                onChange={(e) => setSettings(prev => ({ ...prev, announcement_enabled: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold/50"
                            />
                            <Label htmlFor="announcement_enabled" className="cursor-pointer">Enable Announcement Bar</Label>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="announcement_text">Announcement Text</Label>
                            <Input
                                id="announcement_text"
                                name="announcement_text"
                                value={settings.announcement_text}
                                onChange={handleChange}
                                placeholder="e.g. Free Shipping on Orders Over ₹999"
                                disabled={!settings.announcement_enabled}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="announcement_coupon_code">Coupon Code (Optional)</Label>
                            <Input
                                id="announcement_coupon_code"
                                name="announcement_coupon_code"
                                value={settings.announcement_coupon_code || ""}
                                onChange={handleChange}
                                placeholder="e.g. WELCOME10"
                                className="font-mono uppercase"
                                disabled={!settings.announcement_enabled}
                            />
                            <p className="text-[10px] text-muted-foreground">If provided, this code will be displayed as a clickable "copy" badge.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="announcement_bg_color">Background Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        id="announcement_bg_color"
                                        name="announcement_bg_color"
                                        value={settings.announcement_bg_color || "#1A1A1A"}
                                        onChange={handleChange}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                        disabled={!settings.announcement_enabled}
                                    />
                                    <Input
                                        type="text"
                                        name="announcement_bg_color"
                                        value={settings.announcement_bg_color || "#1A1A1A"}
                                        onChange={handleChange}
                                        className="flex-1 uppercase font-mono"
                                        placeholder="#1A1A1A"
                                        disabled={!settings.announcement_enabled}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="announcement_text_color">Text Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        id="announcement_text_color"
                                        name="announcement_text_color"
                                        value={settings.announcement_text_color || "#FFFFFF"}
                                        onChange={handleChange}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                        disabled={!settings.announcement_enabled}
                                    />
                                    <Input
                                        type="text"
                                        name="announcement_text_color"
                                        value={settings.announcement_text_color || "#FFFFFF"}
                                        onChange={handleChange}
                                        className="flex-1 uppercase font-mono"
                                        placeholder="#FFFFFF"
                                        disabled={!settings.announcement_enabled}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="announcement_scrolling"
                                name="announcement_scrolling"
                                checked={settings.announcement_scrolling || false}
                                onChange={(e) => setSettings(prev => ({ ...prev, announcement_scrolling: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold/50"
                                disabled={!settings.announcement_enabled}
                            />
                            <Label htmlFor="announcement_scrolling" className="cursor-pointer">Enable Scrolling Effect (Marquee)</Label>
                        </div>
                        {settings.announcement_scrolling && (
                            <div className="grid gap-4 mt-2 pl-6 border-l-2 border-luxury-gold/20">
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="announcement_scroll_speed">Scroll Speed (Animation Duration)</Label>
                                        <span className="text-xs font-mono bg-luxury-gold/10 text-luxury-gold px-2 py-0.5 rounded">
                                            {settings.announcement_scroll_speed}s
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            id="announcement_scroll_speed"
                                            name="announcement_scroll_speed"
                                            min="5"
                                            max="60"
                                            step="1"
                                            value={settings.announcement_scroll_speed || 15}
                                            onChange={(e) => setSettings(prev => ({ ...prev, announcement_scroll_speed: parseInt(e.target.value) }))}
                                            className="flex-1 accent-luxury-gold h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            disabled={!settings.announcement_enabled}
                                        />
                                        <span className="text-[10px] text-muted-foreground w-12 text-right">
                                            {settings.announcement_scroll_speed <= 15 ? 'Fast' : settings.announcement_scroll_speed <= 30 ? 'Normal' : 'Slow'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground"> Lower value = Faster scroll speed. Range: 5s to 60s.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Globe size={20} className="text-luxury-gold" />
                            Social Media
                        </CardTitle>
                        <CardDescription>
                            Links to your social media profiles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="socialInstagram">Instagram</Label>
                                <Input
                                    id="social_instagram"
                                    name="social_instagram"
                                    value={settings.social_instagram}
                                    onChange={handleChange}
                                    placeholder="@username"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="socialFacebook">Facebook</Label>
                                <Input
                                    id="social_facebook"
                                    name="social_facebook"
                                    value={settings.social_facebook}
                                    onChange={handleChange}
                                    placeholder="page.name"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
