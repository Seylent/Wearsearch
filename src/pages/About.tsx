import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Shield, Globe, Heart } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useProducts } from "@/hooks/useApi";
import { useState, useEffect } from "react";
import { NeonAbstractions } from "@/components/NeonAbstractions";

const About = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: productsData } = useProducts();
  
  // Get first 4 products with images for floating display
  const floatingProducts = (Array.isArray(productsData) ? productsData : productsData?.products || [])
    .filter((p: any) => p.image_url || p.image)
    .slice(0, 4);
  
  useEffect(() => {
    if (floatingProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % floatingProducts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [floatingProducts.length]);

  const values = [
    {
      icon: Sparkles,
      title: "Curated Excellence",
      description: "Every piece in our collection is hand-selected by our team of fashion experts, ensuring only the finest quality reaches you."
    },
    {
      icon: Shield,
      title: "Recommended Stores",
      description: "We partner exclusively with verified stores and brands, recommending the best places to shop."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting fashion enthusiasts worldwide with the best stores and designers from around the globe."
    },
    {
      icon: Heart,
      title: "Passion for Fashion",
      description: "Our love for exceptional design drives everything we do, from curation to customer experience."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Floating Product Images */}
        {floatingProducts.length > 0 && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {floatingProducts.map((product: any, index: number) => (
              <div
                key={product.id}
                className={`absolute transition-all duration-1000 ${
                  index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  top: index % 2 === 0 ? '25%' : '45%',
                  [index % 2 === 0 ? 'left' : 'right']: index % 3 === 0 ? '8%' : index % 3 === 1 ? '45%' : '12%',
                  transform: `translateY(-50%) rotate(${index % 2 === 0 ? '-8deg' : '8deg'})`,
                }}
              >
                <div className="relative w-[320px] h-[400px] overflow-hidden rounded-2xl">
                  <img
                    src={product.image_url || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(1.3) contrast(1.2) saturate(0) drop-shadow(0 0 8px rgba(255,255,255,0.8))',
                      mixBlendMode: 'screen',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* NeonAbstractions background - stars and round objects */}
        <div className="absolute inset-0 z-[5]">
          <NeonAbstractions />
        </div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30 z-[1]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8 select-none">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Our Story</span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight select-none">
              <span className="block">About</span>
              <span className="block text-gradient">Wearsearch</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 select-none">
              Wearsearch is your gateway to exceptional fashion. We curate the finest pieces from 
              world-renowned designers and connect you with verified stores that share our 
              passion for quality and authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 border-y border-border/20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6 select-none">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed select-none">
              We believe that finding exceptional fashion should be effortless. Our platform 
              brings together the world's most innovative designers and trusted stores, 
              making it easy for you to discover, compare, and purchase pieces that 
              speak to your unique style. We don't sell clothing directly — we help you 
              find what you need faster, easier, and more efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 select-none">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto select-none">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="p-8 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-all duration-300 group select-none"
              >
                <div className="w-12 h-12 rounded-xl border border-border/50 bg-card/50 flex items-center justify-center mb-5 group-hover:border-foreground/30 transition-colors">
                  <value.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6 select-none">
            Ready to Explore?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 select-none">
            Discover our curated collection of exceptional fashion pieces.
          </p>
          <Button 
            size="lg" 
            className="px-8 h-14 text-base rounded-full"
            onClick={() => navigate("/products")}
          >
            Browse Collections
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
