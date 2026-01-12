/**
 * Contact Management Component
 * Редагування контактної інформації сайту
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Globe,
  Save
} from "lucide-react";

interface ContactInfo {
  telegram?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export const ContactManagement: React.FC = () => {
  const { t } = useTranslation();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    telegram: '@wearsearch',
    instagram: '@wearsearch',
    facebook: 'wearsearch',
    twitter: '@wearsearch'
  });
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load contact info from API
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        // API call will be implemented when backend is ready
        // const response = await fetch('/api/v1/contacts');
        // const data = await response.json();
        // setContactInfo(data);
      } catch (error) {
        console.error('Error loading contact info:', error);
      }
    };

    void loadContactInfo();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call will be implemented when backend is ready
      // await fetch('/api/v1/contacts', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(contactInfo)
      // });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Соціальні мережі
        </h2>
        
        <Button 
          onClick={handleSave}
          disabled={loading}
          className={isSaved ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {(() => {
            if (loading) {
              return (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  {t('common.saving')}
                </>
              );
            }
            if (isSaved) {
              return (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.saved')}
                </>
              );
            }
            return (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('common.save')}
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
            Соціальні мережі
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="telegram" className="block text-sm font-medium mb-2">
                Telegram
              </label>
              <Input
                id="telegram"
                type="text"
                value={contactInfo.telegram || ''}
                onChange={(e) => handleChange('telegram', e.target.value)}
                placeholder="@wearsearch"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium mb-2">
                Instagram
              </label>
              <Input
                id="instagram"
                type="text"
                value={contactInfo.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="@wearsearch"
              />
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium mb-2">
                Facebook
              </label>
              <Input
                id="facebook"
                type="text"
                value={contactInfo.facebook || ''}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="wearsearch"
              />
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium mb-2">
                Twitter / X
              </label>
              <Input
                id="twitter"
                type="text"
                value={contactInfo.twitter || ''}
                onChange={(e) => handleChange('twitter', e.target.value)}
                placeholder="@wearsearch"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};