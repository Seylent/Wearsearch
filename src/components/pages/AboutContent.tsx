import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Shield, Globe, Heart } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import { NeonAbstractions } from "@/components/NeonAbstractions";

const AboutContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const values = [
    {
      icon: Sparkles,
      title: t('about.value1Title'),
      description: t('about.value1Desc')
    },
    {
      icon: Shield,
      title: t('about.value2Title'),
      description: t('about.value2Desc')
    },
    {
      icon: Globe,
      title: t('about.value3Title'),
      description: t('about.value3Desc')
    },
    {
      icon: Heart,
      title: t('about.value4Title'),
      description: t('about.value4Desc')
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* NeonAbstractions background - stars and round objects ONLY */}
        <div className="absolute inset-0 z-0">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs tracking-wider uppercase">Our Story</span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="block">{t('about.title')}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {t('about.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 border-y border-border/20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">{t('about.missionTitle')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.mission')}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">{t('about.valuesTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('about.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value) => (
              <div 
                key={value.title}
                className="p-8 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-all duration-300 group"
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
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            Ready to Explore?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
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
    </div>
  );
};

export default AboutContent;
