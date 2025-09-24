import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Eye, ShoppingBag, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface HomepageSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  isActive: boolean;
}

export default function HomepageSections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: sections = [] } = useQuery<HomepageSection[]>({
    queryKey: ["/api/admin/homepage-sections"],
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch products for each section
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/homepage-sections/featured_products/products"],
  });

  const { data: popularProducts = [] } = useQuery({
    queryKey: ["/api/homepage-sections/popular_products/products"],
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/homepage-sections/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/homepage-sections"] });
      toast({ title: "Bölüm başarıyla güncellendi" });
      setEditingSection(null);
    },
    onError: () => {
      toast({ title: "Bölüm güncellenemedi", variant: "destructive" });
    },
  });

  const updateProductsMutation = useMutation({
    mutationFn: async ({ sectionId, productIds }: { sectionId: string; productIds: string[] }) => {
      console.log('Updating section:', sectionId, 'with products:', productIds);
      return await apiRequest(`/api/admin/homepage-sections/${sectionId}/products`, "POST", {
        productIds
      });
    },
    onSuccess: (data, variables) => {
      console.log('Successfully updated section products:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/homepage-sections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-sections/featured_products/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-sections/popular_products/products"] });
      toast({ title: "Ürünler başarıyla güncellendi" });
    },
    onError: (error: any) => {
      console.error('Failed to update section products:', error);
      toast({ 
        title: "Ürünler güncellenemedi", 
        description: error.message || "Bilinmeyen hata", 
        variant: "destructive" 
      });
    },
  });

  const handleSectionUpdate = () => {
    if (!editingSection) return;
    
    updateSectionMutation.mutate({
      id: editingSection.id,
      updates: {
        title: editingSection.title,
        subtitle: editingSection.subtitle
      }
    });
  };

  const handleProductSelection = (sectionId: string, productIds: string[]) => {
    updateProductsMutation.mutate({ sectionId, productIds });
  };

  const getSectionProducts = (sectionKey: string): Product[] => {
    switch (sectionKey) {
      case "featured_products":
        return featuredProducts;
      case "popular_products":
        return popularProducts;
      default:
        return [];
    }
  };

  // Filter products based on search term
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Homepage Sections Management</h1>
        <Badge variant="secondary">Real-time Updates</Badge>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => {
          const sectionProducts = getSectionProducts(section.sectionKey);
          
          return (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingSection(section)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Section
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Section: {section.title}</DialogTitle>
                        </DialogHeader>
                        {editingSection && (
                          <div className="space-y-4">
                            <div>
                              <Label>Section Title</Label>
                              <Input
                                value={editingSection.title}
                                onChange={(e) => setEditingSection({
                                  ...editingSection,
                                  title: e.target.value
                                })}
                                placeholder="Section title"
                              />
                            </div>
                            <div>
                              <Label>Section Subtitle</Label>
                              <Textarea
                                value={editingSection.subtitle}
                                onChange={(e) => setEditingSection({
                                  ...editingSection,
                                  subtitle: e.target.value
                                })}
                                placeholder="Section subtitle/description"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingSection(null)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleSectionUpdate} 
                                disabled={updateSectionMutation.isPending}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const currentProducts = getSectionProducts(section.sectionKey);
                            const currentProductIds = currentProducts.map(p => p.id);
                            setSelectedProducts(currentProductIds);
                            setSearchTerm("");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Manage Products
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Select Products for: {section.title}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="text-sm text-gray-600">
                            Select up to 4 products to display in this section
                          </div>

                          {/* Search Input */}
                          <div className="space-y-2">
                            <Label htmlFor="product-search">Search Products</Label>
                            <Input
                              id="product-search"
                              type="text"
                              placeholder="Ürün adını yazın..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full"
                            />
                            {searchTerm && (
                              <p className="text-sm text-gray-500">
                                {filteredProducts.length} ürün bulundu
                              </p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                            {filteredProducts.map((product) => (
                              <div
                                key={product.id}
                                className={`p-3 border rounded cursor-pointer transition-colors ${
                                  selectedProducts.includes(product.id)
                                    ? "border-primary bg-primary/10"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => {
                                  if (selectedProducts.includes(product.id)) {
                                    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                  } else if (selectedProducts.length < 4) {
                                    setSelectedProducts([...selectedProducts, product.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-500">₺{product.price}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Selected: {selectedProducts.length}/4
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setSelectedProducts([])}
                              >
                                Clear Selection
                              </Button>
                              <Button 
                                onClick={() => {
                                  handleProductSelection(section.id, selectedProducts);
                                  setSelectedProducts([]);
                                }}
                                disabled={updateProductsMutation.isPending || selectedProducts.length === 0}
                              >
                                Update Products
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current subtitle:</p>
                    <p className="text-gray-900">{section.subtitle}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Current products ({sectionProducts.length}/4):
                    </p>
                    
                    {sectionProducts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sectionProducts.map((product: Product) => (
                          <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 relative group hover:shadow-lg transition-all duration-200 hover:border-gray-300">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 z-10"
                              onClick={() => {
                                const currentProducts = getSectionProducts(section.sectionKey);
                                const currentProductIds = currentProducts.map((p: Product) => p.id);
                                const updatedProductIds = currentProductIds.filter(id => id !== product.id);
                                handleProductSelection(section.id, updatedProductIds);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{product.name}</h4>
                              <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold text-red-600">₺{product.price}</span>
                                  {product.originalPrice && product.originalPrice !== product.price && (
                                    <span className="text-xs text-gray-400 line-through">₺{product.originalPrice}</span>
                                  )}
                                </div>
                                <div className="flex items-center text-green-600 text-xs">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                  Stokta var
                                </div>
                              </div>
                              {product.brand && (
                                <div className="pt-1">
                                  <span className="text-xs text-gray-400 uppercase tracking-wide">{product.brand}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1">Seçili ürün yok</p>
                        <p className="text-sm text-gray-400">Ürün eklemek için "Manage Products" butonunu kullanın</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}