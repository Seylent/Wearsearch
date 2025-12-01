import { Search, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.svg";
import { ContactsDialog } from "@/components/ContactsDialog";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // If already on home page, reload the page
      window.location.reload();
    } else {
      // Navigate to home page
      navigate('/');
    }
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={handleLogoClick}>
            <img src={logo} alt="Wearsearch Logo" className="w-16 h-16 object-contain" />
            <h1 className="text-6xl font-nunito-extrabold-italic tracking-tight select-none">
              wearsearch
            </h1>
          </div>

          <nav className="flex items-center gap-6">
            <NavLink
              to="/about"
              className="text-foreground hover:text-accent transition-colors font-semibold text-2xl leading-none"
            >
              About
            </NavLink>

            {user && (
              <NavLink
                to="/favorites"
                className="text-foreground hover:text-accent transition-colors font-semibold text-2xl leading-none"
              >
                Favorites
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-foreground hover:text-accent transition-colors font-semibold text-2xl leading-none"
              >
                Admin
              </NavLink>
            )}

            <ContactsDialog />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border-2 shadow-medium">
                  <DropdownMenuItem disabled className="font-medium">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer font-medium"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* TEMPORARY: Make Admin button for sasasinitsckijj@gmail.com */}
                  {user.email === "sasasinitsckijj@gmail.com" && !isAdmin && (
                    <DropdownMenuItem
                      className="cursor-pointer text-accent font-medium"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("user_roles")
                          .insert([{ user_id: user.id, role: "admin" }]);
                        if (!error) {
                          setIsAdmin(true);
                          toast({ title: "Success", description: "You are now an admin." });
                        } else {
                          toast({ title: "Error", description: error.message });
                        }
                      }}
                    >
                      Make Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => navigate("/auth")}>
                Login
              </Button>
            )}
          </nav>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for clothing, styles, brands..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-14 h-14 text-base border-2 rounded-full focus-visible:ring-accent shadow-sm hover:shadow-md transition-shadow"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
