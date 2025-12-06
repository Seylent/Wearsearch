import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Heart, User as UserIcon, Lock, LogOut, Calendar, Mail } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { NeonAbstractions } from '@/components/sections/NeonAbstractions';
import { userService, FavoriteProduct } from '@/services/userService';
import { authService } from '@/services/authService';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
  created_at?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setDisplayName(userData.display_name || '');
      
      // Load favorites
      const favData = await userService.getFavorites();
      setFavorites(favData);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      if (error.message.includes('401')) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await userService.updateDisplayName(displayName);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      await loadUserData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    setUpdating(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change password",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-foreground border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden pt-20 border-b border-border/50">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-6 border-2 border-foreground/20 animate-fade-in">
            <AvatarFallback className="text-2xl font-bold bg-card">
              {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {user.display_name || 'User Profile'}
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {user.email}
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 relative">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-card/40 border border-border/50 backdrop-blur-sm mb-8 p-1 rounded-xl">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="favorites"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({favorites.length})
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h2 className="font-display text-2xl font-bold mb-6">Profile Information</h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="pl-11 h-12 bg-muted/30 border-border/50 rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm">Display Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30"
                      />
                    </div>
                  </div>

                  {user.created_at && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Member since</p>
                        <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={updating}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((fav: any) => {
                    // Handle both API formats: with nested product object or flat
                    const product = fav.product || fav;
                    const productId = fav.product_id || fav.id;
                    
                    return (
                      <ProductCard
                        key={productId}
                        id={productId}
                        name={product.name || 'Unknown Product'}
                        image={product.image_url || product.image || ''}
                        price={String(product.price || 0)}
                        category={product.type || product.category}
                        brand={product.brand}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl bg-card/20">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start adding products to your favorites
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8"
                  >
                    Browse Products
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h2 className="font-display text-2xl font-bold mb-6">Change Password</h2>
                
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updating}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
                  >
                    {updating ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full h-12 border-destructive/50 text-destructive hover:bg-destructive hover:text-foreground rounded-lg"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;
