import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Plus, Edit, Trash2, Search, Tag, ArrowLeft } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import ENDPOINTS from "@/services/endpoints";

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  created_at: string;
  product_count?: number;
}

const AdminBrands = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    description: "",
    website_url: "",
  });

  // Check admin access
  useEffect(() => {
    checkAdmin();
    fetchBrands();
  }, []);

  const checkAdmin = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        if (userData.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "Admin access required",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (e) {
        navigate('/auth');
      }
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const url = searchQuery 
        ? `http://192.168.0.117:3000/api${ENDPOINTS.BRANDS.LIST}?search=${encodeURIComponent(searchQuery)}`
        : `http://192.168.0.117:3000/api${ENDPOINTS.BRANDS.LIST}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success || Array.isArray(data)) {
        setBrands(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBrands();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Create brand
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Brand name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`http://192.168.0.117:3000/api${ENDPOINTS.BRANDS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Brand created successfully!",
        });
        setIsModalOpen(false);
        fetchBrands();
        resetForm();
      } else {
        throw new Error(data.error || 'Failed to create brand');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create brand",
        variant: "destructive",
      });
    }
  };

  // Update brand
  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBrand) return;

    try {
      const response = await fetch(`http://192.168.0.117:3000/api${ENDPOINTS.BRANDS.UPDATE(editingBrand.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Brand updated successfully!",
        });
        setIsModalOpen(false);
        fetchBrands();
        resetForm();
      } else {
        throw new Error(data.error || 'Failed to update brand');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update brand",
        variant: "destructive",
      });
    }
  };

  // Delete brand
  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete "${brandName}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`http://192.168.0.117:3000/api${ENDPOINTS.BRANDS.DELETE(brandId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Brand deleted successfully!",
        });
        fetchBrands();
      } else {
        throw new Error(data.error || 'Failed to delete brand');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete brand. It may have products linked to it.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", logo_url: "", description: "", website_url: "" });
    setEditingBrand(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url || "",
      description: brand.description || "",
      website_url: brand.website_url || "",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Header */}
      <section className="relative py-20 border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin')} 
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          
          <div className="flex items-center gap-3 mb-6">
            <Tag className="w-8 h-8" />
            <span className="text-sm text-muted-foreground uppercase tracking-[0.2em]">Admin Panel</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-3">
            <span className="text-gradient">Brands Management</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage all brands in your marketplace
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50"
                />
              </div>
              <Button 
                onClick={openCreateModal}
                className="bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Brand
              </Button>
            </div>

            {/* Brands Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <div 
                      key={brand.id} 
                      className="group p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-foreground/30 transition-all"
                    >
                      {brand.logo_url && (
                        <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center border border-border/50">
                          <img 
                            src={brand.logo_url} 
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain p-2"
                          />
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-2">{brand.name}</h3>
                      {brand.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {brand.description}
                        </p>
                      )}
                      {brand.website_url && (
                        <a 
                          href={brand.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mb-3 block"
                        >
                          Visit Website →
                        </a>
                      )}
                      {brand.product_count !== undefined && (
                        <p className="text-xs text-muted-foreground mb-4">
                          {brand.product_count} product{brand.product_count !== 1 ? 's' : ''}
                        </p>
                      )}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(brand)}
                          className="flex-1 border-border/50 hover:bg-foreground/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBrand(brand.id, brand.name)}
                          className="flex-1 border-border/50 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 border border-dashed border-border/50 rounded-xl">
                    <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-lg mb-2">
                      {searchQuery ? 'No brands found' : 'No brands yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'Create your first brand to get started'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border/50 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6">
              {editingBrand ? 'Edit Brand' : 'Create Brand'}
            </h2>
            
            <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Brand Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nike"
                  className="h-12 bg-card/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-base font-semibold">
                  Brand Logo <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <ImageUploader
                  onImageUpload={(url) => setFormData({ ...formData, logo_url: url })}
                  currentImage={formData.logo_url}
                  label=""
                />
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="Or paste logo URL"
                  className="h-12 bg-card/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the brand..."
                  className="min-h-24 bg-card/50 border-border/50"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-base font-semibold">
                  Website URL <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                  className="h-12 bg-card/50 border-border/50"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 h-12 border-border/50 hover:bg-card/80"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminBrands;


