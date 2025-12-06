export const AboutSection = () => {
  return (
    <section className="py-24 bg-card/10 backdrop-blur-sm border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="animate-fade-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white">
                Where Style Meets Innovation
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover curated fashion from the world's most innovative designers and independent stores. 
              Our platform brings together cutting-edge style with unparalleled authenticity, 
              creating a marketplace where artistry and commerce converge.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center p-6 rounded-2xl border border-white/5 bg-card/20 hover:border-primary/30 transition-all">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-lg font-bold text-white mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">
                Carefully selected items from trusted stores
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl border border-white/5 bg-card/20 hover:border-primary/30 transition-all">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-lg font-bold text-white mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Quick shipping from stores worldwide
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl border border-white/5 bg-card/20 hover:border-primary/30 transition-all">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-lg font-bold text-white mb-2">Best Prices</h3>
              <p className="text-sm text-muted-foreground">
                Compare prices across multiple stores
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

