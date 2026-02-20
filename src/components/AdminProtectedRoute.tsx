import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { ShieldCheck, Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
    const { user, isAdmin, loading } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-luxury-gold" />
                </div>
            </div>
        );
    }

    if (!user || !isAdmin()) {
        if (user && !isAdmin()) {
            console.warn("🔐 AdminProtectedRoute - Unauthorized access attempt. Signed in user:", user.email, "lacks admin privileges.");
        } else if (!user) {
            console.log("🔐 AdminProtectedRoute - No user signed in, redirecting to login.");
        }

        if (!user) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }

        // If user is logged in but not admin, show explicit error instead of loop
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-6 text-center px-4">
                <div className="bg-red-50 p-6 rounded-full">
                    <ShieldCheck className="h-12 w-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                    <p className="text-muted-foreground max-w-md">
                        You are signed in as <span className="font-semibold text-foreground">{user.email}</span>,
                        but this account does not have administrative privileges.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => {
                            // Clear everything
                            localStorage.removeItem('zero_fashion_admin_role');
                            window.location.href = '/admin/login';
                        }}
                        className="px-6 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
