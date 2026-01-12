import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, languageService, type SupportedLanguage } from '@/i18n';

interface Language {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const languages: Language[] = [
    { code: SUPPORTED_LANGUAGES.EN, name: 'English', flag: 'ENG' },
    { code: SUPPORTED_LANGUAGES.UK, name: 'Українська', flag: 'UKR' }
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

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative min-w-[44px] min-h-[44px] w-11 h-11 md:w-9 md:h-9 md:min-w-0 md:min-h-0 rounded-full hover:bg-zinc-800/60 active:bg-zinc-800/70 active:scale-95 transition-all duration-150 touch-manipulation"
          title={t('aria.changeLanguage')}
        >
          <Globe className="h-5 w-5 md:h-4 md:w-4 text-zinc-400 hover:text-white transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={20}
        className="w-52 md:w-48 mx-2 md:mx-0"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg touch-manipulation ${
              currentLanguage.code === language.code
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-sm font-bold tracking-wider text-muted-foreground">{language.flag}</span>
            <span className="text-base font-medium">{language.name}</span>
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-sm text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
