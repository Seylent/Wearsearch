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
import { Globe, Save, Send, Instagram, Video, Mail } from 'lucide-react';

interface ContactInfo {
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
}

const requiredFields: Array<keyof ContactInfo> = ['telegram', 'instagram', 'tiktok', 'email'];

const getValidationErrors = (value: ContactInfo) => {
  const errors: Partial<Record<keyof ContactInfo, string>> = {};
  requiredFields.forEach(field => {
    const entry = value[field];
    if (!entry || entry.trim() === '') {
      errors[field] = 'required';
    }
  });
  return errors;
};

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
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInfo, boolean>>>({});
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const validationErrors = getValidationErrors(contactInfo);
  const isValid = Object.keys(validationErrors).length === 0;

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
    setHasTriedSave(true);
    if (!isValid) return;
    setSaveError(null);
    setLoading(true);
    try {
      // Save to localStorage for immediate use
      localStorage.setItem('site_contacts', JSON.stringify(contactInfo));
      window.dispatchEvent(new Event('contacts:updated'));

      try {
        await api.put('/api/v1/contacts', contactInfo, {
          headers: { 'Content-Type': 'application/json' },
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (error) {
        console.warn('Failed to persist contacts to backend:', error);
        setSaveError(
          t('admin.contactsSaveFailed', 'Failed to save on server. Contacts were saved locally.')
        );
      }
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
    setTouched(prev => ({ ...prev, [field]: true }));
    setIsSaved(false);
    setSaveError(null);
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
          disabled={loading || !isValid}
          variant="pill"
          size="pill"
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
      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

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
                onBlur={() => setTouched(prev => ({ ...prev, telegram: true }))}
                variant={
                  (touched.telegram || hasTriedSave) && validationErrors.telegram
                    ? 'error'
                    : 'default'
                }
                aria-invalid={(touched.telegram || hasTriedSave) && !!validationErrors.telegram}
                placeholder="@wearsearch"
              />
              {(touched.telegram || hasTriedSave) && validationErrors.telegram && (
                <p className="mt-2 text-xs text-destructive">
                  {t('common.fieldRequired', 'This field is required')}
                </p>
              )}
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
                onBlur={() => setTouched(prev => ({ ...prev, instagram: true }))}
                variant={
                  (touched.instagram || hasTriedSave) && validationErrors.instagram
                    ? 'error'
                    : 'default'
                }
                aria-invalid={(touched.instagram || hasTriedSave) && !!validationErrors.instagram}
                placeholder="@wearsearch"
              />
              {(touched.instagram || hasTriedSave) && validationErrors.instagram && (
                <p className="mt-2 text-xs text-destructive">
                  {t('common.fieldRequired', 'This field is required')}
                </p>
              )}
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
                onBlur={() => setTouched(prev => ({ ...prev, tiktok: true }))}
                variant={
                  (touched.tiktok || hasTriedSave) && validationErrors.tiktok ? 'error' : 'default'
                }
                aria-invalid={(touched.tiktok || hasTriedSave) && !!validationErrors.tiktok}
                placeholder="@wearsearch"
              />
              {(touched.tiktok || hasTriedSave) && validationErrors.tiktok && (
                <p className="mt-2 text-xs text-destructive">
                  {t('common.fieldRequired', 'This field is required')}
                </p>
              )}
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
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                variant={
                  (touched.email || hasTriedSave) && validationErrors.email ? 'error' : 'default'
                }
                aria-invalid={(touched.email || hasTriedSave) && !!validationErrors.email}
                placeholder="support@wearsearch.com"
              />
              {(touched.email || hasTriedSave) && validationErrors.email && (
                <p className="mt-2 text-xs text-destructive">
                  {t('common.fieldRequired', 'This field is required')}
                </p>
              )}
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
