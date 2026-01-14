/**
 * Analytics Dashboard Component
 * Shows statistics, insights, and data visualizations
 */

'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Store, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Loader2 
} from "lucide-react";

interface AnalyticsData {
  totalProducts: number;
  totalStores: number;
  totalBrands: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  categoriesCount: Record<string, number>;
  topBrands: Array<{name: string; count: number}>;
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  
  // Price History
  showPriceHistory: boolean;
  onTogglePriceHistory: () => void;
  loadingPriceHistory: boolean;
  selectedProductForHistory: string | null;
  onSelectProductForHistory: (productId: string) => void;
  priceHistory: Record<string, Array<{
    id: string;
    store_id: string;
    store_name: string;
    price: number;
    changed_at: string;
  }>>;
  
  // Activity Log  
  showActivityLog: boolean;
  onToggleActivityLog: () => void;
  loadingActivityLog: boolean;
  activityLog: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    user_name: string;
    created_at: string;
    changes?: Record<string, unknown>;
  }>;
  
  // Products data for price history selection
  products: Array<Record<string, unknown>>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  showPriceHistory,
  onTogglePriceHistory,
  loadingPriceHistory,
  selectedProductForHistory,
  onSelectProductForHistory,
  priceHistory,
  showActivityLog,
  onToggleActivityLog,
  loadingActivityLog,
  activityLog,
  products,
}) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Products</span>
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{analytics.totalProducts}</p>
          <p className="text-xs text-muted-foreground mt-2">In marketplace</p>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Stores</span>
            <Store className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{analytics.totalStores}</p>
          <p className="text-xs text-muted-foreground mt-2">Active sellers</p>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Brands</span>
            <Package className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{analytics.totalBrands}</p>
          <p className="text-xs text-muted-foreground mt-2">Registered brands</p>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Price</span>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">${analytics.avgPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            ${analytics.minPrice} - ${analytics.maxPrice}
          </p>
        </div>
      </div>

      {/* Categories and Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Distribution */}
        <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.categoriesCount)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {count}
                    </div>
                    <span className="font-medium capitalize">{category}</span>
                  </div>
                  <div className="w-24 bg-border/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(count / analytics.totalProducts) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Brands */}
        <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Top Brands
          </h3>
          <div className="space-y-3">
            {analytics.topBrands.slice(0, 6).map((brand, index) => (
              <div key={brand.name} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{brand.name}</p>
                  <p className="text-sm text-muted-foreground">{brand.count} products</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="w-6 h-6" />
          Analytics & Insights
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price History Card */}
          <div className="p-6 rounded-xl border border-border/50 bg-card/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Price History
                {loadingPriceHistory && <Loader2 className="w-4 h-4 animate-spin" />}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePriceHistory}
              >
                {showPriceHistory ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Track price changes over time for all products and stores
            </p>
            
            {showPriceHistory && (
              <div className="space-y-4">
                {/* Product Selector */}
                <div>
                  <label htmlFor="product-history-select" className="text-sm font-medium mb-2 block">Select Product:</label>
                  <select
                    id="product-history-select"
                    value={selectedProductForHistory || ''}
                    onChange={(e) => onSelectProductForHistory(e.target.value)}
                    className="w-full p-3 rounded-lg bg-card/50 border border-border/50"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (${product.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price History Display */}
                {(() => {
                  if (!selectedProductForHistory || !priceHistory[selectedProductForHistory]) {
                    return null;
                  }
                  return (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <h4 className="font-medium">Price Changes:</h4>
                    {priceHistory[selectedProductForHistory].map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-card/30">
                        <div>
                          <p className="font-medium">{entry.store_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {globalThis.window !== undefined && new Date(entry.changed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${entry.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  );
                })()}
                {selectedProductForHistory && !priceHistory[selectedProductForHistory] && (
                  <div className="text-center py-8 text-muted-foreground">
                    No price history available for this product
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Log Card */}
          <div className="p-6 rounded-xl border border-border/50 bg-card/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Activity Log
                {loadingActivityLog && <Loader2 className="w-4 h-4 animate-spin" />}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleActivityLog}
              >
                {showActivityLog ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Recent changes and admin actions across the platform
            </p>
            
            {showActivityLog && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityLog.length > 0 ? (
                  activityLog.slice(0, 20).map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-card/30 border border-border/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={(() => {
                          const baseClasses = 'text-xs px-2 py-0.5 rounded';
                          if (log.action === 'create') return `${baseClasses} bg-green-500/20 text-green-600`;
                          if (log.action === 'update') return `${baseClasses} bg-blue-500/20 text-blue-600`;
                          return `${baseClasses} bg-red-500/20 text-red-600`;
                        })()}>
                          {log.action.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {globalThis.window !== undefined && new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.entity_type} #{log.entity_id}</p>
                      <p className="text-xs text-muted-foreground">by {log.user_name}</p>
                      {log.changes && typeof log.changes === 'object' && (
                        <div className="text-xs bg-card/50 p-2 rounded border">
                          <pre className="whitespace-pre-wrap text-xs">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};