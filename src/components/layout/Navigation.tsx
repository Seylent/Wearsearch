import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { ContactsDialog } from "@/components/ContactsDialog";
import { SearchDropdown } from "@/features/search/components";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigationState } from "@/features/auth/hooks/useNavigationState";
import { Search, User as UserIcon, Menu, X } from "lucide-react";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Use centralized auth hook
  const { user, isAdmin } = useAuth();
  
  // Use navigation state hook
  const nav = useNavigationState();

  const handleLogoClick = () => {
    if (location.pathname === "/") window.location.reload();
    else navigate("/");
  };

  const navLinks = [
    { name: t('nav.allItems'), href: "/products" },
    { name: t('nav.stores'), href: "/stores" },
    { name: t('nav.about'), href: "/about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-2 sm:px-4">
      <nav className="flex items-center justify-between gap-0 rounded-full border border-zinc-700/80 bg-zinc-900/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-7xl w-full overflow-hidden">
        {/* Left Section - Logo */}
        <button 
          className="flex items-center gap-2.5 group px-3 sm:px-4 md:px-6 py-2 md:py-3 border-r border-zinc-700/60 hover:bg-zinc-800/50 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900" 
          onClick={handleLogoClick}
          aria-label={t('aria.navigateToHomepage')}
        >
          <span 
            className="text-white text-base sm:text-lg md:text-xl tracking-tight transition-all duration-300"
            style={{ fontFamily: "'Youre Gone', sans-serif" }}
          >
            wearsearch
          </span>
        </button>

        {/* Center Section - Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center px-6 py-3 border-r border-zinc-700/60">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.href}
              className={`px-4 py-1.5 text-sm font-medium transition-all duration-300 rounded-full ${
                location.pathname === link.href 
                  ? "text-white bg-zinc-800/90" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              } ${index === 0 ? 'neon-text' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <ContactsDialog />
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-1.5 text-sm font-medium transition-all duration-300 rounded-full ${
                location.pathname === "/admin" 
                  ? "text-white bg-zinc-800/90" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              {t('nav.admin')}
            </Link>
          )}
        </div>

        {/* Right Section - Search, Language, Menu & Profile */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 md:py-3">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-800/70 transition-all duration-300 group"
            onClick={nav.toggleMobileMenu}
            aria-label={nav.mobileMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
            aria-expanded={nav.mobileMenuOpen}
          >
            {nav.mobileMenuOpen ? (
              <X className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            ) : (
              <Menu className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Search Button */}
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-800/70 transition-all duration-300 group"
            onClick={nav.openSearch}
            aria-label={t('aria.openSearch')}
          >
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </button>

          {/* Language Selector */}
          <LanguageSelector />
          
          {user ? (
            <UserProfileMenu />
          ) : (
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-800/70 transition-all duration-300 group"
              onClick={() => navigate("/auth")}
            >
              <UserIcon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {nav.mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-2 right-2 bg-zinc-900/95 backdrop-blur-2xl rounded-2xl border border-zinc-700/80 shadow-2xl overflow-hidden z-40">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={nav.closeMobileMenu}
                className={`px-6 py-3 text-base font-medium transition-all duration-300 border-b border-zinc-800/50 ${
                  location.pathname === link.href 
                    ? "text-white bg-zinc-800/60" 
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/30"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button 
              className="px-6 py-3 text-base font-medium transition-all duration-300 text-zinc-300 hover:text-white hover:bg-zinc-800/30 text-left border-b border-zinc-800/50"
              onClick={() => {
                nav.closeMobileMenu();
                // Trigger ContactsDialog - we need to open it programmatically
                document.querySelector('[data-contacts-trigger]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              }}
            >
              {t('nav.contacts')}
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={nav.closeMobileMenu}
                className={`px-6 py-3 text-base font-medium transition-all duration-300 ${
                  location.pathname === "/admin" 
                    ? "text-white bg-zinc-800/60" 
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/30"
                }`}
              >
                {t('nav.admin')}
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Search Dropdown */}
      {nav.showSearch && <SearchDropdown onClose={nav.closeSearch} />}
    </header>
  );
};

export default Navigation;

export { Navigation };
