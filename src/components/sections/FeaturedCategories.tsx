import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FeaturedCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { name: "Men", gender: "men" },
    { name: "Women", gender: "women" },
    { name: "Unisex", gender: "unisex" }
  ];

  return (
    <section className="py-16 border-b border-white/5 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-3 text-white">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">Explore our curated collections</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <button 
              key={cat.gender}
              onClick={() => {
                const params = new URLSearchParams(location.search);
                params.set('gender', cat.gender);
                navigate(`/?${params.toString()}#products`);
              }}
              className="group relative h-40 rounded-2xl overflow-hidden border border-white/5 bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-between px-10 z-20">
                <span className="text-3xl font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300 text-white">{cat.name}</span>
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

