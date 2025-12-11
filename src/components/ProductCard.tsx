import React from 'react';
import { Link } from 'react-router-dom';
import ImageDebugger from './ImageDebugger';
import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
  id: number | string;
  name: string;
  image?: string;
  price?: string | number;
  category?: string;
  brand?: string;
  isNew?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, image, price, category, brand, isNew }) => {
  // Handle both 'image' and 'image_url' from different API responses
  const imgSrc = image || '';

  return (
    <Link to={`/product/${id}`} className="group block h-full">
      <div className="relative h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-white/5 backdrop-blur-[25px] transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
        {/* Image Container - Reduced aspect ratio with subtle pattern background */}
        <div className="relative aspect-[4/5] overflow-hidden" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)'
        }}>
          <ImageDebugger 
            src={imgSrc} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0" 
            style={{
              filter: 'grayscale(100%) contrast(1.2) brightness(1.1) drop-shadow(0 0 15px rgba(255,255,255,0.3))',
            }}
          />
          
          {/* Pure white glow on hover - focused on clothing */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* New Badge - Glassmorphism */}
          {isNew && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-medium uppercase tracking-wider shadow-[0_0_10px_rgba(255,255,255,0.3)] select-none">
              New
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
            <FavoriteButton productId={String(id)} variant="ghost" size="icon" />
          </div>
        </div>

        {/* Content - Reduced padding */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand */}
            {brand && (
              <p className="text-[9px] text-white/50 uppercase tracking-[0.15em] mb-1 select-none">
                {brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 className="font-display font-semibold text-xs text-white line-clamp-2 mb-1.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] select-none">
              {name}
            </h3>
          </div>
          
          {/* Price */}
          <div className="mt-2">
            <p className="font-display text-sm font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] select-none">
              from ₴{price ?? '0'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
