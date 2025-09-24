import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch popular searches from API
  const { data: popularSearches = [] } = useQuery({
    queryKey: ["/api/popular-searches"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const filteredProducts = products.filter(
    (product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle popular search click
  const handlePopularSearchClick = async (search: any) => {
    try {
      // Track the click
      await apiRequest(`/api/popular-searches/${search.id}/click`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error tracking popular search click:", error);
    }
    // Set search term
    setSearchTerm(search.keyword);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 search-overlay">
      <div className="h-screen bg-white overflow-hidden flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Ürün Ara</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Aramak istediğin ürünü, kolaylıka bul!"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
              autoFocus
            />
          </div>

          {/* Popular Searches */}
          {!searchTerm && popularSearches.length > 0 && (
            <div className="mb-8 flex-shrink-0">
              <h3 className="text-lg font-semibold mb-4">Popüler Aramalar</h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches
                  .filter((search: any) => search.isActive)
                  .map((search: any) => (
                    <Button
                      key={search.id}
                      variant="outline"
                      onClick={() => handlePopularSearchClick(search)}
                      className="rounded-full"
                      data-testid={`popular-search-${search.id}`}
                    >
                      {search.keyword}
                      {search.clickCount > 0 && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({search.clickCount})
                        </span>
                      )}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchTerm && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
                Arama Sonuçları ({filteredProducts.length})
              </h3>

              {filteredProducts.length > 0 ? (
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  {filteredProducts.map((product: Product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        onClose();
                        setLocation(`/product/${product.id}`);
                      }}
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.category}
                        </p>
                        <div className="mt-1">
                          {(() => {
                            const price = Number(product.price) || 0;
                            const originalPrice =
                              Number(product.originalPrice) || 0;

                            // Eğer price 0 veya yok ama originalPrice varsa, originalPrice'ı göster
                            if (price === 0 && originalPrice > 0) {
                              return (
                                <span className="text-lg font-bold text-primary">
                                  {originalPrice.toLocaleString("tr-TR")} ₺
                                </span>
                              );
                            }

                            // Eğer gerçek indirim varsa (price < originalPrice), ikisini de göster
                            if (price > 0 && originalPrice > price) {
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-primary">
                                    {price.toLocaleString("tr-TR")} ₺
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {originalPrice.toLocaleString("tr-TR")} ₺
                                  </span>
                                </div>
                              );
                            }

                            // Diğer durumda sadece price'ı göster
                            return (
                              <span className="text-lg font-bold text-primary">
                                {price.toLocaleString("tr-TR")} ₺
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sonuç bulunamadı
                  </h3>
                  <p className="text-gray-600">
                    Aradığınız ürün bulunamadı. Farklı kelimeler
                    deneyebilirsiniz.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
