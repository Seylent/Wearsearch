import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  const footerLinks = {
    shop: [
      { name: "New Arrivals", href: "/products" },
      { name: "Best Sellers", href: "/products" },
      { name: "Collections", href: "/products" },
      { name: "Sale", href: "/products" },
    ],
    support: [
      { name: "Shipping & Returns", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Size Guide", href: "#" },
      { name: "Contact", href: "#" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Stores", href: "/stores" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
  };

  return (
    <footer className="bg-background border-t border-border/20 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg border border-foreground/30 flex items-center justify-center bg-card/30 backdrop-blur-sm">
                <span className="font-display font-bold text-base">W</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                Wearsearch
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-xs">
              Discover curated fashion from the world's most innovative designers and 
              independent stores.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-border/50 hover:border-foreground/40 flex items-center justify-center transition-all duration-300 hover:bg-foreground/5"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-border/50 hover:border-foreground/40 flex items-center justify-center transition-all duration-300 hover:bg-foreground/5"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-foreground/80">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-foreground/80">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-foreground/80">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 Wearsearch. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
