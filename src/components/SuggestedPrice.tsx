import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SuggestedPriceProps {
  productId: string;
  currentPrice: number;
}

export const SuggestedPrice = ({ productId, currentPrice }: SuggestedPriceProps) => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  };

  const showComingSoon = () => {
    toast({
      title: "Coming Soon",
      description: "Price suggestions feature will be available soon!",
    });
  };

  return (
    <div className="space-y-4 p-6 border-2 border-border rounded-2xl bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2 select-none">
          <DollarSign className="w-5 h-5" />
          Community Price Suggestion
        </h3>
      </div>

      <div className="text-center py-8">
        <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h4 className="font-semibold mb-2">Coming Soon</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Help the community by suggesting fair prices for products
        </p>
        <Button onClick={showComingSoon} variant="outline" size="sm">
          Notify Me When Available
        </Button>
      </div>

      {!isLoggedIn && (
        <p className="text-sm text-muted-foreground select-none text-center">
          Login to get notified when this feature becomes available
        </p>
      )}
    </div>
  );
};
