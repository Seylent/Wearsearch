import React from 'react';

export const AboutSection = () => {
  return (
    <section className="py-20 bg-background/40">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold mb-4">About Wearsearch</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Wearsearch helps you discover fashion from verified stores with price comparisons and curated picks.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
import { Button } from "@/components/ui/button";
import heroFashion from "@/assets/hero-fashion.jpg";

export const AboutSection = () => {
  return (
    <section className="py-32 relative overflow-hidden" id="about">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)'
          }}
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden relative">
              <img 
                src={heroFashion}
                alt="Fashion editorial"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
            
            {/* Decorative elements */}
            <div 
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-foreground/10 hidden lg:block"
              style={{
                boxShadow: '0 0 60px rgba(255,255,255,0.05)'
              }}
            />
            <div 
              className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full border border-foreground/10 hidden lg:block"
              style={{
                boxShadow: '0 0 40px rgba(255,255,255,0.05)'
              }}
            />

            {/* Stats overlay */}
            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-lg glass-surface">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-display text-2xl font-bold">2019</p>
                  <p className="text-xs text-muted-foreground">Founded</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">15+</p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">100K+</p>
                  <p className="text-xs text-muted-foreground">Customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Our Story</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Redefining the Way You 
              <span className="block text-gradient">Discover Fashion</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                VÊTIR was born from a vision to create the ultimate destination for 
                discerning fashion enthusiasts. We believe in the power of exceptional 
                design to transform not just wardrobes, but lives.
              </p>
              <p>
                Our platform connects you with the world's most innovative designers and 
                independent boutiques, offering a curated selection of pieces that embody 
                craftsmanship, creativity, and timeless elegance.
              </p>
              <p>
                Every item on VÊTIR is carefully vetted by our team of style experts, 
                ensuring authenticity and quality that exceeds expectations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="neon-solid" size="lg">
                Learn More
              </Button>
              <Button variant="neon" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
