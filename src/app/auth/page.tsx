'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Mail, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

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
    await authService.login({
      identifier: formData.identifier,
      password: formData.password,
    });

    toast({
      title: t('auth.loginSuccess', 'Успішний вхід'),
      description: t('auth.welcomeBack', 'Ласкаво просимо назад!'),
    });

    // Small delay to allow state to update before navigation
    setTimeout(() => {
      router.push('/');
    }, 100);
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

    const response = await authService.register({
      email: formData.email,
      password: formData.password,
      display_name: formData.display_name || undefined,
      username: formData.username || undefined,
    });

    if (response?.success ?? response?.user ?? response?.token) {
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
        title: isLogin
          ? t('auth.loginError', 'Помилка входу')
          : t('auth.signupError', 'Помилка реєстрації'),
        description:
          message ||
          (isLogin
            ? t('auth.invalidCredentials', 'Невірний email/нікнейм або пароль')
            : t('auth.signupFailed', 'Не вдалося зареєструватися')),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground">
      <section className="relative flex items-center justify-center min-h-screen px-4 py-10 sm:py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,hsl(var(--foreground)/0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_15%_20%,hsl(var(--foreground)/0.06),transparent_55%)]" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-card/90 border border-border/70 rounded-3xl p-6 sm:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-5 sm:mb-6 -ml-2 text-muted-foreground hover:text-foreground text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back', 'Назад')}
            </Button>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent border border-border mb-4">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif mb-2 text-foreground">
                {isLogin ? t('auth.login', 'Вхід') : t('auth.signup', 'Реєстрація')}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? t('auth.loginSubtitle', 'Увійдіть у свій акаунт')
                  : t('auth.signupSubtitle', 'Створіть новий акаунт')}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-sm font-medium">
                    {t('auth.displayName', "Ім'я для відображення")}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="display_name"
                      type="text"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      placeholder={t('auth.displayNamePlaceholder', "Ваше ім'я")}
                      className="pl-10 h-11 sm:h-12 rounded-full bg-background/60 border border-border/70 focus:border-foreground/80"
                      maxLength={50}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    {t('auth.username', 'Нікнейм')}{' '}
                    <span className="text-xs text-muted-foreground">(необов&apos;язково)</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={t('auth.usernamePlaceholder', 'Ваш нікнейм')}
                      className="pl-10 h-11 sm:h-12 rounded-full bg-background/60 border border-border/70 focus:border-foreground/80"
                      pattern="[a-zA-Z0-9_]{3,30}"
                      title="3-30 символів, лише літери, цифри та _"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={isLogin ? 'identifier' : 'email'} className="text-sm font-medium">
                  {isLogin
                    ? t('auth.emailOrUsername', 'Email або нікнейм')
                    : t('auth.email', 'Email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id={isLogin ? 'identifier' : 'email'}
                    type={isLogin ? 'text' : 'email'}
                    value={isLogin ? formData.identifier : formData.email}
                    onChange={handleInputChange}
                    placeholder={
                      isLogin
                        ? t('auth.emailOrUsernamePlaceholder', 'your@email.com або username')
                        : 'your@email.com'
                    }
                    className="pl-10 h-11 sm:h-12 rounded-full bg-background/60 border border-border/70 focus:border-foreground/80"
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
                    className="pl-10 h-11 sm:h-12 rounded-full bg-background/60 border border-border/70 focus:border-foreground/80"
                    minLength={6}
                    required
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    {t('auth.passwordRequirement', 'Мінімум 6 символів')}
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
                      className="pl-10 h-11 sm:h-12 rounded-full bg-background/60 border border-border/70 focus:border-foreground/80"
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
                className="w-full h-11 sm:h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-full"
              >
                {(() => {
                  if (isLoading) {
                    return (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isLogin
                          ? t('auth.signingIn', 'Входимо...')
                          : t('auth.signingUp', 'Реєструємо...')}
                      </>
                    );
                  }
                  return isLogin
                    ? t('auth.loginButton', 'Увійти')
                    : t('auth.signupButton', 'Зареєструватися');
                })()}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-5 sm:mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <p className="mt-5 sm:mt-6 text-center text-[10px] sm:text-xs text-muted-foreground">
            {t('auth.terms', 'Входячи, ви погоджуєтесь з')}{' '}
            <button className="underline hover:text-foreground transition-colors">
              {t('auth.termsLink', 'Умовами використання')}
            </button>{' '}
            {t('auth.and', 'та')}{' '}
            <button className="underline hover:text-foreground transition-colors">
              {t('auth.privacyLink', 'Політикою конфіденційності')}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
