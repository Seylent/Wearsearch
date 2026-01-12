/**
 * Contact Management Component
 * Редагування контактної інформації сайту
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mail, 
  Phone,
  MapPin,
  Globe,
  Save,
  Clock
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  website?: string;
  workingHours: string;
  description: string;
}

export const ContactManagement: React.FC = () => {
  const { t } = useTranslation();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+380 XX XXX XX XX',
    email: 'info@wearsearch.com',
    address: 'Україна, м. Київ',
    website: 'https://wearsearch.com',
    workingHours: 'Пн-Пт: 9:00-18:00',
    description: 'Ми працюємо щоб допомагати знаходити найкращі речі за найкращими цінами.'
  });
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load contact info from API
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/contacts');
        // const data = await response.json();
        // setContactInfo(data);
      } catch (error) {
        console.error('Error loading contact info:', error);
      }
    };

    loadContactInfo();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // await fetch('/api/admin/contacts', {
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
          <Phone className="w-6 h-6" />
          {t('admin.contactInformation')}
        </h2>
        
        <Button 
          onClick={handleSave}
          disabled={loading}
          className={isSaved ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
              {t('common.saving')}
            </>
          ) : isSaved ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t('common.saved')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t('common.save')}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t('admin.basicContactInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                {t('admin.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="+380 XX XXX XX XX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('admin.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="info@wearsearch.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                {t('admin.website')} ({t('admin.optional')})
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={contactInfo.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="pl-10"
                  placeholder="https://wearsearch.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t('admin.locationAndHours')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                {t('admin.address')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="pl-10 min-h-[80px]"
                  placeholder="Україна, м. Київ, вул. Примірна 1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="workingHours" className="block text-sm font-medium mb-2">
                {t('admin.workingHours')}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="workingHours"
                  value={contactInfo.workingHours}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  className="pl-10 min-h-[80px]"
                  placeholder="Пн-Пт: 9:00-18:00&#10;Сб: 10:00-16:00&#10;Нд: вихідний"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.companyDescription')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={contactInfo.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="min-h-[120px]"
            placeholder={t('admin.descriptionPlaceholder')}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {t('admin.descriptionHelp')}
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.preview')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">{t('admin.contactUs')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{contactInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{contactInfo.email}</span>
                </div>
                {contactInfo.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={contactInfo.website} 
                      className="text-primary hover:underline"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {contactInfo.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">{t('admin.visitUs')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="whitespace-pre-line">{contactInfo.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5" />
                  <span className="whitespace-pre-line">{contactInfo.workingHours}</span>
                </div>
              </div>
            </div>
          </div>
          
          {contactInfo.description && (
            <div>
              <h4 className="font-medium mb-2">{t('admin.aboutUs')}</h4>
              <p className="text-sm text-muted-foreground">
                {contactInfo.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};