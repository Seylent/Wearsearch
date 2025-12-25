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
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

interface Language {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const languages: Language[] = [
    { code: SUPPORTED_LANGUAGES.EN, name: 'English', flag: 'ENG' },
    { code: SUPPORTED_LANGUAGES.UK, name: 'Українська', flag: 'UKR' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-zinc-800/60 transition-colors"
          title="Change Language"
        >
          <Globe className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer flex items-center gap-3 px-3 py-2 ${
              currentLanguage.code === language.code
                ? 'bg-zinc-800/90 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span className="text-xs font-bold tracking-wider text-zinc-300">{language.flag}</span>
            <span className="text-sm font-medium">{language.name}</span>
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-xs text-zinc-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
