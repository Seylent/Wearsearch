import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SuggestedPriceProps {
  productId: string;
  currentPrice: number;
}

export const SuggestedPrice = ({ productId, currentPrice }: SuggestedPriceProps) => {
  const { toast } = useToast();
  const [suggestedPrice, setSuggestedPrice] = useState<string>("");
  const [averagePrice, setAveragePrice] = useState<number>(0);
  const [totalSuggestions, setTotalSuggestions] = useState<number>(0);
  const [userSuggestion, setUserSuggestion] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthAndLoadPrices();
  }, [productId]);

  const checkAuthAndLoadPrices = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);

    // Load average suggested price
    await loadAverageSuggestedPrice();

    // Load user's suggestion if logged in
    if (session) {
      await loadUserSuggestion(session.user.id);
    }
  };

  const loadAverageSuggestedPrice = async () => {
    const { data, error } = await supabase
      .from("suggested_prices" as any)
      .select("suggested_price")
      .eq("product_id", productId);

    if (error) {
      // Table doesn't exist yet - fail silently
      return;
    }

    if (data) {
      const prices = data.map((p: any) => p.suggested_price);
      const avg = prices.length > 0 
        ? prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length 
        : 0;
      setAveragePrice(Number(avg.toFixed(2)));
      setTotalSuggestions(prices.length);
    }
  };

  const loadUserSuggestion = async (userId: string) => {
    const { data, error } = await supabase
      .from("suggested_prices" as any)
      .select("suggested_price")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      // Table doesn't exist yet - fail silently
      return;
    }

    if (data) {
      setUserSuggestion((data as any).suggested_price);
      setSuggestedPrice(String((data as any).suggested_price));
    }
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to suggest a price",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(suggestedPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("suggested_prices" as any)
      .upsert({
        product_id: productId,
        user_id: session.user.id,
        suggested_price: price,
      }, {
        onConflict: "product_id,user_id"
      });

    if (error) {
      toast({
        title: "Feature Not Available",
        description: "Price suggestions feature is coming soon",
        variant: "destructive",
      });
    } else {
      setUserSuggestion(price);
      await loadAverageSuggestedPrice();
      toast({
        title: "Success",
        description: "Price suggestion submitted successfully",
      });
    }

    setLoading(false);
  };

  const priceDifference = averagePrice > 0 ? ((averagePrice - currentPrice) / currentPrice * 100) : 0;

  return (
    <div className="space-y-4 p-6 border-2 border-border rounded-2xl bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2 select-none">
          <DollarSign className="w-5 h-5" />
          Community Price Suggestion
        </h3>
      </div>

      {totalSuggestions > 0 && (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${averagePrice.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground select-none">
              (based on {totalSuggestions} {totalSuggestions === 1 ? 'suggestion' : 'suggestions'})
            </span>
          </div>
          {priceDifference !== 0 && (
            <p className={`text-sm select-none ${priceDifference > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(1)}% compared to current price
            </p>
          )}
        </div>
      )}

      {isLoggedIn && (
        <form onSubmit={submitSuggestion} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="suggested-price">
              {userSuggestion ? 'Update your suggestion' : 'Suggest your price'}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
                  $
                </span>
                <Input
                  id="suggested-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                  placeholder={currentPrice.toFixed(2)}
                  className="pl-7"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : userSuggestion ? 'Update' : 'Submit'}
              </Button>
            </div>
          </div>
          {userSuggestion && (
            <p className="text-xs text-muted-foreground select-none">
              Your current suggestion: ${userSuggestion.toFixed(2)}
            </p>
          )}
        </form>
      )}

      {!isLoggedIn && (
        <p className="text-sm text-muted-foreground select-none">
          Login to suggest a price for this product
        </p>
      )}
    </div>
  );
};
