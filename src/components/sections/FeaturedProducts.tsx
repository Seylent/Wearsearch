import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { productService, Product } from "@/services/productService";

export const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts({ limit: 8 });
        if (response && response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.warn('No products found or invalid response format');
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <section className="py-24 bg-card/10 backdrop-blur-sm" id="products">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-3 text-white">New Arrivals</h2>
            <p className="text-muted-foreground text-lg">Explore the latest additions to our marketplace</p>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:text-primary group"
            onClick={() => navigate('/products')}
          >
            View All <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image || product.image_url || ""}
                price={String(product.price)}
                category={product.type || product.category}
                brand={product.brand}
              />
            ))}
          </div>
        ) : (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full border-2 border-foreground/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              It looks like there are no products available right now. 
              {' '}Make sure your backend is running at <code className="text-sm bg-card px-2 py-1 rounded">http://localhost:3000</code>
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
            >
              Reload Page
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

