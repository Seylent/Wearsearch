import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Package, Clock, ArrowRight } from "lucide-react";
import { productService, Product } from "@/services/productService";
import { NeonAbstractions } from "@/components/NeonAbstractions";

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
      description: "Hand-picked pieces from world-renowned designers",
    },
    {
      icon: Shield,
      title: "Authenticity Guaranteed",
      description: "Every item verified by our expert team",
    },
    {
      icon: Package,
      title: "Global Shipping",
      description: "Express delivery to 50+ countries worldwide",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Personal styling assistance anytime",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <NeonAbstractions />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card-strong rounded-full mb-8">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs text-foreground/80 tracking-wider uppercase font-medium">
                New Collection Available
              </span>
            </div>

            {/* Main headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              <span className="block">Discover</span>
              <span className="block relative inline-block">
                <span className="neon-text">Exceptional</span>
                {/* Decorative underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" preserveAspectRatio="none">
                  <path
                    d="M0,6 Q75,0 150,6 T300,6"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <span className="block text-gradient">Fashion</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Curated collections from the world's most innovative designers. Where style meets artistry.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/products")}
                size="lg" 
                className="group bg-white text-black hover:bg-zinc-100"
              >
                Explore Collections
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => navigate("/stores")}
                size="lg" 
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                View Stores
              </Button>
            </div>

            {/* Stats - with glass cards */}
            <div className="flex justify-center gap-6 sm:gap-10 mt-20">
              {[
                { value: "500+", label: "Brands" },
                { value: "10K+", label: "Products" },
                { value: "50+", label: "Stores" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-6 py-4 glass-card rounded-2xl">
                  <p className="font-display text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-7 h-12 rounded-full glass-card flex justify-center pt-3">
            <div className="w-1 h-2.5 bg-foreground rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-y border-zinc-800/50 bg-zinc-900/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-sm hover:bg-zinc-800/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl border border-zinc-700/50 bg-zinc-800/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-zinc-400" />
                </div>
                <h3 className="font-display font-semibold text-base mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Just In</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">New Arrivals</h2>
            </div>
            
            {/* Category Filters */}
            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-white text-black"
                      : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
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
            <button 
              onClick={() => navigate("/products")}
              className="px-8 py-3 rounded-full border border-zinc-700 text-white font-medium text-sm hover:bg-zinc-800 transition-all duration-300"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 relative overflow-hidden bg-black">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm mb-8">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            <span className="text-xs text-zinc-400 tracking-[0.15em] uppercase font-medium">Curated Excellence</span>
          </div>
          
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-white leading-[1.05]">
            <span className="block">Where Style</span>
            <span className="block">Meets Vision</span>
          </h2>
          
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover exclusive collections from the world's most innovative designers. 
            Every piece tells a story of craftsmanship and creativity.
          </p>
          
          <button 
            onClick={() => navigate("/products")}
            className="px-8 py-3.5 rounded-full bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 transition-all duration-300 border border-zinc-700"
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
