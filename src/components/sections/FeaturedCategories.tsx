import React from 'react';

export const FeaturedCategories = ({ categories = [] }: { categories?: any[] }) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-6">Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((c: any) => (
              <div key={c.id} className="p-4 bg-card rounded-lg text-center">
                <p className="font-medium">{c.name}</p>
              </div>
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
import { CategoryCard } from "@/components/cards/CategoryCard";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import categoryFootwear from "@/assets/category-footwear.jpg";

const categories = [
  {
    image: categoryWomen,
    name: "Women",
    itemCount: 2480,
  },
  {
    image: categoryMen,
    name: "Men",
    itemCount: 1840,
  },
  {
    image: categoryAccessories,
    name: "Accessories",
    itemCount: 960,
  },
  {
    image: categoryFootwear,
    name: "Footwear",
    itemCount: 720,
  },
];

export const FeaturedCategories = () => {
  return (
    <section className="py-24 relative" id="collections">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Browse</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Categories</h2>
          </div>
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
          >
            View all categories
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <div 
              key={category.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
