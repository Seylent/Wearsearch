import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Newsletter = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="bg-card p-6 rounded-xl flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">Join the newsletter</h3>
            <p className="text-muted-foreground">Get weekly updates and curated drops.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input placeholder="Email address" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    }
  };

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full border border-foreground/20 flex items-center justify-center mx-auto mb-8 animate-glow">
            <span className="font-display text-2xl">✦</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Subscribe for exclusive drops, early access, and style inspiration delivered to your inbox.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 h-14 px-6 rounded-full bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 focus:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
              required
            />
            <Button type="submit" variant="neon-solid" size="lg" className="h-14">
              Subscribe
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
