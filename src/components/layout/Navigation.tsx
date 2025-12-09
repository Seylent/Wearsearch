import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { ContactsDialog } from "@/components/ContactsDialog";
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
    { name: "New Arrivals", href: "/" },
    { name: "Collections", href: "/products" },
    { name: "Stores", href: "/stores" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
      <nav className="flex items-center justify-between gap-8 px-6 py-3 rounded-full border border-zinc-700/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/60 max-w-7xl w-full neon-glow-soft">
        {/* Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer" 
          onClick={handleLogoClick}
        >
          <div className="w-9 h-9 rounded-lg border border-zinc-600/80 flex items-center justify-center bg-zinc-800/60 shadow-lg shadow-white/5">
            <span className="font-display font-bold text-sm text-white">W</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Wearsearch
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
                location.pathname === link.href 
                  ? "text-white bg-zinc-800/80 shadow-lg shadow-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:shadow-md hover:shadow-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <ContactsDialog />
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
                location.pathname === "/admin" 
                  ? "text-white bg-zinc-800/80 shadow-lg shadow-white/10" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:shadow-md hover:shadow-white/5"
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <button 
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-800/60 hover:shadow-md hover:shadow-white/10 transition-all duration-300"
            onClick={() => navigate("/products")}
          >
            <Search className="w-4 h-4 text-zinc-400" />
          </button>
          
          {user ? (
            <UserProfileMenu />
          ) : (
            <button 
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-800/60 hover:shadow-md hover:shadow-white/10 transition-all duration-300"
              onClick={() => navigate("/auth")}
            >
              <UserIcon className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigation;

export { Navigation };
