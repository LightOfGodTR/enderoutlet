import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Edit2, Save, Plus, X, Settings } from "lucide-react";

export function WarrantyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingWarranty, setEditingWarranty] = useState<any>(null);
  const [managingMappings, setManagingMappings] = useState<any>(null);
  const [newMapping, setNewMapping] = useState({ 
    productCategory: "", 
    productSubcategories: [] as string[] 
  });
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const { data: warranties = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/extended-warranty/categories"],
  });

  // Get warranty category mappings for the selected warranty
  const { data: mappings = [], isLoading: mappingsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/extended-warranty/categories", managingMappings?.categoryName, "mappings"],
    enabled: !!managingMappings?.categoryName,
  });

  // Get available product categories
  const { data: productCategories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/product-categories"],
  });

  const updateWarrantyMutation = useMutation({
    mutationFn: async ({ categoryName, updates }: { categoryName: string; updates: any }) => {
      return await apiRequest(`/api/admin/extended-warranty/categories/${encodeURIComponent(categoryName)}`, "PUT", updates);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Ek garanti fiyatları güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/extended-warranty/categories"] });
      setEditingWarranty(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Ek garanti fiyatları güncellenemedi", variant: "destructive" });
    },
  });

  const handleSave = (warranty: any) => {
    updateWarrantyMutation.mutate({
      categoryName: warranty.categoryName,
      updates: {
        twoYearPrice: parseFloat(warranty.twoYearPrice),
        fourYearPrice: parseFloat(warranty.fourYearPrice)
      }
    });
  };

  const addMappingMutation = useMutation({
    mutationFn: async ({ categoryName, productCategory, productSubcategory }: { categoryName: string; productCategory: string; productSubcategory?: string }) => {
      return await apiRequest(`/api/admin/extended-warranty/categories/${encodeURIComponent(categoryName)}/mappings`, "POST", {
        productCategory,
        productSubcategories: productSubcategory ? [productSubcategory] : ["ALL_SUBCATEGORIES"]
      });
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kategori eşleştirmesi eklendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/extended-warranty/categories", managingMappings?.categoryName, "mappings"] });
      setNewMapping({ productCategory: "", productSubcategories: [] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori eşleştirmesi eklenemedi", variant: "destructive" });
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: async (mappingId: string) => {
      return await apiRequest(`/api/admin/extended-warranty/mappings/${mappingId}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kategori eşleştirmesi silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/extended-warranty/categories", managingMappings?.categoryName, "mappings"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori eşleştirmesi silinemedi", variant: "destructive" });
    },
  });

  const handleAddMapping = () => {
    if (!newMapping.productCategory) {
      toast({ title: "Hata", description: "Lütfen bir kategori seçin", variant: "destructive" });
      return;
    }

    // Eğer hiç alt kategori seçilmemişse, tüm alt kategoriler için ekle
    const subcategoriesToAdd = newMapping.productSubcategories.length === 0 
      ? [undefined] // Tüm alt kategoriler için
      : newMapping.productSubcategories;

    // Her alt kategori için ayrı mapping ekle
    subcategoriesToAdd.forEach(subcategory => {
      addMappingMutation.mutate({
        categoryName: managingMappings.categoryName,
        productCategory: newMapping.productCategory,
        productSubcategory: subcategory === "ALL_SUBCATEGORIES" ? undefined : subcategory
      });
    });
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Ek Garanti Fiyat Yönetimi
        </CardTitle>
        <p className="text-sm text-gray-600">
          Her kategori için ek garanti fiyatlarını düzenleyebilirsiniz
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {warranties.map((warranty) => (
            <div key={warranty.categoryName} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-lg">{warranty.categoryName}</h3>
                  <p className="text-sm text-gray-600">Mevcut fiyatlar: 2 Yıl: {warranty.twoYearPrice}₺, 4 Yıl: {warranty.fourYearPrice}₺</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingWarranty({
                    categoryName: warranty.categoryName,
                    twoYearPrice: warranty.twoYearPrice.toString(),
                    fourYearPrice: warranty.fourYearPrice.toString()
                  })}
                  data-testid={`button-edit-warranty-${warranty.categoryName}`}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setManagingMappings({
                      categoryName: warranty.categoryName
                    });
                  }}
                  data-testid={`button-manage-mappings-${warranty.categoryName}`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Kategori Eşleştirme
                </Button>
              </div>
              
              {editingWarranty?.categoryName === warranty.categoryName && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label>2 Yıl Ek Garanti Fiyatı (₺)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingWarranty.twoYearPrice}
                      onChange={(e) => setEditingWarranty({
                        ...editingWarranty,
                        twoYearPrice: e.target.value
                      })}
                      data-testid={`input-warranty-2year-${warranty.categoryName}`}
                    />
                  </div>
                  <div>
                    <Label>4 Yıl Ek Garanti Fiyatı (₺)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingWarranty.fourYearPrice}
                      onChange={(e) => setEditingWarranty({
                        ...editingWarranty,
                        fourYearPrice: e.target.value
                      })}
                      data-testid={`input-warranty-4year-${warranty.categoryName}`}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <Button
                      onClick={() => handleSave(editingWarranty)}
                      disabled={updateWarrantyMutation.isPending}
                      size="sm"
                      data-testid={`button-save-warranty-${warranty.categoryName}`}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWarranty(null)}
                      data-testid={`button-cancel-warranty-${warranty.categoryName}`}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 Kategori Eşleştirme Bilgisi</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Ankastre kategorisi:</strong> Sadece ankastre fırınlar için ek garanti. Ankastre mikrodalga hariç.</p>
            <p>• <strong>Buzdolabı kategorileri:</strong> Üstten/Alttan Donduruculu → No-frost fiyatları kullanılır.</p>
            <p>• <strong>Klima kategorileri:</strong> Split, inverter, ısıtma soğutma → Ev Tipi Klima fiyatları kullanılır.</p>
            <p>• <strong>Mini kategoriler:</strong> Mini buzdolabı, mini fırın vb. → Ek garanti YOK.</p>
          </div>
        </div>

        {/* Kategori Eşleştirme Dialog */}
        {managingMappings && (
          <Dialog open={!!managingMappings} onOpenChange={() => setManagingMappings(null)}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white border-2 shadow-2xl" style={{ zIndex: 9999 }}>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {managingMappings.categoryName} - Kategori Eşleştirmesi
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Bu ek garanti hangi ürün kategorilerini kapsayacak?
                </p>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Mevcut Eşleştirmeler */}
                <div>
                  <h4 className="font-medium mb-2">Mevcut Eşleştirmeler</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mappingsLoading ? (
                      <div>Yükleniyor...</div>
                    ) : mappings.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">Henüz eşleştirme eklenmemiş</div>
                    ) : (
                      mappings.map((mapping: any) => (
                        <div key={mapping.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{mapping.productCategory}</Badge>
                            {mapping.productSubcategory && (
                              <Badge variant="secondary">{mapping.productSubcategory}</Badge>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMappingMutation.mutate(mapping.id)}
                            disabled={deleteMappingMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Yeni Eşleştirme Ekle */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Yeni Eşleştirme Ekle</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Ana Kategori *</Label>
                      <Popover open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryDropdownOpen}
                            className="w-full justify-between"
                          >
                            {newMapping.productCategory 
                              ? productCategories.find((cat: any) => cat.category === newMapping.productCategory)?.category
                              : "Kategori seçin"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start" style={{ zIndex: 10000 }}>
                          <Command>
                            <CommandInput placeholder="Kategori ara..." />
                            <CommandEmpty>Kategori bulunamadı.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {categoriesLoading ? (
                                <CommandItem disabled>Yükleniyor...</CommandItem>
                              ) : productCategories.length === 0 ? (
                                <CommandItem disabled>Kategori bulunamadı</CommandItem>
                              ) : (
                                productCategories.map((cat: any) => (
                                  <CommandItem
                                    key={cat.category}
                                    value={cat.category}
                                    onSelect={(currentValue) => {
                                      setNewMapping({
                                        ...newMapping,
                                        productCategory: currentValue,
                                        productSubcategories: []
                                      });
                                      setCategoryDropdownOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        newMapping.productCategory === cat.category ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {cat.category} ({cat.subcategories?.length || 0} alt kategori)
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 mt-1">
                        {productCategories.length} kategori mevcut
                      </p>
                    </div>

                    <div>
                      <Label>Alt Kategoriler (Çoklu Seçim)</Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                        {!newMapping.productCategory ? (
                          <p className="text-sm text-gray-500 italic">Önce ana kategori seçin</p>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="all-subcategories"
                                checked={newMapping.productSubcategories.includes("ALL_SUBCATEGORIES")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewMapping({
                                      ...newMapping,
                                      productSubcategories: ["ALL_SUBCATEGORIES"]
                                    });
                                  } else {
                                    setNewMapping({
                                      ...newMapping,
                                      productSubcategories: newMapping.productSubcategories.filter(s => s !== "ALL_SUBCATEGORIES")
                                    });
                                  }
                                }}
                              />
                              <label htmlFor="all-subcategories" className="text-sm font-medium">
                                Tüm alt kategoriler
                              </label>
                            </div>
                            {productCategories
                              .find((cat: any) => cat.category === newMapping.productCategory)
                              ?.subcategories?.map((subcat: string) => (
                                <div key={subcat} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`subcat-${subcat}`}
                                    checked={newMapping.productSubcategories.includes(subcat)}
                                    disabled={newMapping.productSubcategories.includes("ALL_SUBCATEGORIES")}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewMapping({
                                          ...newMapping,
                                          productSubcategories: [...newMapping.productSubcategories.filter(s => s !== "ALL_SUBCATEGORIES"), subcat]
                                        });
                                      } else {
                                        setNewMapping({
                                          ...newMapping,
                                          productSubcategories: newMapping.productSubcategories.filter(s => s !== subcat)
                                        });
                                      }
                                    }}
                                  />
                                  <label htmlFor={`subcat-${subcat}`} className="text-sm">
                                    {subcat}
                                  </label>
                                </div>
                              ))}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={handleAddMapping}
                        disabled={addMappingMutation.isPending || !newMapping.productCategory}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {newMapping.productSubcategories.length === 0 
                          ? "Tüm Alt Kategoriler İçin Ekle" 
                          : newMapping.productSubcategories.includes("ALL_SUBCATEGORIES")
                            ? "Tüm Alt Kategoriler İçin Ekle"
                            : `Seçili ${newMapping.productSubcategories.length} Alt Kategoriyi Ekle`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}