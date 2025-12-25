import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";

interface GenderBadgeProps {
  gender?: string | null;
  className?: string;
  showIcon?: boolean;
}

export const GenderBadge = ({ gender, className = "", showIcon = true }: GenderBadgeProps) => {
  if (!gender) return null;

  const genderConfig = {
    men: {
      label: "Men's",
      className: "bg-blue-500 hover:bg-blue-600 text-white",
      icon: <User className="w-3 h-3" />
    },
    women: {
      label: "Women's",
      className: "bg-pink-500 hover:bg-pink-600 text-white",
      icon: <User className="w-3 h-3" />
    },
    unisex: {
      label: "Unisex",
      className: "bg-purple-500 hover:bg-purple-600 text-white",
      icon: <Users className="w-3 h-3" />
    }
  };

  const normalizedGender = gender?.toLowerCase();
  const config = genderConfig[normalizedGender as keyof typeof genderConfig];
  
  if (!config) return null;

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1`}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};
