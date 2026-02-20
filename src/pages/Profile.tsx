import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-luxury-gray">
                <Navbar />
                <div className="container mx-auto px-6 pt-32 pb-20">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Skeleton className="h-40 w-full rounded-2xl" />
                            <Skeleton className="h-40 w-full rounded-2xl" />
                            <Skeleton className="h-40 w-full rounded-2xl" />
                        </div>
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-luxury-gray">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl shadow-luxury border border-border p-8 mb-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
                        <div className="w-24 h-24 bg-luxury-gold/10 rounded-full flex items-center justify-center text-luxury-gold">
                            <User size={48} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-heading font-semibold text-foreground mb-1">
                                {user.user_metadata?.full_name || "Valued Customer"}
                            </h1>
                            <p className="text-muted-foreground font-body">{user.email}</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="flex items-center gap-2 border-red-100 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <LogOut size={16} />
                            Log Out
                        </Button>
                    </div>

                    {/* Quick Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div
                            onClick={() => navigate("/orders")}
                            className="bg-white p-6 rounded-2xl shadow-luxury border border-border hover:border-luxury-gold transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <Package size={24} />
                            </div>
                            <h3 className="text-lg font-heading font-medium mb-2">My Orders</h3>
                            <p className="text-sm text-muted-foreground font-body">Track, return, or buy items again</p>
                        </div>

                        <div
                            onClick={() => navigate("/wishlist")}
                            className="bg-white p-6 rounded-2xl shadow-luxury border border-border hover:border-luxury-gold transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-lg font-heading font-medium mb-2">Wishlist</h3>
                            <p className="text-sm text-muted-foreground font-body">Manage your saved items</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-luxury border border-border hover:border-luxury-gold transition-all cursor-pointer group opacity-50">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                                <MapPin size={24} />
                            </div>
                            <h3 className="text-lg font-heading font-medium mb-2">Addresses</h3>
                            <p className="text-sm text-muted-foreground font-body">Manage shipping addresses</p>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="mt-12 bg-white rounded-2xl shadow-luxury border border-border p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-xl font-heading font-semibold mb-6">Account Overview</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-border">
                                <span className="text-muted-foreground font-body">Member since</span>
                                <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-border">
                                <span className="text-muted-foreground font-body">Account Type</span>
                                <span className="font-medium bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-xs">Premium Customer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
