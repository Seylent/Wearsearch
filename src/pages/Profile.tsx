import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { User, Lock, LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    if (!authService.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setEmail(userData.email || "");
      setDisplayName(userData.display_name || "");
    } catch (error) {
      console.error("Error loading user:", error);
      navigate("/auth");
    }
  };

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Account Settings</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">My Account</h1>
                <p className="text-muted-foreground">{email}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="rounded-full border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/40 border border-border/30 p-1 rounded-xl mb-8">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="password"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <Lock className="w-4 h-4 mr-2" />
                Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="p-8 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm">
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
                    className="h-12 px-8 rounded-full"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="p-8 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm">
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
                    className="h-12 px-8 rounded-full"
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
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
