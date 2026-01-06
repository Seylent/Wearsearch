import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/utils/cn";

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

export const ScrollToTop = ({ 
  threshold = 400,
  className 
}: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full",
        "bg-white text-black shadow-lg",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:bg-zinc-100 hover:scale-110 hover:shadow-xl",
        "active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-white/50",
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
      aria-label="Прокрутити наверх"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
