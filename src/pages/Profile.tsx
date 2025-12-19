import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { User, Lock, LogOut, Sparkles, Star, Trash2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Delete account fields
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Track mounted state and abort controller
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const checkUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const userData = await authService.getCurrentUser();
      if (isMounted.current) {
        setUser(userData);
        setEmail(userData.email || "");
        setDisplayName(userData.display_name || "");
      }
    } catch (error: any) {
      // Don't show error if request was aborted
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }
      console.error("Error loading user:", error);
      if (isMounted.current) {
        navigate("/auth");
      }
    }
  }, [navigate]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("No user logged in");

      if (displayName.length > 50) {
        throw new Error("Display name must be 50 characters or less");
      }

      await authService.updateProfile({ display_name: displayName });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentPassword) {
        throw new Error("Please enter your current password");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords don't match");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast({
        title: "Success",
        description: "Password changed successfully!",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast({
        title: t('common.error'),
        description: t('profile.enterPasswordToConfirm'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await userService.deleteAccount(deletePassword);
      
      toast({
        title: t('profile.accountDeleted'),
        description: result.message || t('profile.accountDeletedDesc'),
      });

      // Logout and redirect to home
      await authService.logout();
      navigate("/");
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeletePassword("");
      setShowDeleteDialog(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden pt-28 pb-8">
        <NeonAbstractions />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card-strong rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs text-foreground/80 tracking-wider uppercase font-medium">
              Account Settings
            </span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            {t('profile.myAccount')} <span className="neon-text">{t('profile.title')}</span>
          </h1>
          
          <p className="text-lg text-muted-foreground">
            {email}
          </p>
        </div>
      </section>
      
      <main className="container mx-auto px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Logout Button */}
          <div className="flex justify-end mb-6">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="rounded-full border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-xl mb-8">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <User className="w-4 h-4 mr-2" />
                {t('profile.profileInfo')}
              </TabsTrigger>
              <TabsTrigger 
                value="password"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <Lock className="w-4 h-4 mr-2" />
                {t('profile.changePassword')}
              </TabsTrigger>
              <TabsTrigger 
                value="danger"
                className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('profile.dangerZone')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="p-8 rounded-2xl glass-card">
                <h2 className="font-display text-xl font-semibold mb-6">Profile Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="h-12 bg-card/30 border-border/30 rounded-xl text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your nickname"
                      maxLength={50}
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be displayed on your profile
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-12 px-8 rounded-full bg-white text-black hover:bg-zinc-100"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="p-8 rounded-2xl glass-card">
                <h2 className="font-display text-xl font-semibold mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-12 px-8 rounded-full bg-white text-black hover:bg-zinc-100"
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="danger">
              <div className="p-8 rounded-2xl glass-card border border-destructive/20">
                <h2 className="font-display text-xl font-semibold mb-2 text-destructive">{t('profile.deleteAccount')}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('profile.deleteWarning')}
                </p>
                
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      className="h-12 px-8 rounded-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('profile.deleteMyAccount')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-destructive/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">{t('profile.deleteConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        {t('profile.deleteConfirmDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-2 my-4">
                      <Label htmlFor="deletePassword" className="text-sm font-medium">
                        {t('profile.enterPasswordToConfirm')}
                      </Label>
                      <Input
                        id="deletePassword"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder={t('auth.password')}
                        className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-destructive/30"
                      />
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={loading || !deletePassword.trim()}
                        className="rounded-full bg-destructive hover:bg-destructive/90"
                      >
                        {loading ? t('profile.deleting') : t('profile.deleteAccount')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
