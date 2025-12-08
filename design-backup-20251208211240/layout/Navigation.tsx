import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ContactsDialog } from "@/components/ContactsDialog";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { authService, User } from "@/services/authService";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsAdmin(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      // Save user to localStorage so UserProfileMenu can access it
      localStorage.setItem('user', JSON.stringify(userData));
      // Trigger authChange event for other components
      window.dispatchEvent(new Event('authChange'));
    } catch (error: any) {
      // Don't log 401 errors - they're expected for expired/invalid tokens
      if (error?.message !== 'Unauthorized') {
        console.error('Failed to check auth:', error);
      }
      // Clear tokens on auth failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
      setUser(null);
      setIsAdmin(false);
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 cursor-pointer shrink-0" onClick={handleLogoClick}>
            <img
              src="/logo-techno.svg"
              alt="WearSearch"
              className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all"
            />
          </div>

          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search products, brands, stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-10 bg-card/50 border-white/10 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all backdrop-blur-sm"
              />
            </div>
          </div>

          <nav className="flex items-center gap-8">
            <NavLink
              to="/stores"
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
            >
              Stores
            </NavLink>
            
            <NavLink
              to="/about"
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
            >
              About
            </NavLink>

            {user && (
              <NavLink
                to="/favorites"
                className="text-sm font-medium uppercase tracking-widest text-muted-foreground hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
              >
                Favorites
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-sm font-medium uppercase tracking-widest text-muted-foreground hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
              >
                Admin
              </NavLink>
            )}

            <ContactsDialog />

            {user ? (
              <UserProfileMenu />
            ) : (
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white hover:text-black transition-all uppercase tracking-wider text-xs h-9 px-6 rounded-full hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}
          </nav>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-10 bg-card/50 border-white/10 rounded-full text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </header>
  );
};

