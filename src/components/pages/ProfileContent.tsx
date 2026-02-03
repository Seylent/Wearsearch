'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { NeonAbstractions } from '@/components/NeonAbstractions';
import { User, Lock, LogOut, Sparkles, Trash2 } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { getErrorMessage } from '@/utils/errorUtils';

const Profile = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user: authUser, isLoading: authLoading } = useAuth();

  useSEO({
    title: t('profile.seoTitle', 'Profile'),
    description: t(
      'profile.seoDescription',
      'Manage your profile, security settings, and account preferences.'
    ),
    keywords: 'profile, account, settings',
    type: 'website',
  });

  const [loading, setLoading] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account fields
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, authLoading]);

  // Update form fields when user data loads
  useEffect(() => {
    if (authUser) {
      setEmail(authUser.email || '');
      setDisplayName(authUser.display_name || '');
      setUsername(authUser.username || '');
    }
  }, [authUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!authUser) throw new Error('No user logged in');

      if (displayName.length > 50) {
        throw new Error('Display name must be 50 characters or less');
      }

      if (username && username.length > 30) {
        throw new Error('Username must be 30 characters or less');
      }

      // Canonical v1: PUT /api/v1/auth/me
      try {
        await authService.updateProfile({
          display_name: displayName,
          username: username || undefined,
        });
      } catch (e: unknown) {
        if (authService.isNotFound(e)) {
          throw new Error(
            'Backend does not implement profile update endpoint yet (PUT /api/v1/auth/me).'
          );
        }
        throw e;
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update profile'),
        variant: 'destructive',
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
        throw new Error('Please enter your current password');
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords don't match");
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast({
        title: 'Success',
        description: 'Password changed successfully!',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to change password'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast({
        title: t('common.error'),
        description: t('profile.enterPasswordToConfirm'),
        variant: 'destructive',
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
      router.push('/');
    } catch (error: unknown) {
      toast({
        title: t('common.error'),
        description: getErrorMessage(error, 'Failed to delete account'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setDeletePassword('');
      setShowDeleteDialog(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden pt-28 pb-8">
        <NeonAbstractions />

        <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card-strong rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs text-foreground/80 tracking-wider uppercase font-medium">
              {t('profile.accountSettings', 'Account Settings')}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            {t('profile.myAccount')} <span className="neon-text">{t('profile.title')}</span>
          </h1>

          <p className="text-lg text-muted-foreground">{email}</p>
        </div>
      </section>

      <main className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Logout Button */}
          <div className="flex justify-end mb-6">
            <Button
              variant="pillOutline"
              onClick={handleLogout}
              size="pill"
              className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
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
                <h2 className="font-display text-xl font-semibold mb-6">
                  {t('profile.profileInfo')}
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t('auth.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="h-12 bg-card/30 border-border/30 rounded-xl text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('profile.emailCannotBeChanged')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">
                      {t('auth.displayName')}
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder={t('profile.displayNamePlaceholder')}
                      maxLength={50}
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                    <p className="text-xs text-muted-foreground">{t('profile.displayNameHint')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      {t('auth.username')}
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder={t('profile.usernamePlaceholder')}
                      maxLength={30}
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                    <p className="text-xs text-muted-foreground">{t('profile.usernameHint')}</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="pill"
                    size="pill"
                    className="w-full sm:w-auto"
                  >
                    {loading ? t('profile.saving') : t('profile.saveChanges')}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="p-8 rounded-2xl glass-card">
                <h2 className="font-display text-xl font-semibold mb-6">
                  {t('profile.changePassword')}
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      {t('profile.currentPassword')}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder={t('auth.enterPassword')}
                      required
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      {t('profile.newPassword')}
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder={t('auth.enterPassword')}
                      required
                      minLength={6}
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      {t('profile.confirmNewPassword')}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.confirmPassword')}
                      required
                      minLength={6}
                      className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="pill"
                    size="pill"
                    className="w-full sm:w-auto"
                  >
                    {loading ? t('profile.changing') : t('profile.changePasswordBtn')}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="danger">
              <div className="p-8 rounded-2xl glass-card border border-destructive/20">
                <h2 className="font-display text-xl font-semibold mb-2 text-destructive">
                  {t('profile.deleteAccount')}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">{t('profile.deleteWarning')}</p>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="pill"
                      className="h-12 px-8 rounded-full w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('profile.deleteMyAccount')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-destructive/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">
                        {t('profile.deleteConfirmTitle')}
                      </AlertDialogTitle>
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
                        onChange={e => setDeletePassword(e.target.value)}
                        placeholder={t('auth.password')}
                        className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-destructive/30"
                      />
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">
                        {t('common.cancel')}
                      </AlertDialogCancel>
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
    </div>
  );
};

export default Profile;
