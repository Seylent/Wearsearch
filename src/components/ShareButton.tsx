/**
 * Share Button Component
 * Uses Web Share API with fallback to custom modal
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Social share icons
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ViberIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.62.6 9.593.524 12.56.34 18.2 5.92 19.73v2.6s-.04.94.58 1.14c.44.14.7-.28 1.12-.74l1.6-1.86c4.4.38 7.8-.48 8.18-.6.88-.28 5.86-.92 6.68-7.52.84-6.84-.42-11.16-2.72-13.14C19.32.4 14.34-.04 11.4 0zM6.74 5.9c.56-.02 1.12.16 1.54.54.36.32.68.68.98 1.06.54.74 1.04 1.54.78 2.54-.14.48-.42.9-.74 1.28-.32.4-.66.76-1.04 1.1-.3.26-.34.66-.14.98.88 1.44 1.94 2.7 3.18 3.8.6.52 1.22 1 1.9 1.4.34.2.74.14 1.02-.14.64-.62 1.18-1.34 1.92-1.86.5-.34 1.16-.42 1.74-.16.42.18.82.42 1.2.68.38.26.74.54 1.1.84.38.32.58.8.52 1.3-.06.5-.38.96-.74 1.34-.36.38-.8.68-1.26.9-.78.38-1.72.4-2.52.08-1.94-.76-3.7-1.94-5.24-3.3-1.08-.96-2.04-2.02-2.9-3.18-.48-.66-.92-1.36-1.28-2.1-.34-.7-.6-1.44-.76-2.2-.08-.38-.1-.78-.04-1.16.12-.8.64-1.5 1.28-1.94.34-.24.7-.42 1.08-.56.16-.06.38-.08.58-.1zm4.74 1.14c.34.02.64.34.6.68-.02.18-.1.34-.22.48-.14.16-.34.24-.54.22-.88-.04-1.72.28-2.38.84-.58.5-.94 1.2-1.06 1.96-.02.08-.02.16-.02.24 0 .38-.26.7-.62.76-.38.08-.76-.14-.84-.5-.1-.52-.1-1.06.02-1.58.24-1.04.84-1.98 1.68-2.64.9-.72 2.04-1.1 3.2-1.04.06 0 .12 0 .18.02v-.44zm.68 1.64c.3.02.56.26.58.56 0 .08 0 .16-.02.24-.06.22-.24.38-.44.44-.14.04-.28 0-.4-.06-.8-.38-1.74.04-2.08.78-.04.08-.06.18-.08.26-.04.14-.08.28-.18.4-.14.18-.38.26-.6.22-.28-.06-.5-.32-.48-.6.02-.12.04-.24.08-.36.38-1.2 1.54-2.04 2.82-2.02.26.02.52.06.78.14h.02z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Check if Web Share API is available
 * Must be checked at the time of user interaction, not at render time
 */
const canUseNativeShare = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  // Check for secure context (HTTPS required)
  const isSecure = window.isSecureContext === true || window.location.protocol === 'https:';
  
  // Check for share function
  const hasShare = typeof navigator.share === 'function';
  
  return isSecure && hasShare;
};

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title = 'Check out this product on Wearsearch!',
  description = '',
  className,
  variant = 'ghost',
  size = 'icon',
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get share data at click time, not render time
  const getShareData = () => {
    const shareUrl = url || window.location.href;
    return {
      title: title,
      text: description || title,
      url: shareUrl,
    };
  };

  /**
   * CRITICAL: Web Share API requires "transient activation"
   * This means share() MUST be called synchronously from the click handler
   * Any async operation before share() will cause iOS Safari to reject it
   */
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check at click time - not render time
    if (canUseNativeShare()) {
      const shareData = getShareData();
      
      // Call share() IMMEDIATELY and synchronously
      // Do NOT await or do any async work before this call
      navigator.share(shareData)
        .then(() => {
          // Success - user shared
        })
        .catch((err: Error) => {
          // Only show modal if it's not a user abort
          if (err.name !== 'AbortError') {
            // Share failed - show fallback modal
            setIsOpen(true);
          }
        });
    } else {
      // No native share available - show custom modal
      setIsOpen(true);
    }
  };

  const handleCopyLink = async () => {
    const shareData = getShareData();
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      toast({
        title: t('share.linkCopied', 'Link copied!'),
        description: t('share.linkCopiedDesc', 'The link has been copied to your clipboard.'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareData.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast({
        title: t('share.linkCopied', 'Link copied!'),
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate social links only when modal is open
  const getSocialLinks = () => {
    const shareData = getShareData();
    return [
      {
        name: 'Telegram',
        icon: TelegramIcon,
        url: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
        color: 'bg-[#0088cc]',
      },
      {
        name: 'WhatsApp',
        icon: WhatsAppIcon,
        url: `https://wa.me/?text=${encodeURIComponent(`${shareData.title} ${shareData.url}`)}`,
        color: 'bg-[#25D366]',
      },
      {
        name: 'Viber',
        icon: ViberIcon,
        url: `viber://forward?text=${encodeURIComponent(`${shareData.title} ${shareData.url}`)}`,
        color: 'bg-[#665CAC]',
      },
      {
        name: 'Twitter',
        icon: TwitterIcon,
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
        color: 'bg-black',
      },
      {
        name: 'Facebook',
        icon: FacebookIcon,
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
        color: 'bg-[#1877F2]',
      },
    ];
  };

  return (
    <>
      {/* Share button */}
      <Button
        variant={variant}
        size={size}
        className={cn('text-white/60 hover:text-white', className)}
        onClick={handleShare}
        aria-label={t('share.shareProduct', 'Share product')}
      >
        <Share2 className="w-4 h-4" />
        {size !== 'icon' && <span className="ml-2">{t('share.share', 'Share')}</span>}
      </Button>

      {/* Custom Modal - centered on all devices */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80" />
          
          {/* Modal content - always centered */}
          <div 
            className="relative w-full max-w-sm bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                {t('share.shareProduct', 'Share Product')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Social buttons */}
            <div className="p-4">
              <div className="flex flex-wrap gap-4 justify-center">
                {getSocialLinks().map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl transition-transform active:scale-95"
                  >
                    <div className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center text-white',
                      social.color
                    )}>
                      <social.icon />
                    </div>
                    <span className="text-xs text-white/70">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Copy link */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="text"
                  value={getShareData().url}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-white/80 outline-none truncate"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0 text-white/60 hover:text-white hover:bg-white/10"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
