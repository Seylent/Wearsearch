/**
 * Contact Management Component
 * Редагування контактної інформації сайту
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Save, Send, Instagram, Video, Mail, Facebook, Twitter } from 'lucide-react';

interface ContactInfo {
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
  facebook?: string;
  twitter?: string;
}

export const ContactManagement: React.FC = () => {
  const { t } = useTranslation();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    telegram: '@wearsearch',
    instagram: '@wearsearch',
    tiktok: '@wearsearch',
    email: 'support@wearsearch.com',
  });
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load contact info from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('site_contacts');
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        setContactInfo(parsedContacts);
      } catch (error) {
        console.error('Error loading contact info:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage for immediate use
      localStorage.setItem('site_contacts', JSON.stringify(contactInfo));

      try {
        await api.put('/contacts', contactInfo, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.warn('Failed to persist contacts to backend:', error);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6" />
          {t('contacts.title', 'Контактна інформація')}
        </h2>

        <Button
          onClick={handleSave}
          disabled={loading}
          className={isSaved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {(() => {
            if (loading) {
              return (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  {t('common.saving', 'Збереження...')}
                </>
              );
            }
            if (isSaved) {
              return (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.saved', 'Збережено')}
                </>
              );
            }
            return (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('common.save', 'Зберегти')}
              </>
            );
          })()}
        </Button>
      </div>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('contacts.title', 'Соціальні мережі та контакти')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="telegram"
                className="block text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('contacts.telegram', 'Telegram')}
              </label>
              <Input
                id="telegram"
                type="text"
                value={contactInfo.telegram || ''}
                onChange={e => handleChange('telegram', e.target.value)}
                placeholder="@wearsearch"
              />
            </div>

            <div>
              <label
                htmlFor="instagram"
                className="block text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                {t('contacts.instagram', 'Instagram')}
              </label>
              <Input
                id="instagram"
                type="text"
                value={contactInfo.instagram || ''}
                onChange={e => handleChange('instagram', e.target.value)}
                placeholder="@wearsearch"
              />
            </div>

            <div>
              <label
                htmlFor="tiktok"
                className="block text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                {t('contacts.tiktok', 'TikTok')}
              </label>
              <Input
                id="tiktok"
                type="text"
                value={contactInfo.tiktok || ''}
                onChange={e => handleChange('tiktok', e.target.value)}
                placeholder="@wearsearch"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {t('contacts.email', 'Електронна пошта')}
              </label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="support@wearsearch.com"
              />
            </div>

            <div>
              <label
                htmlFor="facebook"
                className="block text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Facebook className="w-4 h-4" />
                {t('contacts.facebook', 'Facebook')}
              </label>
              <Input
                id="facebook"
                type="text"
                value={contactInfo.facebook || ''}
                onChange={e => handleChange('facebook', e.target.value)}
                placeholder="wearsearch"
              />
            </div>

            <div>
              <label
                htmlFor="twitter"
                className="block text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                {t('contacts.twitter', 'Twitter / X')}
              </label>
              <Input
                id="twitter"
                type="text"
                value={contactInfo.twitter || ''}
                onChange={e => handleChange('twitter', e.target.value)}
                placeholder="@wearsearch"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Підказка:</strong> Ці контакти будуть відображатися на сторінці
              &quot;Контакти&quot; для користувачів. Переконайтеся, що всі посилання працюють
              правильно.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
