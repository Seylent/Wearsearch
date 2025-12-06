import { Sparkles, Shield, Truck, Clock } from "lucide-react";

export const FeatureHighlight = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Curated Selection",
      description: "Hand-picked pieces from world-renowned designers"
    },
    {
      icon: Shield,
      title: "Authenticity Guaranteed",
      description: "Every item verified by our expert team"
    },
    {
      icon: Truck,
      title: "Global Shipping",
      description: "Express delivery to 50+ countries worldwide"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Personal styling assistance anytime"
    }
  ];

  return (
    <section className="py-16 border-y border-white/5 bg-card/10 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-2xl border border-white/5 bg-card/20 hover:border-primary/30 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)] transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

