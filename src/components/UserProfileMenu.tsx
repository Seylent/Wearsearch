import { useState, useEffect } from 'react';
import { User, Heart, LogOut, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserData {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  role?: string;
  avatar_url?: string;
}

export function UserProfileMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    loadUser();
    window.addEventListener('authChange', loadUser);
    return () => window.removeEventListener('authChange', loadUser);
  }, []);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data:', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  if (!user) return null;

  const displayName = user.display_name || user.username || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const isAdmin = user.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-3 rounded-full border border-border/50 bg-card/40 backdrop-blur-sm p-1.5 pr-4 hover:bg-card/60 hover:border-foreground/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300">
          <Avatar className="h-9 w-9 ring-2 ring-border/50 group-hover:ring-foreground/30 transition-all">
            <AvatarImage src={user.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-foreground text-background font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
            {isAdmin && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                Admin
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-card/80 backdrop-blur-2xl border-border/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] rounded-xl p-1.5"
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-border/30">
              <AvatarImage src={user.avatar_url} alt={displayName} />
              <AvatarFallback className="bg-foreground text-background font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              {isAdmin && (
                <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                  <Shield className="h-2.5 w-2.5" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border/50 my-2" />
        
        <DropdownMenuItem 
          onClick={() => navigate('/profile')} 
          className="cursor-pointer text-foreground hover:bg-foreground/10 focus:bg-foreground/10 rounded-md mx-0.5 my-0.5 px-2.5 py-2"
        >
          <User className="h-4 w-4 mr-2.5" />
          <span className="text-sm font-medium">Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate('/favorites')} 
          className="cursor-pointer text-foreground hover:bg-foreground/10 focus:bg-foreground/10 rounded-md mx-0.5 my-0.5 px-2.5 py-2"
        >
          <Heart className="h-4 w-4 mr-2.5" />
          <span className="text-sm font-medium">Favorites</span>
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin')} 
            className="cursor-pointer text-foreground hover:bg-foreground/10 focus:bg-foreground/10 rounded-md mx-0.5 my-0.5 px-2.5 py-2"
          >
            <Settings className="h-4 w-4 mr-2.5" />
            <span className="text-sm font-medium">Admin Panel</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-border/30 my-1" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 rounded-md mx-0.5 my-0.5 px-2.5 py-2"
        >
          <LogOut className="h-4 w-4 mr-2.5" />
          <span className="text-sm font-medium">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
