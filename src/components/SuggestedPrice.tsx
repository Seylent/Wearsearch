'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/typography';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SuggestedPriceProps {
  productId: string;
  currentPrice: number;
}

export const SuggestedPrice = ({ productId, currentPrice }: SuggestedPriceProps) => {
  const { toast } = useToast();
  const [suggestedPrice, setSuggestedPrice] = useState<string>('');
  const [averagePrice, setAveragePrice] = useState<number>(0);
  const [totalSuggestions, setTotalSuggestions] = useState<number>(0);
  const [userSuggestion, setUserSuggestion] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const toFiniteNumber = (value: unknown): number | null => {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

  const SUGGESTED_PRICES_TABLE = 'suggested_prices';
  const getSuggestedPricesQuery = () =>
    (supabase as unknown as { from: (table: string) => any }).from(SUGGESTED_PRICES_TABLE);

  const loadAverageSuggestedPrice = useCallback(async () => {
    const { data, error } = await getSuggestedPricesQuery()
      .select('suggested_price')
      .eq('product_id', productId);

    if (error) {
      // Table doesn't exist yet - fail silently
      return;
    }

    const rows: unknown[] = Array.isArray(data) ? data : [];
    const prices = rows
      .map(row => (isRecord(row) ? toFiniteNumber(row.suggested_price) : null))
      .filter((v): v is number => typeof v === 'number');

    const avg = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
    setAveragePrice(Number(avg.toFixed(2)));
    setTotalSuggestions(prices.length);
  }, [SUGGESTED_PRICES_TABLE, productId]);

  const loadUserSuggestion = useCallback(
    async (userId: string) => {
      const { data, error } = await getSuggestedPricesQuery()
        .select('suggested_price')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Table doesn't exist yet - fail silently
        return;
      }

      if (!isRecord(data) || !data) return;
      const suggestedValue = data.suggested_price;
      const suggested = toFiniteNumber(suggestedValue);
      if (suggested === null) return;

      setUserSuggestion(suggested);
      setSuggestedPrice(String(suggested));
    },
    [SUGGESTED_PRICES_TABLE, productId]
  );

  const checkAuthAndLoadPrices = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);

    // Load average suggested price
    await loadAverageSuggestedPrice();

    // Load user's suggestion if logged in
    if (session) {
      await loadUserSuggestion(session.user.id);
    }
  }, [loadAverageSuggestedPrice, loadUserSuggestion]);

  useEffect(() => {
    void checkAuthAndLoadPrices();
  }, [checkAuthAndLoadPrices]);

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast({
        title: 'Login Required',
        description: 'Please login to suggest a price',
        variant: 'destructive',
      });
      return;
    }

    const price = Number.parseFloat(suggestedPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Price suggestion feature temporarily disabled for build compatibility
    toast({
      title: 'Feature Coming Soon',
      description: 'Price suggestions feature is under development',
      variant: 'default',
    });

    setLoading(false);
  };

  const priceDifference: number = 0; // Temporarily disabled for build

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
            <Text
              size="sm"
              variant={priceDifference > 0 ? 'destructive' : 'success'}
              className="select-none"
            >
              {priceDifference > 0 ? '+' : ''}
              {priceDifference.toFixed(1)}% compared to current price
            </Text>
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
                  onChange={e => setSuggestedPrice(e.target.value)}
                  placeholder={currentPrice.toFixed(2)}
                  className="pl-7"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {(() => {
                  if (loading) return 'Submitting...';
                  if (userSuggestion) return 'Update';
                  return 'Submit';
                })()}
              </Button>
            </div>
          </div>
          {!!userSuggestion && (
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

export default SuggestedPrice;
