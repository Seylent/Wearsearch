import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Store, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/FavoriteButton';
import ShareButton from '@/components/ShareButton';
import ImageDebugger from './ImageDebugger';
import { productService } from '@/services/productService';
import { convertS3UrlToHttps } from '@/lib/utils';

interface Store {
  id: number;
  name: string;
  price: number;
  url?: string;
  currency?: string;
}

interface QuickViewModalProps {
  productId: string | number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ProductData {
  id: number | string;
  name: string;
  brand?: string;
  category?: string;
  color?: string;
  gender?: string;
  image_url?: string;
  images?: string[];
  min_price?: number;
  stores_count?: number;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ productId, isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      setIsLoading(true);
      
      Promise.all([
        productService.getProductById(String(productId)),
        productService.getProductStores(String(productId)).catch(() => [])
      ])
        .then(([productData, storesData]) => {
          // Handle different response formats
          const prod = (productData as { data?: ProductData })?.data || productData as ProductData;
          setProduct(prod);
          setStores(Array.isArray(storesData) ? storesData.slice(0, 3) : []);
        })
        .catch((error) => {
          console.error('Failed to load quick view data:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, productId]);

  const handleViewFull = () => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const getImageUrl = () => {
    if (!product) return '';
    const url = product.image_url || product.images?.[0] || '';
    return convertS3UrlToHttps(url);
  };

  const formatPrice = (price: number, currency?: string) => {
    return `${currency || '₴'}${price}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : product ? (
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-1/2 aspect-square bg-black/50">
              <ImageDebugger
                src={getImageUrl()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Action buttons overlay */}
              <div className="absolute top-3 right-3 flex gap-2">
                <FavoriteButton productId={String(product.id)} variant="ghost" size="icon" />
                <ShareButton 
                  title={product.name}
                  url={`${window.location.origin}/product/${product.id}`}
                />
              </div>
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 p-6 flex flex-col">
              <DialogHeader className="text-left mb-4">
                {product.brand && (
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                    {product.brand}
                  </p>
                )}
                <DialogTitle className="text-xl font-semibold">
                  {product.name}
                </DialogTitle>
              </DialogHeader>

              {/* Price */}
              {product.min_price && (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">
                    {t('common.from')} ₴{product.min_price}
                  </p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.category && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                    <Tag className="w-3 h-3" />
                    {product.category}
                  </span>
                )}
                {product.color && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                    {product.color}
                  </span>
                )}
                {product.gender && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                    {product.gender}
                  </span>
                )}
              </div>

              {/* Stores preview */}
              {stores.length > 0 && (
                <div className="mb-4 flex-1">
                  <p className="text-sm text-white/60 mb-2 flex items-center gap-1">
                    <Store className="w-4 h-4" />
                    {t('quickView.availableIn', { count: product.stores_count || stores.length })}
                  </p>
                  <div className="space-y-2">
                    {stores.map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                      >
                        <span className="text-sm text-white/80">{store.name}</span>
                        <span className="text-sm font-semibold text-white">
                          {formatPrice(store.price, store.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto pt-4 space-y-2">
                <Button
                  onClick={handleViewFull}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('quickView.viewFull')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-white/60">
            {t('quickView.notFound')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
