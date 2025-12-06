import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeatureHighlight } from "@/components/sections/FeatureHighlight";
import { FeaturedCategories } from "@/components/sections/FeaturedCategories";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { FeaturedStores } from "@/components/sections/FeaturedStores";
import { AboutSection } from "@/components/sections/AboutSection";
import { Newsletter } from "@/components/sections/Newsletter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30 selection:text-white">
      <Navigation />
      <main>
        <HeroSection />
        <FeatureHighlight />
        <FeaturedCategories />
        <FeaturedProducts />
        <FeaturedStores />
        <AboutSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
