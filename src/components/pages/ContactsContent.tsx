'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mail, Video, Store, Lightbulb } from 'lucide-react';
import { NeonAbstractions } from '@/components/NeonAbstractions';
import api from '@/services/api';

interface ContactInfo {
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
}

const parseContactInfo = (value: unknown): ContactInfo | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const parsed: ContactInfo = {};
  let hasValue = false;

  (['telegram', 'instagram', 'tiktok', 'email'] as const).forEach(key => {
    const entry = record[key];
    if (typeof entry === 'string' && entry.trim() !== '') {
      parsed[key] = entry;
      hasValue = true;
    }
  });

  return hasValue ? parsed : null;
};

const mergeContacts = (
  preferred: ContactInfo | null,
  fallback: ContactInfo | null
): ContactInfo => {
  const merged: ContactInfo = { ...(fallback || {}) };
  if (!preferred) return merged;

  Object.entries(preferred).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim() !== '') {
      merged[key as keyof ContactInfo] = value;
    }
  });

  return merged;
};

const ContactsContent = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<ContactInfo>({
    telegram: '@wearsearch',
    instagram: '@wearsearch',
    tiktok: '@wearsearch',
    email: 'support@wearsearch.com',
  });

  useEffect(() => {
    const loadContacts = async () => {
      const applyLocalContacts = () => {
        const savedContacts = localStorage.getItem('site_contacts');
        if (!savedContacts) return null;
        try {
          const parsed = parseContactInfo(JSON.parse(savedContacts));
          if (parsed) {
            setContacts(prev => ({ ...prev, ...parsed }));
          }
          return parsed;
        } catch {
          return null;
        }
      };

      let localContacts: ContactInfo | null = null;
      localContacts = applyLocalContacts();

      try {
        const response = await api.get('/api/v1/contacts');
        const payload = response.data?.data ?? response.data?.item ?? response.data;
        const remoteContacts = parseContactInfo(payload);
        if (remoteContacts) {
          const merged = mergeContacts(localContacts, remoteContacts);
          setContacts(prev => ({ ...prev, ...merged }));
          localStorage.setItem('site_contacts', JSON.stringify(merged));
        }
      } catch {
        // Fallback to localStorage
      }
    };

    void loadContacts();

    // Listen for localStorage changes from admin panel
    const handleStorageChange = () => {
      const updatedContacts = localStorage.getItem('site_contacts');
      if (!updatedContacts) return;
      try {
        const parsedContacts = parseContactInfo(JSON.parse(updatedContacts));
        if (parsedContacts) {
          setContacts(prev => ({ ...prev, ...parsedContacts }));
        }
      } catch {
        // Silently fail
      }
    };

    const handleContactsUpdate = () => {
      handleStorageChange();
    };

    globalThis.addEventListener('storage', handleStorageChange);
    globalThis.addEventListener('contacts:updated', handleContactsUpdate);
    return () => {
      globalThis.removeEventListener('storage', handleStorageChange);
      globalThis.removeEventListener('contacts:updated', handleContactsUpdate);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-foreground font-sans">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden pt-28 pb-12">
          <div className="absolute inset-0 z-0 opacity-30" aria-hidden="true">
            <NeonAbstractions />
          </div>
          <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 text-center">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight">
              <span className="neon-text">{t('contacts.title', 'Contact Us')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
              {t(
                'contacts.subtitle',
                "We'd love to hear from you! Reach out via social media or email."
              )}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="relative py-16 sm:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Contact Channels */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-4">{t('contacts.reachUs', 'Reach Us')}</h2>
                  <p className="text-muted-foreground mb-8 font-serif">
                    {t(
                      'contacts.reachDescription',
                      'Choose your preferred way to connect with us. We respond to all messages within 24 hours.'
                    )}
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-4">
                  {contacts.telegram && (
                    <a
                      href={`https://t.me/${contacts.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-black/20 hover:shadow-[0_12px_30px_rgba(15,15,15,0.12)] transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center group-hover:bg-black/10 transition-all">
                        <Send className="w-7 h-7 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 text-lg">
                          {t('contacts.telegram', 'Telegram')}
                        </h3>
                        <p className="text-sm text-muted-foreground">{contacts.telegram}</p>
                      </div>
                    </a>
                  )}

                  {contacts.instagram && (
                    <a
                      href={`https://instagram.com/${contacts.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-black/20 hover:shadow-[0_12px_30px_rgba(15,15,15,0.12)] transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center group-hover:bg-black/10 transition-all">
                        <svg
                          className="w-7 h-7 text-foreground"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 text-lg">
                          {t('contacts.instagram', 'Instagram')}
                        </h3>
                        <p className="text-sm text-muted-foreground">{contacts.instagram}</p>
                      </div>
                    </a>
                  )}

                  {contacts.tiktok && (
                    <a
                      href={`https://tiktok.com/@${contacts.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-black/20 hover:shadow-[0_12px_30px_rgba(15,15,15,0.12)] transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center group-hover:bg-black/10 transition-all">
                        <Video className="w-7 h-7 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 text-lg">
                          {t('contacts.tiktok', 'TikTok')}
                        </h3>
                        <p className="text-sm text-muted-foreground">{contacts.tiktok}</p>
                      </div>
                    </a>
                  )}

                  {contacts.email && (
                    <a
                      href={`mailto:${contacts.email}`}
                      className="flex items-center gap-4 p-5 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-black/20 hover:shadow-[0_12px_30px_rgba(15,15,15,0.12)] transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center group-hover:bg-black/10 transition-all">
                        <Mail className="w-7 h-7 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 text-lg">
                          {t('contacts.email', 'Електронна пошта')}
                        </h3>
                        <p className="text-sm text-muted-foreground break-all">{contacts.email}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column - Partnership Info */}
              <div className="space-y-8">
                {/* Add Your Store */}
                <div className="p-6 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm shadow-[0_8px_24px_rgba(15,15,15,0.08)]">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-black/5 border border-black/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {t('contacts.addStore', 'Add Your Store')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t(
                          'contacts.addStoreDescription',
                          'Are you a fashion retailer? Partner with us to showcase your products to thousands of shoppers. We help you reach more customers and grow your business.'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground ml-16">
                    <p>✓ {t('contacts.benefit1', 'Free listing for your store')}</p>
                    <p>✓ {t('contacts.benefit2', 'Reach targeted fashion audience')}</p>
                    <p>✓ {t('contacts.benefit3', 'Easy product management')}</p>
                    <p>✓ {t('contacts.benefit4', 'Boost your online presence')}</p>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="p-6 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm shadow-[0_8px_24px_rgba(15,15,15,0.08)]">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-black/5 border border-black/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {t('contacts.suggestions', 'Suggestions & Feedback')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t(
                          'contacts.suggestionsDescription',
                          'Have an idea to make WearSearch better? We love hearing from our users! Share your suggestions, report bugs, or request new features.'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground ml-16">
                    <p>• {t('contacts.feedback1', 'Feature requests')}</p>
                    <p>• {t('contacts.feedback2', 'Bug reports')}</p>
                    <p>• {t('contacts.feedback3', 'UI/UX improvements')}</p>
                    <p>• {t('contacts.feedback4', 'General feedback')}</p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="p-4 rounded-lg bg-white/80 border border-black/10">
                  <p className="text-sm text-center text-muted-foreground">
                    ⏱️ {t('contacts.responseTime', 'We typically respond within 24 hours')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactsContent;
