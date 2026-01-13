'use client';

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send, Instagram, Mail, Video } from "lucide-react";

interface ContactInfo {
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
}

interface ContactsDialogProps {
  contacts?: ContactInfo;
  asFooterLink?: boolean;
}

export const ContactsDialog: React.FC<ContactsDialogProps> = ({ contacts, asFooterLink = false }) => {
  const { t } = useTranslation();
  const [activeContacts, setActiveContacts] = useState<ContactInfo>({
    telegram: "@wearsearch",
    instagram: "@wearsearch",
    tiktok: "@wearsearch",
    email: "support@wearsearch.com"
  });

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem('site_contacts');
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        setActiveContacts(parsedContacts);
      } catch {
        // Silently fail
      }
    } else if (contacts) {
      setActiveContacts(contacts);
    }
  }, [contacts]);

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        {asFooterLink ? (
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors select-none text-left">
            {t('footer.contact')}
          </button>
        ) : (
          <button
            data-contacts-trigger
            className="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            {t('nav.contacts')}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md bg-black/95 border-white/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-display text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{t('footer.contactUs')}</DialogTitle>
          <DialogDescription className="text-white/60">
            {t('footer.contactDescription', 'Зв\'яжіться з нами будь-яким зручним способом')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          {activeContacts.telegram && (
            <a
              href={`https://t.me/${activeContacts.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-0.5 sm:mb-1 text-sm sm:text-base drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{t('contacts.telegram')}</h3>
                <p className="text-xs sm:text-sm text-white/70 truncate">{activeContacts.telegram}</p>
              </div>
            </a>
          )}

          {activeContacts.instagram && (
            <a
              href={`https://instagram.com/${activeContacts.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-0.5 sm:mb-1 text-sm sm:text-base drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{t('contacts.instagram')}</h3>
                <p className="text-xs sm:text-sm text-white/70 truncate">{activeContacts.instagram}</p>
              </div>
            </a>
          )}

          {activeContacts.tiktok && (
            <a
              href={`https://tiktok.com/@${activeContacts.tiktok.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-0.5 sm:mb-1 text-sm sm:text-base drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{t('contacts.tiktok')}</h3>
                <p className="text-xs sm:text-sm text-white/70 truncate">{activeContacts.tiktok}</p>
              </div>
            </a>
          )}

          {activeContacts.email && (
            <a
              href={`mailto:${activeContacts.email}`}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-0.5 sm:mb-1 text-sm sm:text-base drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{t('contacts.email')}</h3>
                <p className="text-xs sm:text-sm text-white/70 truncate">{activeContacts.email}</p>
              </div>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
