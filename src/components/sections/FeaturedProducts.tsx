import React from 'react';
import ProductCard from '@/components/ProductCard';

export const FeaturedProducts = ({ products = [] }: { products?: any[] }) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <a href="/" className="text-sm text-muted-foreground">See all</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {products && products.length > 0 ? (
            products.map((p: any) => (
              <ProductCard key={p.id} id={p.id} name={p.name} image={p.image || p.image_url} price={p.price} category={p.category || p.type} />
            ))
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-56 bg-muted animate-pulse rounded-lg" />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
import { ProductCard } from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/button";
import productBlazer from "@/assets/product-blazer.jpg";
import productDress from "@/assets/product-dress.jpg";
import productBag from "@/assets/product-bag.jpg";
import productCoat from "@/assets/product-coat.jpg";
import productSweater from "@/assets/product-sweater.jpg";
import productTrousers from "@/assets/product-trousers.jpg";
import productJacket from "@/assets/product-jacket.jpg";
import productShirt from "@/assets/product-shirt.jpg";

const products = [
  {
    image: productBlazer,
    name: "Oversized Cotton Blazer",
    brand: "MAISON NOIR",
    price: 420,
    isNew: true,
  },
  {
    image: productDress,
    name: "Silk Evening Dress",
    brand: "ATLAS STUDIO",
    price: 680,
    originalPrice: 850,
  },
  {
    image: productBag,
    name: "Leather Crossbody Bag",
    brand: "VANGUARD",
    price: 340,
    isNew: true,
  },
  {
    image: productCoat,
    name: "Tailored Wool Coat",
    brand: "ECLIPSE",
    price: 890,
  },
  {
    image: productSweater,
    name: "Cashmere Turtleneck",
    brand: "LUNA COLLECTIVE",
    price: 290,
  },
  {
    image: productTrousers,
    name: "Wide Leg Trousers",
    brand: "NOIR ATELIER",
    price: 320,
    originalPrice: 420,
  },
  {
    image: productJacket,
    name: "Structured Leather Jacket",
    brand: "VANGUARD",
    price: 1200,
    isNew: true,
  },
  {
    image: productShirt,
    name: "Minimalist White Shirt",
    brand: "ATLAS STUDIO",
    price: 180,
  },
];

export const FeaturedProducts = () => {
  return (
    <section className="py-24 relative" id="new">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Just In</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">New Arrivals</h2>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">All</Button>
            <Button variant="ghost" size="sm">Women</Button>
            <Button variant="ghost" size="sm">Men</Button>
            <Button variant="ghost" size="sm">Accessories</Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product, index) => (
            <div 
              key={`${product.name}-${index}`} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-16">
          <Button variant="neon" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};
