'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Mail, User, Loader2 } from 'lucide-react';
import { NeonAbstractions } from '@/components/NeonAbstractions';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

export default function AuthPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    username: '',
    identifier: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleLogin = async () => {
    const response = await api.post('/auth/login', {
      identifier: formData.identifier,
      password: formData.password,
    });

    if (response.data?.success) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      toast({
        title: t('auth.loginSuccess', 'Успішний вхід'),
        description: t('auth.welcomeBack', 'Ласкаво просимо назад!'),
      });
      router.push('/');
    }
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('auth.passwordMismatch', 'Паролі не співпадають'),
        description: t('auth.passwordMismatchDesc', 'Будь ласка, переконайтеся що паролі однакові'),
      });
      throw new Error('Password mismatch');
    }

    const response = await api.post('/auth/register', {
      email: formData.email,
      password: formData.password,
      display_name: formData.display_name || undefined,
      username: formData.username || undefined,
    });

    if (response.data?.success) {
      toast({
        title: t('auth.signupSuccess', 'Реєстрація успішна'),
        description: t('auth.pleaseLogin', 'Тепер ви можете увійти'),
      });
      setIsLogin(true);
      setFormData({
        email: '',
        display_name: '',
        username: '',
        identifier: formData.email,
        password: formData.password,
        confirmPassword: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Password mismatch') {
        // Already handled in handleSignup
        return;
      }
      
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const message = apiError?.response?.data?.message || apiError?.message;
      toast({
        variant: 'destructive',
        title: isLogin ? t('auth.loginError', 'Помилка входу') : t('auth.signupError', 'Помилка реєстрації'),
        description: message || (isLogin 
          ? t('auth.invalidCredentials', 'Невірний email/нікнейм або пароль')
          : t('auth.signupFailed', 'Не вдалося зареєструватися')),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Auth Section */}
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden px-4 py-20">
        {/* NeonAbstractions background - stars and round objects ONLY */}
        <div className="absolute inset-0 z-0">
          <NeonAbstractions />
        </div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30 z-[1]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Auth Card */}
          <div className="backdrop-blur-xl bg-card/40 border border-border/50 rounded-2xl p-8 shadow-2xl">
            {/* Back button */}
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back', 'Назад')}
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isLogin ? t('auth.login', 'Вхід') : t('auth.signup', 'Реєстрація')}
              </h1>
              <p className="text-muted-foreground">
                {isLogin 
                  ? t('auth.loginSubtitle', 'Увійдіть у свій акаунт') 
                  : t('auth.signupSubtitle', 'Створіть новий акаунт')}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-sm font-medium">
                    {t('auth.displayName', 'Ім\'я для відображення')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="display_name"
                      type="text"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      placeholder={t('auth.displayNamePlaceholder', 'Ваше ім\'я')}
                      className="pl-10 bg-white/5 border-white/10 focus:border-white/20 h-12"
                      maxLength={50}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    {t('auth.username', 'Нікнейм')} <span className="text-xs text-muted-foreground">(необов'язково)</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={t('auth.usernamePlaceholder', 'Ваш нікнейм')}
                      className="pl-10 bg-white/5 border-white/10 focus:border-white/20 h-12"
                      pattern="[a-zA-Z0-9_]{3,30}"
                      title="3-30 символів, лише літери, цифри та _"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={isLogin ? "identifier" : "email"} className="text-sm font-medium">
                  {isLogin 
                    ? t('auth.emailOrUsername', 'Email або нікнейм') 
                    : t('auth.email', 'Email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id={isLogin ? "identifier" : "email"}
                    type={isLogin ? "text" : "email"}
                    value={isLogin ? formData.identifier : formData.email}
                    onChange={handleInputChange}
                    placeholder={isLogin 
                      ? t('auth.emailOrUsernamePlaceholder', 'your@email.com або username')
                      : "your@email.com"}
                    className="pl-10 bg-white/5 border-white/10 focus:border-white/20 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('auth.password', 'Пароль')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 bg-white/5 border-white/10 focus:border-white/20 h-12"
                    minLength={8}
                    required
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    {t('auth.passwordRequirement', 'Мінімум 8 символів')}
                  </p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t('auth.confirmPassword', 'Підтвердіть пароль')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10 focus:border-white/20 h-12"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('auth.forgotPassword', 'Забули пароль?')}
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-white text-black hover:bg-white/90 disabled:opacity-50"
              >
                {(() => {
                  if (isLoading) {
                    return (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isLogin ? t('auth.signingIn', 'Входимо...') : t('auth.signingUp', 'Реєструємо...')}
                      </>
                    );
                  }
                  return isLogin ? t('auth.loginButton', 'Увійти') : t('auth.signupButton', 'Зареєструватися');
                })()}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/40 px-2 text-muted-foreground">
                  {t('auth.or', 'або')}
                </span>
              </div>
            </div>

            {/* Social Auth (placeholder) */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Facebook
              </Button>
            </div>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin 
                  ? t('auth.noAccount', 'Немає акаунту?') + ' '
                  : t('auth.haveAccount', 'Вже є акаунт?') + ' '}
                <span className="font-medium text-foreground">
                  {isLogin ? t('auth.signup', 'Зареєструйтеся') : t('auth.login', 'Увійдіть')}
                </span>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t('auth.terms', 'Входячи, ви погоджуєтесь з')} {' '}
            <button className="underline hover:text-foreground transition-colors">
              {t('auth.termsLink', 'Умовами використання')}
            </button>
            {' '}{t('auth.and', 'та')}{' '}
            <button className="underline hover:text-foreground transition-colors">
              {t('auth.privacyLink', 'Політикою конфіденційності')}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
