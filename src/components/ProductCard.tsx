import { Link } from "react-router-dom";
import { convertS3UrlToHttps } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  id: string | number;
  name: string;
  image: string;
  price: string | number;
  category?: string;
  brand?: string;
}

const ProductCard = ({ id, name, image, price, category, brand }: ProductCardProps) => {
  const httpsImageUrl = convertS3UrlToHttps(image);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link to={`/product/${id}`} className="group block h-full">
      <div className="relative">
        {/* Image container with auto-crop and centering */}
        <div className="mb-4 group-hover:scale-[1.02] transition-transform duration-500">
          <ProductImage
            src={httpsImageUrl || "/placeholder.svg"}
            alt={name}
            aspectRatio="portrait"
            className="shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/10 transition-shadow duration-500"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Like button */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <FavoriteButton 
              productId={String(id)} 
              variant="ghost"
              className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-foreground hover:text-background transition-all"
            />
          </div>

          {/* Quick view button */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button className="w-full py-3 bg-foreground text-background text-sm font-medium rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300">
              Quick View
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          {brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {brand}
            </p>
          )}
          <h3 className="font-medium text-sm group-hover:text-foreground/80 transition-colors line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold">${typeof price === 'number' ? price : price}</span>
            {category && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider border border-border px-2 py-0.5 rounded-full">
                {category}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};  

export default ProductCard;
