import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CartDrawer from "./components/CartDrawer";
import { WishlistProvider } from "./contexts/WishlistContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

// Shop Pages
import Index from "./pages/Index";
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));
const Shop = React.lazy(() => import("./pages/Shop"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Orders = React.lazy(() => import("./pages/Orders"));
const OurStory = React.lazy(() => import("./pages/OurStory"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));

// Admin pages (Lazy Loaded for faster initial site load)
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAnalytics = React.lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminProducts = React.lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = React.lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = React.lazy(() => import("./pages/admin/AdminOrders"));
const AdminCategories = React.lazy(() => import("./pages/admin/AdminCategories"));
const AdminTestimonials = React.lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminHero = React.lazy(() => import("./pages/admin/AdminHero"));
const AdminBanners = React.lazy(() => import("./pages/admin/AdminBanners"));
const AdminCustomers = React.lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCustomerSegments = React.lazy(() => import("./pages/admin/AdminCustomerSegments"));
const AdminCoupons = React.lazy(() => import("./pages/admin/AdminCoupons"));
const AdminSettings = React.lazy(() => import("./pages/admin/AdminSettings"));
const AdminInstagram = React.lazy(() => import("./pages/admin/AdminInstagram"));
const AdminCombos = React.lazy(() => import("./pages/admin/AdminCombos"));
const AdminComboForm = React.lazy(() => import("./pages/admin/AdminComboForm"));
const AdminLogin = React.lazy(() => import("./pages/admin/AdminLogin"));
const WhatsAppChatbot = React.lazy(() => import("./components/WhatsAppChatbot"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <Loader2 className="w-10 h-10 animate-spin text-luxury-gold" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AdminAuthProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="min-h-screen flex flex-col">
                  <Toaster />
                  <Sonner />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route path="/our-story" element={<OurStory />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/cookie-policy" element={<CookiePolicy />} />

                      {/* Admin Access */}
                      <Route path="/admin/login" element={<AdminLogin />} />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                      <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />
                      <Route path="/admin/hero" element={<AdminProtectedRoute><AdminHero /></AdminProtectedRoute>} />
                      <Route path="/admin/banners" element={<AdminProtectedRoute><AdminBanners /></AdminProtectedRoute>} />
                      <Route path="/admin/products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
                      <Route path="/admin/products/new" element={<AdminProtectedRoute><AdminProductForm /></AdminProtectedRoute>} />
                      <Route path="/admin/products/edit/:id" element={<AdminProtectedRoute><AdminProductForm /></AdminProtectedRoute>} />
                      <Route path="/admin/categories" element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
                      <Route path="/admin/combos" element={<AdminProtectedRoute><AdminCombos /></AdminProtectedRoute>} />
                      <Route path="/admin/combos/new" element={<AdminProtectedRoute><AdminComboForm /></AdminProtectedRoute>} />
                      <Route path="/admin/combos/edit/:id" element={<AdminProtectedRoute><AdminComboForm /></AdminProtectedRoute>} />
                      <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
                      <Route path="/admin/testimonials" element={<AdminProtectedRoute><AdminTestimonials /></AdminProtectedRoute>} />
                      <Route path="/admin/instagram" element={<AdminProtectedRoute><AdminInstagram /></AdminProtectedRoute>} />
                      <Route path="/admin/customers" element={<AdminProtectedRoute><AdminCustomers /></AdminProtectedRoute>} />
                      <Route path="/admin/customer-segments" element={<AdminProtectedRoute><AdminCustomerSegments /></AdminProtectedRoute>} />
                      <Route path="/admin/coupons" element={<AdminProtectedRoute><AdminCoupons /></AdminProtectedRoute>} />
                      <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />

                      {/* Shop Routes */}
                      <Route path="/shop" element={<Shop filterType="all" />} />
                      <Route path="/shop/:categorySlug" element={<Shop />} />
                      <Route path="/men" element={<Shop category="Men" />} />
                      <Route path="/women" element={<Shop category="Women" />} />
                      <Route path="/category/:categorySlug" element={<Shop />} />
                      <Route path="/new-in" element={<Shop filterType="new" />} />
                      <Route path="/collections" element={<Shop filterType="all" />} />
                      <Route path="/sale" element={<Shop filterType="sale" />} />
                      <Route path="/combos" element={<Shop category="Combo" />} />
                      <Route path="/search" element={<Shop filterType="all" />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <CartDrawerContainer />
                  <WhatsAppChatbot />
                </div>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Helper component to only render CartDrawer on non-admin routes
const CartDrawerContainer = () => {
  const location = useLocation();
  const isNoCartPage = location.pathname.startsWith('/admin') || location.pathname === '/admin/login';

  if (isNoCartPage) return null;
  return <CartDrawer />;
};

export default App;
