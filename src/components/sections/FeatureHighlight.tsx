import { Sparkles, Shield, Truck, Clock } from "lucide-react";

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

export const FeatureHighlight = () => {
  return (
    <section className="py-20 border-y border-border/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-full border border-border/50 flex items-center justify-center mx-auto mb-4 group-hover:border-foreground/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
                <feature.icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="font-display font-semibold mb-2 text-sm sm:text-base">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
