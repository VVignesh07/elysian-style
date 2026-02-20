import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AnnouncementBar from "./AnnouncementBar";
import logo from "@/assets/zerofasions.in2.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const controlNavbar = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border/50 flex flex-col transition-transform duration-500 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <AnnouncementBar />
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile left: menu + search */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-white p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-white/80 hover:text-white p-2 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Left nav */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/new-in" className="text-xs font-body text-luxury-spacing text-white/80 hover:text-white transition-colors duration-300">New In</Link>
              <Link to="/women" className="text-xs font-body text-luxury-spacing text-white/80 hover:text-white transition-colors duration-300">Women</Link>
              <Link to="/men" className="text-xs font-body text-luxury-spacing text-white/80 hover:text-white transition-colors duration-300">Men</Link>
              <Link to="/combos" className="text-xs font-body text-luxury-spacing text-white/80 hover:text-white transition-colors duration-300">Combos</Link>
              <Link to="/collections" className="text-xs font-body text-luxury-spacing text-white/80 hover:text-white transition-colors duration-300">Collections</Link>
              <Link to="/our-story" className="text-xs font-body text-luxury-spacing text-white/80 hover:text-white transition-colors duration-300">Our Story</Link>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Zero Fashion"
                className="h-10 sm:h-12 lg:h-16 w-auto object-contain brightness-110"
              />
            </Link>

            {/* Right nav */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Search Input (Desktop) */}
              <div className={`hidden lg:flex items-center transition-all duration-300 ${isSearchOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-1 pl-2 pr-8 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/40"
                  />
                  <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                    <Search size={14} />
                  </button>
                </form>
              </div>

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden lg:block text-white/80 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-white/80 hover:text-white transition-colors focus:outline-none" aria-label="Account">
                      <User size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/orders")}>
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" className="text-white/80 hover:text-white transition-colors">
                  <User size={18} />
                </Link>
              )}

              <Link to="/wishlist" className="text-white/80 hover:text-white transition-colors relative" aria-label="Wishlist">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-luxury-gold text-white text-[10px] rounded-full flex items-center justify-center font-body">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="text-white/80 hover:text-white transition-colors relative p-2 -mr-2"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-luxury-gold text-white text-[9px] rounded-full flex items-center justify-center font-bold font-body shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - slides in below navbar */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isSearchOpen ? "max-h-16 opacity-100 pb-3" : "max-h-0 opacity-0"}`}>
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-2">
              <Search size={16} className="text-white/60 shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isSearchOpen}
                className="flex-1 bg-transparent border-b border-white/20 py-1 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/40"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile menu container - Portal to body */}
      {createPortal(
        <div
          className={`lg:hidden fixed inset-0 z-[9999] transition-all duration-500 ease-in-out ${mobileOpen ? "visible opacity-100" : "invisible opacity-0"
            }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu content */}
          <div
            className={`absolute top-0 left-0 w-[85%] sm:w-[320px] h-full glass-nav border-r border-white/10 shadow-luxury transition-transform duration-500 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex flex-col h-full p-6 sm:p-8 overflow-y-auto pt-safe">
              <div className="relative flex items-center justify-center mb-10 min-h-[50px]">
                <img
                  src={logo}
                  alt="Zero Fashion"
                  className="h-12 sm:h-16 w-auto object-contain brightness-110"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                <Link
                  to="/new-in"
                  className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: "100ms" }}
                  onClick={() => setMobileOpen(false)}
                >
                  New In
                </Link>
                <Link
                  to="/women"
                  className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: "150ms" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Women
                </Link>
                <Link
                  to="/men"
                  className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: "200ms" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Men
                </Link>
                <Link
                  to="/combos"
                  className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: "225ms" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Combos
                </Link>
                <Link
                  to="/collections"
                  className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: "250ms" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  to="/sale"
                  className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: "300ms" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sale
                </Link>
                <Link
                  to="/our-story"
                  className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: "350ms" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Our Story
                </Link>
                {user && (
                  <Link
                    to="/orders"
                    className={`text-lg font-body text-luxury-spacing text-white/80 hover:text-white transition-all duration-300 transform ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                    style={{ transitionDelay: "400ms" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    My Orders
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navbar;
