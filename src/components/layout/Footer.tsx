import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const footerLinks = {
    shop: [
      { name: t('footer.allItems'), href: "/products" },
      { name: t('footer.saved'), href: "/favorites" },  
    ],
    company: [
      { name: t('footer.about'), href: "/about" },      
    ],
  };

  return (
    <footer className="bg-black border-t border-zinc-800/50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-white">
              {t('footer.shop')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors select-none"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-5 text-sm tracking-wider uppercase text-white">
              {t('footer.company')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (      
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors select-none"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/contacts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-zinc-800/50 flex justify-center items-center">
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors select-none">
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/terms" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors select-none">
              {t('footer.termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
