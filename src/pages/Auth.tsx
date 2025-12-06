import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { NeonAbstractions } from '@/components/sections/NeonAbstractions';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

const Auth: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // NEW: Username field
  const [identifier, setIdentifier] = useState(''); // NEW: Email or Username for login
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.login({
        identifier: identifier, // Send identifier (email or username)
        password: password,
      });
        
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.register({
        email: email,
        username: username, // Include username if provided
        password: password,
        display_name: displayName,
      });

      toast({
        title: "Success",
        description: "Registration successful! Please log in.",
      });

      setIsSignup(false);
      setPassword('');
      setEmail('');
      setUsername('');
      setIdentifier('');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Could not create account. Email or username may already exist.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center overflow-hidden relative">
      <NeonAbstractions />
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-6">
              {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span className="text-xs text-muted-foreground tracking-wider uppercase">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              {isSignup ? (
                <>
                  <span className="block">Join</span>
                  <span className="block text-gradient">WEARSEARCH</span>
                </>
              ) : (
                <>
                  <span className="block">Sign In</span>
                  <span className="block neon-text">to Continue</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground">
              {isSignup 
                ? 'Create your account to start exploring' 
                : 'Enter your credentials to access your account'}
            </p>
          </div>

          {/* Form Card */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-2xl blur opacity-50"></div>
            <div className="relative p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl">
              <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
                {isSignup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-medium">
                        Display Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="displayName"
                          type="text"
                          placeholder="Your Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          required={isSignup}
                          className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium">
                        Username <span className="text-muted-foreground text-xs">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="cooluser123"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        3-20 characters, letters, numbers, and underscores only
                      </p>
                    </div>
                  </>
                )}

                {!isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-sm font-medium">
                      Email or Username
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="you@example.com or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 h-12 bg-card/50 border-border/50 rounded-lg focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      {isSignup ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    <>
                      {isSignup ? (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Create Account
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5 mr-2" />
                          Sign In
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}
                  {' '}
                  <button
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setPassword('');
                    }}
                    className="text-foreground font-medium hover:underline transition-colors"
                  >
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>

              {/* Back to Home */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
