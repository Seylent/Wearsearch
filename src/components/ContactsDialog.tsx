import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Instagram, Mail } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

interface ContactInfo {
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
}

interface ContactsDialogProps {
  contacts?: ContactInfo;
}

export const ContactsDialog: React.FC<ContactsDialogProps> = ({ contacts }) => {
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
      } catch (e) {
        console.error('Failed to load contacts');
      }
    } else if (contacts) {
      setActiveContacts(contacts);
    }
  }, [contacts]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          {t('nav.contacts')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/95 border-white/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{t('footer.contactUs')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {activeContacts.telegram && (
            <a
              href={`https://t.me/${activeContacts.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <Send className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Telegram</h3>
                <p className="text-sm text-white/70">{activeContacts.telegram}</p>
              </div>
            </a>
          )}

          {activeContacts.instagram && (
            <a
              href={`https://instagram.com/${activeContacts.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <Instagram className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Instagram</h3>
                <p className="text-sm text-white/70">{activeContacts.instagram}</p>
              </div>
            </a>
          )}

          {activeContacts.tiktok && (
            <a
              href={`https://tiktok.com/@${activeContacts.tiktok.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <FaTiktok className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">TikTok</h3>
                <p className="text-sm text-white/70">{activeContacts.tiktok}</p>
              </div>
            </a>
          )}

          {activeContacts.email && (
            <a
              href={`mailto:${activeContacts.email}`}
              className="flex items-center gap-4 p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                <Mail className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Email</h3>
                <p className="text-sm text-white/70">{activeContacts.email}</p>
              </div>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
