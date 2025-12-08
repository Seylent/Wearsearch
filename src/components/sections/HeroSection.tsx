import { Button } from "@/components/ui/button";
import { NeonAbstractions } from "./NeonAbstractions";
import { ArrowRight } from "lucide-react";
import heroFashion from "@/assets/hero-fashion.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <NeonAbstractions />
      
      {/* Background fashion image - subtle */}
      <div className="absolute inset-0 z-0">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[60%] h-[80%] opacity-[0.15] overflow-hidden">
          <img 
            src={heroFashion} 
            alt="Fashion editorial"
            className="w-full h-full object-cover object-center"
            style={{
              maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 100%)'
            }}
          />
        </div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground tracking-wider uppercase">
              New Collection Available
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">Discover</span>
            <span className="block neon-text">Exceptional</span>
            <span className="block text-gradient">Fashion</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Curated collections from the world's most innovative designers. 
            Where style meets artistry.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="neon-solid" size="xl" className="group">
              Explore Collections
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="neon" size="xl">
              View Stores
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: "500+", label: "Brands" },
              { value: "10K+", label: "Products" },
              { value: "50+", label: "Stores" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border border-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-foreground rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
