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
  const imgSrc = image || '';

  return (
    <Link to={`/product/${id}`} className="group block h-full">
      <div className="relative h-full flex flex-col rounded-xl overflow-hidden border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/30">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900/40">
          <ImageDebugger 
            src={imgSrc} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* New Badge */}
          {isNew && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-medium uppercase tracking-wider">
              New
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton productId={String(id)} variant="ghost" size="icon" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand */}
            {brand && (
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] mb-2">
                {brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 className="font-display font-semibold text-sm text-white line-clamp-2 mb-2">
              {name}
            </h3>
          </div>
          
          {/* Price */}
          <div className="mt-3">
            <p className="font-display text-base font-bold text-white">
              from ${price ?? '0'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
