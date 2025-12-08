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
      <div className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-border/30 bg-card/20 backdrop-blur-sm transition-all duration-500 hover:border-foreground/20 hover:bg-card/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-card/50 to-card">
          <ImageDebugger 
            src={imgSrc} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* New Badge */}
          {isNew && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-foreground/90 text-background text-xs font-medium">
              New
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton productId={String(id)} variant="ghost" size="icon" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand */}
            {brand && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 className="font-display font-semibold text-base line-clamp-2 group-hover:text-foreground/90 transition-colors">
              {name}
            </h3>
          </div>
          
          {/* Price */}
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">
              from <span className="text-foreground font-semibold">${price ?? '—'}</span>
            </p>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
