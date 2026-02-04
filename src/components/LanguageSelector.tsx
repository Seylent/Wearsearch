'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, languageService, type SupportedLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Language {
  code: SupportedLanguage;
  name: string;
}

interface LanguageSelectorProps {
  triggerClassName?: string;
  labelClassName?: string;
  contentClassName?: string;
  labelLayout?: 'single' | 'stacked';
  showCurrencyToggle?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  triggerClassName,
  labelClassName,
  contentClassName,
  labelLayout = 'single',
  showCurrencyToggle = false,
}) => {
  const { i18n, t } = useTranslation();
  const { currency, setCurrency } = useCurrency();

  const languages: Language[] = [
    { code: SUPPORTED_LANGUAGES.EN, name: 'English' },
    { code: SUPPORTED_LANGUAGES.UK, name: 'Українська' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: SupportedLanguage) => {
    // Change i18n language
    i18n.changeLanguage(langCode);
    languageService.setLanguage(langCode);

    // Update URL with new language (for future middleware integration)
    // const newPath = switchLanguageInPath(pathname, langCode);
    // router.push(newPath);
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'UAH' : 'USD');
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative min-h-[44px] h-11 md:h-9 rounded-full border border-earth/20 bg-background/60 text-earth shadow-[0_8px_18px_rgba(0,0,0,0.18)] px-3 md:px-2 hover:bg-sand/60 hover:border-earth/40 active:bg-sand/70 active:scale-95 transition-all duration-150 touch-manipulation',
            triggerClassName
          )}
          title={t('aria.changeLanguage')}
        >
          {labelLayout === 'stacked' ? (
            <span
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 leading-none text-center w-full translate-y-[1px]',
                labelClassName
              )}
              aria-hidden="true"
            >
              <span className="text-[12px] uppercase tracking-[0.1em] font-bold">
                {currentLanguage.code === SUPPORTED_LANGUAGES.UK ? 'UA' : 'EN'}
              </span>
              <span className="w-4 h-px bg-earth/30" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-earth/70">
                {currency}
              </span>
            </span>
          ) : (
            <span
              className={cn(
                'text-[12px] md:text-[11px] uppercase tracking-[0.18em] font-bold leading-none',
                labelClassName
              )}
              aria-hidden="true"
            >
              {currentLanguage.code === SUPPORTED_LANGUAGES.UK ? 'UA' : 'EN'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={20}
        className={cn('w-52 md:w-48 mx-2 md:mx-0 rounded-2xl', contentClassName)}
      >
        {languages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg touch-manipulation ${
              currentLanguage.code === language.code
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-base font-medium">{language.name}</span>
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-sm text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        {showCurrencyToggle && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={toggleCurrency}
              className="cursor-pointer flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg touch-manipulation text-muted-foreground hover:text-foreground"
            >
              <span className="text-base font-medium">{t('currency.currency', 'Currency')}</span>
              <span className="ml-auto text-sm text-muted-foreground">{currency}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
