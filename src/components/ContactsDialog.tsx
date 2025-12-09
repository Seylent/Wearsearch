import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Instagram, Mail } from "lucide-react";

interface ContactInfo {
  telegram?: string;
  instagram?: string;
  email?: string;
}

interface ContactsDialogProps {
  contacts?: ContactInfo;
}

export const ContactsDialog: React.FC<ContactsDialogProps> = ({ contacts }) => {
  const [activeContacts, setActiveContacts] = useState<ContactInfo>({
    telegram: "@wearsearch",
    instagram: "@wearsearch",
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
        <button className="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:shadow-md hover:shadow-white/5">
          Contacts
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-950/95 border-zinc-800/50 backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-white">Contact Us</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {activeContacts.telegram && (
            <a
              href={`https://t.me/${activeContacts.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800/70 hover:border-zinc-700/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Send className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Telegram</h3>
                <p className="text-sm text-zinc-400">{activeContacts.telegram}</p>
              </div>
            </a>
          )}

          {activeContacts.instagram && (
            <a
              href={`https://instagram.com/${activeContacts.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800/70 hover:border-zinc-700/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Instagram className="w-6 h-6 text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Instagram</h3>
                <p className="text-sm text-zinc-400">{activeContacts.instagram}</p>
              </div>
            </a>
          )}

          {activeContacts.email && (
            <a
              href={`mailto:${activeContacts.email}`}
              className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800/70 hover:border-zinc-700/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Email</h3>
                <p className="text-sm text-zinc-400">{activeContacts.email}</p>
              </div>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
