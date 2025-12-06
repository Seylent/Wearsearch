import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/sections/NeonAbstractions";
import { Target, Users, Zap, Shield, TrendingUp, Award } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To connect fashion enthusiasts with the world's most innovative designers and independent stores, creating a curated marketplace where style meets authenticity."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a platform that empowers both buyers and sellers, fostering connections and supporting independent fashion businesses worldwide."
    },
    {
      icon: Shield,
      title: "Verified Quality",
      description: "Every store and product is carefully vetted by our expert team to ensure authenticity, quality, and exceptional service standards."
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Constantly evolving our platform with cutting-edge features to provide the best possible shopping experience for our community."
    }
  ];

  const stats = [
    { value: "500+", label: "Brands", icon: Award },
    { value: "10K+", label: "Products", icon: Zap },
    { value: "50+", label: "Stores", icon: Users },
    { value: "99%", label: "Satisfaction", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <NeonAbstractions />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground tracking-wider uppercase">
              About WEARSEARCH
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">Where</span>
            <span className="block neon-text">Style Meets</span>
            <span className="block text-gradient">Innovation</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover curated fashion from the world's most innovative designers and independent stores. 
            Our platform brings together cutting-edge style with unparalleled authenticity, 
            creating a marketplace where artistry and commerce converge.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-border/50 bg-card/10 backdrop-blur-sm relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card border border-border/50 flex items-center justify-center group-hover:border-foreground/30 group-hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)] transition-all duration-500">
                  <stat.icon className="w-8 h-8" />
                </div>
                <p className="font-display text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-gradient">WEARSEARCH</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're more than just a marketplace — we're a community dedicated to exceptional fashion and authentic experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-full p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-foreground/30 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all duration-500">
                  <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-6 group-hover:bg-foreground/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 border-y border-border/50 bg-card/10 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Our <span className="neon-text">Vision</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We envision a world where fashion discovery is seamless, authentic, and inspiring. 
              By connecting innovative designers with discerning customers, we're building the future 
              of online fashion retail — one curated piece at a time.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join us on this journey as we redefine what it means to shop for fashion online, 
              creating meaningful connections between creators and consumers who value quality, 
              authenticity, and exceptional style.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
