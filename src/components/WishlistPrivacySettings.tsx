import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Lock, Link2, Copy, Check, Share2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getWishlistSettings,
  updateWishlistSettings,
  getShareLink,
  type WishlistSettings,
} from '@/services/wishlistService';

interface WishlistPrivacySettingsProps {
  className?: string;
}

const WishlistPrivacySettings: React.FC<WishlistPrivacySettingsProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<WishlistSettings>({ is_public: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getWishlistSettings();
      setSettings(data);
      if (data.share_url) {
        const fullUrl = data.share_url.startsWith('http') 
          ? data.share_url 
          : `${globalThis.location.origin}${data.share_url}`;
        setShareUrl(fullUrl);
      }
    } catch (error) {
      console.error('Failed to load wishlist settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePrivacy = async (isPublic: boolean) => {
    setIsSaving(true);
    try {
      const updated = await updateWishlistSettings(isPublic);
      setSettings(updated);
      
      // If making public, generate share link
      if (isPublic && !shareUrl) {
        const { share_url } = await getShareLink();
        const fullUrl = share_url.startsWith('http') 
          ? share_url 
          : `${globalThis.location.origin}${share_url}`;
        setShareUrl(fullUrl);
      }
      
      toast({
        title: t('wishlist.settingsSaved'),
        description: isPublic 
          ? t('wishlist.nowPublic') 
          : t('wishlist.nowPrivate'),
      });
    } catch (error) {
      console.error('Failed to update wishlist settings:', error);
      toast({
        title: t('common.error'),
        description: t('wishlist.settingsError'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateLink = async () => {
    setIsSaving(true);
    try {
      const { share_url } = await getShareLink();
      // Build full URL from share_url path
      const fullUrl = share_url.startsWith('http') 
        ? share_url 
        : `${globalThis.location.origin}${share_url}`;
      setShareUrl(fullUrl);
      
      // Also make public if not already
      if (!settings.is_public) {
        const updated = await updateWishlistSettings(true);
        setSettings(updated);
      }
      
      toast({
        title: t('wishlist.linkGenerated'),
        description: t('wishlist.linkReady'),
      });
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast({
        title: t('common.error'),
        description: t('wishlist.linkError'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: t('wishlist.linkCopied'),
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse ${className}`}>
        <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
        <div className="h-10 w-full bg-white/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-xl bg-card/40 border border-border/50 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-400" />
          {t('wishlist.shareTitle')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('wishlist.shareDescription')}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-black/30 border border-white/10">
        <div className="flex items-start gap-2">
          {settings.is_public ? (
            <Globe className="w-4 h-4 text-green-400 mt-0.5" />
          ) : (
            <Lock className="w-4 h-4 text-yellow-400 mt-0.5" />
          )}
          <div>
            <p className="text-sm text-foreground">{t('wishlist.publicWishlist')}</p>
            <p className="text-xs text-muted-foreground">
              {settings.is_public ? t('wishlist.anyoneCanView') : t('wishlist.onlyYouCanView')}
            </p>
          </div>
        </div>
        <Switch
          checked={settings.is_public}
          onCheckedChange={handleTogglePrivacy}
          disabled={isSaving}
        />
      </div>

      {settings.is_public && (
        <div className="pt-3 border-t border-white/10">
          {shareUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {t('wishlist.shareLink')}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-black/30 border border-white/10 rounded-lg text-foreground/80 truncate"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateLink}
              disabled={isSaving}
              className="w-full"
            >
              <Link2 className="w-4 h-4 mr-2" />
              {t('wishlist.generateLink')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WishlistPrivacySettings;
