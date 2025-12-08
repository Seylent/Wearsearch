import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Globe, Clock, ArrowRight } from "lucide-react";
import { productService, Product } from "@/services/productService";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Women", "Men", "Accessories"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts(undefined, { limit: 8 });
      if (response?.products) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "Curated Selection",
      description: "Hand-picked pieces from world-renowned designers.",
    },
    {
      icon: Shield,
      title: "Authenticity Guaranteed",
      description: "Every item verified by our expert team.",
    },
    {
      icon: Globe,
      title: "Global Shipping",
      description: "Express delivery to 50+ countries worldwide.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Personal styling assistance anytime.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background - pure black */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        
        {/* Decorative Dark Spheres - scattered around */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large sphere - top left */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-zinc-800/80 to-zinc-900/90" />
          
          {/* Medium sphere - left center */}
          <div className="absolute top-1/3 left-[5%] w-32 h-32 rounded-full bg-gradient-to-br from-zinc-800/70 to-zinc-900/80" />
          
          {/* Small sphere - left bottom */}
          <div className="absolute bottom-[20%] left-[15%] w-20 h-20 rounded-full bg-gradient-to-br from-zinc-700/60 to-zinc-800/70" />
          
          {/* Large sphere - bottom center-left */}
          <div className="absolute -bottom-32 left-[20%] w-72 h-72 rounded-full bg-gradient-to-br from-zinc-800/70 to-zinc-900/80" />
          
          {/* Medium sphere - right side */}
          <div className="absolute top-[60%] right-[25%] w-24 h-24 rounded-full bg-gradient-to-br from-zinc-800/60 to-zinc-900/70" />
          
          {/* Small sphere - top right area */}
          <div className="absolute top-[25%] right-[30%] w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700/50 to-zinc-800/60" />
        </div>

        {/* Curved decorative lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice">
            <path d="M-100 400 Q 300 200, 600 400 T 1300 400" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M-100 500 Q 400 300, 700 500 T 1400 500" stroke="white" strokeWidth="1" fill="none" opacity="0.2"/>
          </svg>
        </div>

        {/* Mannequin/Statue Figure - Right Side */}
        <div className="absolute right-0 top-0 bottom-0 w-[40%] hidden lg:flex items-end justify-end overflow-hidden pointer-events-none">
          <div className="relative h-full w-full">
            {/* Gradient overlay to blend */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent z-10" />
            {/* Placeholder for mannequin - using a gradient silhouette effect */}
            <div className="absolute right-0 bottom-0 w-[350px] h-[600px]">
              <div className="w-full h-full bg-gradient-to-t from-zinc-800/40 via-zinc-700/20 to-transparent rounded-t-full opacity-30" />
            </div>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="container mx-auto px-6 relative z-10 text-center pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 mb-10 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-300 tracking-[0.2em] uppercase font-medium">
              New Collection Available
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[120px] font-bold mb-8 tracking-tight leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block text-white">Discover</span>
            <span className="block text-white">Exceptional</span>
            <span className="block text-white">Fashion</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Curated collections from the world's most innovative designers. Where style meets artistry.
          </p>

          {/* CTA Buttons - Clean solid style like reference */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Primary Button - White filled */}
            <button 
              onClick={() => navigate("/products")}
              className="group px-8 py-4 rounded-full bg-white text-black font-medium text-sm tracking-wide hover:bg-zinc-200 transition-all duration-300 flex items-center gap-2"
            >
              Explore Collections
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Secondary Button - Dark filled */}
            <button 
              onClick={() => navigate("/stores")}
              className="px-8 py-4 rounded-full bg-zinc-800 text-white font-medium text-sm tracking-wide hover:bg-zinc-700 transition-all duration-300 border border-zinc-700"
            >
              View Stores
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-16 sm:gap-24 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="font-display text-4xl sm:text-5xl font-bold mb-2 text-white">500+</p>
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">Brands</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl sm:text-5xl font-bold mb-2 text-white">10K+</p>
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">Products</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl sm:text-5xl font-bold mb-2 text-white">50+</p>
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">Stores</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-y border-border/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl border border-border/50 bg-card/50 flex items-center justify-center mb-4 group-hover:border-foreground/30 transition-colors">
                  <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Just In</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold">New Arrivals</h2>
            </div>
            
            {/* Category Filters */}
            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-foreground text-background"
                      : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-card/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  category={product.type}
                />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 rounded-full"
              onClick={() => navigate("/products")}
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 relative overflow-hidden bg-[#0a0a0a]">
        {/* Decorative dark spheres */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-40 h-40 rounded-full bg-gradient-to-br from-zinc-800/50 to-zinc-900/60" />
          <div className="absolute bottom-[15%] right-[8%] w-64 h-64 rounded-full bg-gradient-to-br from-zinc-800/40 to-zinc-900/50" />
          <div className="absolute top-[60%] left-[5%] w-20 h-20 rounded-full bg-gradient-to-br from-zinc-700/40 to-zinc-800/50" />
        </div>

        {/* Curved decorative lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="xMidYMid slice">
            <path d="M0 300 Q 300 100, 600 300 T 1200 300" stroke="white" strokeWidth="1" fill="none"/>
            <path d="M0 350 Q 350 150, 650 350 T 1250 350" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 mb-10">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-300 tracking-[0.15em] uppercase font-medium">Curated Excellence</span>
          </div>
          
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-8 text-white leading-[1.1]">
            <span className="block">Where Style</span>
            <span className="block">Meets Vision</span>
          </h2>
          
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover exclusive collections from the world's most innovative designers. 
            Every piece tells a story of craftsmanship and creativity.
          </p>
          
          <button 
            onClick={() => navigate("/products")}
            className="px-8 py-4 rounded-full bg-zinc-800 text-white font-medium text-sm tracking-wide hover:bg-zinc-700 transition-all duration-300 border border-zinc-700"
          >
            Explore Collections
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
