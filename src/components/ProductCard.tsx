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
      <div className="relative h-full flex flex-col rounded-lg overflow-hidden border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/30">
        {/* Image Container - Reduced aspect ratio */}
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900/40">
          <ImageDebugger 
            src={imgSrc} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* New Badge */}
          {isNew && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-medium uppercase tracking-wider">
              New
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton productId={String(id)} variant="ghost" size="icon" />
          </div>
        </div>

        {/* Content - Reduced padding */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand */}
            {brand && (
              <p className="text-[9px] text-zinc-500 uppercase tracking-[0.15em] mb-1">
                {brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 className="font-display font-semibold text-xs text-white line-clamp-2 mb-1.5">
              {name}
            </h3>
          </div>
          
          {/* Price */}
          <div className="mt-2">
            <p className="font-display text-sm font-bold text-white">
              from ${price ?? '0'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
