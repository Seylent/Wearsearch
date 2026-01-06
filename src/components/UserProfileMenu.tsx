import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Heart, LogOut, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, clearAuth } from '@/utils/authStorage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const { t } = useTranslation();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    loadUser();
    
    // Listen for auth events
    window.addEventListener('authChange', loadUser);
    window.addEventListener('auth:logout', loadUser);
    window.addEventListener('auth:login', loadUser);
    window.addEventListener('storage', loadUser);
    
    return () => {
      window.removeEventListener('authChange', loadUser);
      window.removeEventListener('auth:logout', loadUser);
      window.removeEventListener('auth:login', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const loadUser = () => {
    // Check if authenticated using unified auth storage
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }
    
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
    clearAuth();
    setUser(null);
    window.dispatchEvent(new Event('auth:logout'));
    navigate('/');
  };

  if (!user) return null;

  const displayName = user.display_name || user.username || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const isAdmin = user.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-3 rounded-full border border-border/50 bg-card/40 backdrop-blur-sm p-2 pr-4 md:p-1.5 md:pr-3 min-h-[44px] md:min-h-0 md:hover:bg-card/60 md:hover:border-foreground/30 md:hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:bg-card/60 active:border-foreground/30 active:scale-95 transition-all duration-150 touch-manipulation">
          <Avatar className="h-10 w-10 md:h-8 md:w-8 ring-2 ring-border/50 md:group-hover:ring-foreground/30 transition-all">
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
                {t('nav.admin')}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={20}
        className="w-full max-w-[280px] mx-2 md:w-64 md:mx-0"
      >
        <DropdownMenuLabel className="p-4">
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
                  {t('nav.admin')}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border/50 my-2" />
        
        <DropdownMenuItem 
          onClick={() => navigate('/profile')} 
          className="cursor-pointer rounded-lg px-4 py-3 min-h-[44px] touch-manipulation"
        >
          <User className="h-5 w-5 mr-3" />
          <span className="text-base font-medium">{t('nav.profile')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate('/favorites')} 
          className="cursor-pointer rounded-lg px-4 py-3 min-h-[44px] touch-manipulation"
        >
          <Heart className="h-5 w-5 mr-3" />
          <span className="text-base font-medium">{t('nav.favorites')}</span>
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin')} 
            className="cursor-pointer rounded-lg px-4 py-3 min-h-[44px] touch-manipulation"
          >
            <Settings className="h-5 w-5 mr-3" />
            <span className="text-base font-medium">{t('admin.title')}</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-border/30 my-1" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer rounded-lg px-4 py-3 min-h-[44px] text-destructive focus:bg-destructive/10 touch-manipulation"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="text-base font-medium">{t('nav.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
