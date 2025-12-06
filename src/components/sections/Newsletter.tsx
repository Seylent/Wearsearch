import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // TODO: Connect to newsletter API
    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter",
    });
    setEmail("");
  };

  return (
    <section className="py-24 bg-background border-y border-white/5 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
              Stay in the Loop
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Subscribe for exclusive drops, early access, and style inspiration delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-card/50 border-white/10 rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 backdrop-blur-sm"
            />
            <Button 
              type="submit"
              className="bg-white text-black hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-full px-8 h-12 font-medium uppercase tracking-wider transition-all"
            >
              Subscribe
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
};

