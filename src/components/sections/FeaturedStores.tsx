import React from 'react';
import StoreCard from '@/components/cards/StoreCard';
import { Button } from '@/components/ui/button';

const sampleStores = [
  { name: 'MAISON NOIR', location: 'Paris, France' },
  { name: 'ATLAS STUDIO', location: 'Tokyo, Japan' },
  { name: 'VANGUARD', location: 'Milan, Italy' },
  { name: 'ECLIPSE', location: 'New York, USA' },
];

export const FeaturedStores: React.FC<{ stores?: any[] }> = ({ stores = sampleStores }) => {
  return (
    <section className="py-24 relative" id="stores">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Discover</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Featured Stores</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Explore curated boutiques and flagship stores from around the world</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store: any, index: number) => (
            <div key={store.name || index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.06}s` }}>
              <StoreCard store={store} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="default" size="lg">Explore All Stores</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedStores;
