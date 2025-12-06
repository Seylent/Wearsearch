import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/sections/NeonAbstractions";
import { Mail, MessageSquare, Send } from "lucide-react";
import { FaTelegram, FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const Contacts = () => {
  const contactMethods = [
    {
      icon: FaTelegram,
      title: "Telegram",
      description: "Join our community and get instant support",
      link: "https://t.me/wearsearch",
      label: "@wearsearch"
    },
    {
      icon: FaInstagram,
      title: "Instagram",
      description: "Follow us for latest updates and fashion inspiration",
      link: "https://instagram.com/wearsearch",
      label: "@wearsearch"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Send us a message anytime",
      link: "mailto:contact@wearsearch.com",
      label: "contact@wearsearch.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <NeonAbstractions />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8 animate-fade-in">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs text-muted-foreground tracking-wider uppercase">
              Get in Touch
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">Let's</span>
            <span className="block neon-text">Connect</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Have a question or want to collaborate? We'd love to hear from you. 
            Choose your preferred method and reach out.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-full p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-foreground/30 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-500">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mb-6 group-hover:bg-foreground/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500">
                    <method.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-foreground/80 transition-colors">
                    {method.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {method.description}
                  </p>
                  <p className="text-foreground font-medium group-hover:underline">
                    {method.label}
                  </p>

                  {/* Arrow indicator */}
                  <div className="absolute top-8 right-8 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-y border-border/50 bg-card/10 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Join Our <span className="text-gradient">Community</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Stay updated with the latest fashion trends, exclusive drops, and special offers. 
              Follow us on social media and never miss a beat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background rounded-full px-8 transition-all"
                onClick={() => window.open('https://t.me/wearsearch', '_blank')}
              >
                <FaTelegram className="mr-2 w-5 h-5" />
                Join Telegram
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background rounded-full px-8 transition-all"
                onClick={() => window.open('https://instagram.com/wearsearch', '_blank')}
              >
                <FaInstagram className="mr-2 w-5 h-5" />
                Follow Instagram
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contacts;
