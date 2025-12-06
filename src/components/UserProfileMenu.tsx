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
        <button className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm p-1 pr-3 hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300">
          <Avatar className="h-8 w-8 ring-2 ring-white/20">
            <AvatarImage src={user.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-white text-black font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white hidden md:inline">{displayName}</span>
          {isAdmin && (
            <Badge variant="outline" className="text-xs py-0 px-2 hidden md:inline-flex border-white/30 text-white bg-white/5">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-xl border-white/20">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{displayName}</p>
            <p className="text-xs leading-none text-white/60">{user.email}</p>
            {isAdmin && (
              <Badge variant="outline" className="text-xs py-0 px-2 w-fit mt-1 border-white/30 text-white bg-white/10">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/favorites')} className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
          <Heart className="mr-2 h-4 w-4" />
          <span>Saved Products</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
            <Settings className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
