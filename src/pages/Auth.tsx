import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { getErrorMessage } from '@/utils/errorUtils';

const Auth: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useSEO({
    title: isSignUp ? t('auth.seoTitleSignup', 'Sign Up') : t('auth.seoTitleLogin', 'Log In'),
    description: t('auth.seoDescription', 'Log in or create an account to save favorites and manage your profile.'),
    keywords: 'login, signup, account, authentication',
    type: 'website',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login({ identifier, password });
      
      // Check if login was successful by verifying token is stored
      if (authService.isAuthenticated()) {
        toast({
          title: t('common.success', 'Success'),
          description: t('auth.loginSuccess', 'Logged in successfully!'),
        });
        
        // Trigger auth change events
        window.dispatchEvent(new Event('authChange'));
        window.dispatchEvent(new Event('auth:login'));
        
        navigate('/');
      } else {
        console.error('❌ Login failed - no token stored');
        throw new Error('Login failed - no authentication token received');
      }
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Login error:', err);
      }
      toast({
        title: t('errors.loginFailed', 'Login Failed'),
        description: getErrorMessage(err, t('errors.invalidCredentials', 'Invalid credentials')),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.register({ 
        email: identifier, 
        password, 
        username: username.trim() || undefined 
      });
      if (res.success && res.user) {
        toast({
          title: t('auth.accountCreated', 'Account created'),
          description: t('auth.registrationSuccess', 'Registration successful! You can now log in.'),
        });
        setIsSignUp(false);
        setIdentifier('');
        setPassword('');
        setUsername('');
      } else {
        throw new Error(res.error || 'Registration failed');
      }
    } catch (err: unknown) {
      toast({
        title: t('errors.registrationFailed', 'Registration Failed'),
        description: getErrorMessage(err, t('errors.failedToCreateAccount', 'Failed to create account')),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
      </div>
      
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/3 rounded-full" />
      </div>

      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{t('common.back', 'Back')}</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img
              src="/favicon.png"
              alt="Wearsearch logo"
              className="w-12 h-12 rounded-xl border border-foreground/30 bg-card/30 backdrop-blur-sm object-contain"
            />
            <span
              className="text-white text-base sm:text-lg md:text-xl uppercase tracking-wide font-logo"
            >
              Wearsearch
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">
            {isSignUp ? t('auth.createAccount', 'Create Account') : t('auth.welcomeBack', 'Welcome Back')}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? t('auth.subtitleSignUp', 'Join the world of exceptional fashion') : t('auth.subtitleSignIn', 'Sign in to continue your journey')}
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl transition-all duration-500 ease-in-out">
          <div className="-mt-2 mb-4 overflow-hidden">
            <div className={`transition-all duration-700 ease-in-out transform ${isSignUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 h-0'}`}>
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">{t('auth.statusCreatingAccount', 'Creating new account')}</span>
                </div>
              </div>
            </div>
            <div className={`transition-all duration-700 ease-in-out transform ${!isSignUp ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 h-0'}`}>
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-400 font-medium">{t('auth.statusSigningIn', 'Signing into account')}</span>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={isSignUp ? handleSignup : handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                {isSignUp ? t('auth.email', 'Email') : t('auth.emailOrUsernameLabel', 'Email or Username')}
              </Label>
              <Input
                id="identifier"
                type={isSignUp ? "email" : "text"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder={isSignUp ? t('placeholders.yourEmail', 'your@email.com') : t('placeholders.emailOrUsername', 'Email or username')}
                className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30 transition-all duration-300"
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-500">
                <Label htmlFor="username" className="text-sm font-medium">{t('profile.username', 'Username')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isSignUp}
                  placeholder={t('placeholders.enterNickname', 'Enter your nickname')}
                  className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30 transition-all duration-300"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t('profile.password', 'Password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('placeholders.enterPassword', 'Enter your password')}
                minLength={6}
                className="h-12 bg-card/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/30"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 rounded-full text-base font-medium"
            >
              {loading ? t('common.loading', 'Please wait...') : (isSignUp ? t('auth.signUp', 'Sign Up') : t('auth.signIn', 'Sign In'))}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIdentifier('');
                  setPassword('');
                  setUsername('');
                }}
                className="text-foreground hover:underline font-medium transition-all duration-300 hover:text-white"
              >
                {isSignUp ? t('auth.signIn', 'Sign In') : t('auth.signUp', 'Sign Up')}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          {t('auth.byContingTerms')}
        </p>
      </div>
    </div>
  );
};

export default Auth;

