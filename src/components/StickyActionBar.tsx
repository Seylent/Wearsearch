import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Save, X } from 'lucide-react';

interface StickyActionBarProps {
  show: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
}

export const StickyActionBar = ({
  show,
  onSave,
  onCancel,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  isSaving = false,
}: StickyActionBarProps) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-3 animate-in slide-in-from-bottom-4">
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-card/95 backdrop-blur-sm border-border/50 hover:bg-card"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      
      {onCancel && (
        <Button
          onClick={onCancel}
          variant="outline"
          className="shadow-lg bg-card/95 backdrop-blur-sm border-border/50 hover:bg-card"
        >
          <X className="h-4 w-4 mr-2" />
          {cancelLabel}
        </Button>
      )}
      
      {onSave && (
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="shadow-lg bg-foreground text-background hover:bg-foreground/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : saveLabel}
        </Button>
      )}
    </div>
  );
};
