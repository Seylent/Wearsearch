export const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">© 2025 WEARSEARCH. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-white text-sm uppercase tracking-widest transition-colors">Instagram</a>
            <a href="#" className="text-muted-foreground hover:text-white text-sm uppercase tracking-widest transition-colors">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-white text-sm uppercase tracking-widest transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

