import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { authService, User } from "@/services/authService";
import { Search, User as UserIcon } from "lucide-react";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUser(null);
        setIsAdmin(false);
        return;
      }
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAdmin((userData as any)?.role === "admin");
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("authChange"));
    } catch (e) {
      setUser(null);
      setIsAdmin(false);
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") window.location.reload();
    else navigate("/");
  };

  const navLinks = [
    { name: "New Arrivals", href: "/products" },
    { name: "Collections", href: "/products" },
    { name: "Stores", href: "/stores" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav className="flex items-center gap-2 px-2 py-2 rounded-full border border-border/40 bg-card/80 backdrop-blur-xl shadow-lg shadow-black/20">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 px-4 cursor-pointer" 
          onClick={handleLogoClick}
        >
          <div className="w-8 h-8 rounded-lg border border-foreground/30 flex items-center justify-center bg-card/50 backdrop-blur-sm">
            <span className="font-display font-bold text-sm">W</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight hidden sm:block">Wearsearch</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-foreground/10 ${
                location.pathname === link.href 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-foreground/10 ${
                location.pathname === "/admin" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 pl-2">
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors"
            onClick={() => navigate("/products")}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          
          {user ? (
            <UserProfileMenu />
          ) : (
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors"
              onClick={() => navigate("/auth")}
            >
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigation;

// Also provide a named export for callers that import { Navigation }
export { Navigation };
