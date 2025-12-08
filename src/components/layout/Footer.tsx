import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { FaTelegram } from "react-icons/fa";

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
    <footer className="bg-black border-t border-zinc-800/50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg border border-zinc-700/60 flex items-center justify-center bg-zinc-800/40">
                <span className="font-display font-bold text-sm text-white">W</span>
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                Wearsearch
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-xs">
              Discover curated fashion from the world's most innovative designers and 
              independent stores.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center transition-all duration-300 hover:bg-zinc-800/50"
              >
                <Instagram className="w-4 h-4 text-zinc-400" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center transition-all duration-300 hover:bg-zinc-800/50"
              >
                <FaTelegram className="w-4 h-4 text-zinc-400" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-white">
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
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-white">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-white">
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
        <div className="pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            © 2024 Wearsearch. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
