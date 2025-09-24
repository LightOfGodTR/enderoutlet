import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Image as ImageIcon, 
  FileText, 
  Package, 
  Menu, 
  Percent,
  Save,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Star,
  Eye,
  CreditCard,
  Building2,
  Shield,
  ShieldCheck,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  X,
  Search,
  BookOpen,
  Link,
  RotateCcw,
  Banknote,
  BarChart3
} from "lucide-react";
import Header from "@/components/header";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HomepageSections from "@/pages/admin/homepage-sections";
import SliderManagement from "@/pages/admin/slider-management";
import VirtualPosManagement from "@/pages/admin/virtual-pos-management";
import { WarrantyManagement } from "@/components/warranty-management";
import ProductImageUploader from '@/components/ProductImageUploader';
import ProductForm from '@/components/ProductForm';
import { UniversalImageUploader, IMAGE_SPECS } from "@/components/UniversalImageUploader";
import CategoryIconsManagement from '@/components/CategoryIconsManagement';
import ProductCardsManagement from './admin/product-cards-management';
import BlogSliderManagement from '@/components/blog-slider-management';
import FooterLinksManagement from './admin/footer-links-management';
import ReturnsManagement from './admin/returns-management';
import PaymentMethodsManagement from './admin/payment-methods-management';
import Statistics from './admin/statistics';
import PopularSearchesManagement from './admin/popular-searches';
import CategoryBannerManagement from './admin/category-banner-management';

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("slider");

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== "admin")) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation, isLoading]);

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (!isAuthenticated || (user as any)?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Website içerik ve ürün yönetimi</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 2xl:grid-cols-13 w-full gap-1 h-auto p-1">
            <TabsTrigger value="slider" className="text-xs p-2">Slider Yönetimi</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs p-2">Kategori Yönetimi</TabsTrigger>
            <TabsTrigger value="category-icons" className="text-xs p-2">Kategori İkonları</TabsTrigger>
            <TabsTrigger value="category-banners" className="text-xs p-2 flex items-center gap-1"><ImageIcon className="w-3 h-3" />Kategori Banner</TabsTrigger>
            <TabsTrigger value="homepage" className="text-xs p-2">Ana Sayfa Ürünleri</TabsTrigger>
            <TabsTrigger value="product-cards" className="text-xs p-2">Ürün Kartları</TabsTrigger>
            <TabsTrigger value="products" className="text-xs p-2">Ürün Yönetimi</TabsTrigger>
            <TabsTrigger value="warranties" className="text-xs p-2">Ek Garanti</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs p-2">Sipariş Yönetimi</TabsTrigger>
            <TabsTrigger value="returns" className="text-xs p-2 flex items-center gap-1"><RotateCcw className="w-3 h-3" />İade Yönetimi</TabsTrigger>
            <TabsTrigger value="support" className="text-xs p-2">Destek Talepleri</TabsTrigger>
            <TabsTrigger value="contact-messages" className="text-xs p-2">İletişim Mesajları</TabsTrigger>
            <TabsTrigger value="navigation" className="text-xs p-2">Navigasyon</TabsTrigger>
            <TabsTrigger value="coupons" className="text-xs p-2">İndirim Kuponları</TabsTrigger>
            <TabsTrigger value="virtual-pos" className="text-xs p-2">Sanal POS</TabsTrigger>
            <TabsTrigger value="payment-methods" className="text-xs p-2 flex items-center gap-1"><Banknote className="w-3 h-3" />Ödeme Yöntemleri</TabsTrigger>
            <TabsTrigger value="commission-rates" className="text-xs p-2 flex items-center gap-1"><CreditCard className="w-3 h-3" />Komisyon Oranları</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs p-2">Kampanya Yönetimi</TabsTrigger>
            <TabsTrigger value="corporate" className="text-xs p-2">Kurumsal İçerik</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs p-2 flex items-center gap-1"><Search className="w-3 h-3" />SEO Yönetimi</TabsTrigger>
            <TabsTrigger value="popular-searches" className="text-xs p-2 flex items-center gap-1"><Search className="w-3 h-3" />Popüler Aramalar</TabsTrigger>
            <TabsTrigger value="blog" className="text-xs p-2 flex items-center gap-1"><BookOpen className="w-3 h-3" />Blog Yönetimi</TabsTrigger>
            <TabsTrigger value="blog-slider" className="text-xs p-2 flex items-center gap-1"><ImageIcon className="w-3 h-3" />Blog Slider</TabsTrigger>
            <TabsTrigger value="footer-links" className="text-xs p-2 flex items-center gap-1"><Link className="w-3 h-3" />Footer Links</TabsTrigger>
            <TabsTrigger value="statistics" className="text-xs p-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" />İstatistikler</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs p-2">Genel Ayarlar</TabsTrigger>
          </TabsList>

          {/* Ana Sayfa Slider Yönetimi */}
          <TabsContent value="slider" className="space-y-6">
            <SliderManagement />
          </TabsContent>

          {/* Kategoriler Yönetimi */}
          <TabsContent value="categories" className="space-y-6">
            <CategoryManagement />
          </TabsContent>

          {/* Kategori İkonları Yönetimi */}
          <TabsContent value="category-icons" className="space-y-6">
            <CategoryIconsManagement />
          </TabsContent>

          {/* Kategori Banner Yönetimi */}
          <TabsContent value="category-banners" className="space-y-6">
            <CategoryBannerManagement />
          </TabsContent>

          {/* Ana Sayfa Ürünleri */}
          <TabsContent value="homepage" className="space-y-6">
            <HomepageSections />
          </TabsContent>

          {/* Ürün Kartları */}
          <TabsContent value="product-cards" className="space-y-6">
            <ProductCardsManagement />
          </TabsContent>

          {/* Ürün Yönetimi */}
          <TabsContent value="products" className="space-y-6">
            <ProductManagement />
          </TabsContent>

          {/* Ek Garanti Yönetimi */}
          <TabsContent value="warranties" className="space-y-6">
            <WarrantyManagement />
          </TabsContent>

          {/* Destek Talepleri */}
          <TabsContent value="support" className="space-y-6">
            <SupportTicketManagement />
          </TabsContent>

          {/* İletişim Mesajları Yönetimi */}
          <TabsContent value="contact-messages" className="space-y-6">
            <ContactMessagesManagement />
          </TabsContent>

          {/* Navigasyon Yönetimi */}
          <TabsContent value="navigation" className="space-y-6">
            <NavigationManagement />
          </TabsContent>

          {/* Sipariş Yönetimi */}
          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          {/* İade Yönetimi */}
          <TabsContent value="returns" className="space-y-6">
            <ReturnsManagement />
          </TabsContent>

          {/* İndirim Kuponları */}
          <TabsContent value="coupons" className="space-y-6">
            <CouponManagement />
          </TabsContent>

          {/* Sanal POS Yönetimi */}
          <TabsContent value="virtual-pos" className="space-y-6">
            <VirtualPosManagement />
          </TabsContent>

          {/* Ödeme Yöntemleri */}
          <TabsContent value="payment-methods" className="space-y-6">
            <PaymentMethodsManagement />
          </TabsContent>

          {/* Komisyon Oranları */}
          <TabsContent value="commission-rates" className="space-y-6">
            <CommissionRatesManagement />
          </TabsContent>

          {/* Kampanya Yönetimi */}
          <TabsContent value="campaigns" className="space-y-6">
            <CampaignManagement />
          </TabsContent>

          {/* Kurumsal İçerik */}
          <TabsContent value="corporate" className="space-y-6">
            <CorporateContentManagement />
          </TabsContent>

          {/* Genel Ayarlar */}
          {/* SEO Yönetimi */}
          <TabsContent value="seo" className="space-y-6">
            <SeoManagement />
          </TabsContent>

          {/* Popüler Aramalar Yönetimi */}
          <TabsContent value="popular-searches" className="space-y-6">
            <PopularSearchesManagement />
          </TabsContent>

          {/* Blog Yönetimi */}
          <TabsContent value="blog" className="space-y-6">
            <BlogManagement />
          </TabsContent>

          {/* Blog Slider Yönetimi */}
          <TabsContent value="blog-slider" className="space-y-6">
            <BlogSliderManagement />
          </TabsContent>

          {/* Footer Links Yönetimi */}
          <TabsContent value="footer-links" className="space-y-6">
            <FooterLinksManagement />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <Statistics />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <GeneralSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CategoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/categories"],
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/categories/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kategori güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setEditingCategory(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori güncellenemedi", variant: "destructive" });
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest("/api/admin/categories", "POST", categoryData);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kategori eklendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori eklenemedi", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/categories/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kategori silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kategori silinemedi", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Kategori Yönetimi</span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Kategori Ekle</DialogTitle>
              </DialogHeader>
              <CategoryForm 
                onSubmit={(data: any) => addCategoryMutation.mutate(data)}
                onCancel={() => setIsAddDialogOpen(false)}
                isLoading={addCategoryMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(categories as any[]).map((category: any) => (
            <Card key={category.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingCategory(category)}>
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteCategoryMutation.mutate(category.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {category.subcategories?.length || 0} alt kategori
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kategori Düzenle</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              initialData={editingCategory}
              onSubmit={(data: any) => updateCategoryMutation.mutate({ id: editingCategory.id, updates: data })}
              onCancel={() => setEditingCategory(null)}
              isLoading={updateCategoryMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function CategoryForm({ initialData, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    icon: initialData?.icon || "📦",
    subcategories: initialData?.subcategories || [],
  });
  const [newSubcategory, setNewSubcategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSubcategory = () => {
    if (newSubcategory.trim()) {
      setFormData({
        ...formData,
        subcategories: [...formData.subcategories, newSubcategory.trim()]
      });
      setNewSubcategory("");
    }
  };

  const removeSubcategory = (index: number) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Kategori Adı</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Kategori adı"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>İkon</Label>
        <Input
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="🏠"
          maxLength={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Alt Kategoriler</Label>
        <div className="flex gap-2">
          <Input
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="Alt kategori ekle"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
          />
          <Button type="button" onClick={addSubcategory}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData.subcategories.map((sub: string, index: number) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {sub}
              <button
                type="button"
                onClick={() => removeSubcategory(index)}
                className="ml-1 text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}





function NavigationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: navigationItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/navigation"],
  });

  const updateNavigationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/navigation/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Navigasyon güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/navigation"] });
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Navigasyon güncellenemedi", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigasyon Yönetimi</CardTitle>
        <CardDescription>Header menü öğelerini düzenleyin</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {navigationItems.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Aktif" : "Pasif"}
                </Badge>
                <span className="font-medium">{item.label}</span>
                <span className="text-sm text-gray-500">{item.path}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                <Edit3 className="h-4 w-4 mr-1" />
                Düzenle
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Navigation Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Navigasyon Öğesi Düzenle</DialogTitle>
            </DialogHeader>
            <NavigationForm 
              initialData={editingItem}
              onSubmit={(data: any) => updateNavigationMutation.mutate({ id: editingItem.id, updates: data })}
              onCancel={() => setEditingItem(null)}
              isLoading={updateNavigationMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function NavigationForm({ initialData, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    label: initialData?.label || "",
    path: initialData?.path || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Menü Adı</Label>
        <Input
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Menü adı"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>URL Yolu</Label>
        <Input
          value={formData.path}
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
          placeholder="/path"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <Label htmlFor="isActive">Aktif</Label>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

// Bölüm Yazıları Yönetimi
function SectionManagement() {
  const sections = [
    { id: "features", name: "Özellik Kartları", description: "4 özellik kartının başlık ve açıklamaları" },
    { id: "popular", name: "Popüler Ürünler", description: "En popüler ürünler bölümü yazıları" },
    { id: "campaign", name: "Kampanya Bölümü", description: "Kırmızı kampanya bölümü yazıları" },
    { id: "newproducts", name: "Yeni Ürünler", description: "Son çıkan ürünler bölümü yazıları" }
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {section.name}
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ana Başlık</Label>
                <Input placeholder="Başlık giriniz..." />
              </div>
              <div className="space-y-2">
                <Label>Alt Başlık</Label>
                <Input placeholder="Alt başlık giriniz..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea placeholder="Bölüm açıklaması..." rows={3} />
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Ürün Yönetimi
function ProductManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [filters, setFilters] = useState({
    category: "all",
    stockStatus: "all", // "inStock" | "outOfStock" | "all"
    discountStatus: "all", // "discounted" | "regular" | "all"
    search: ""
  });
  const wsRef = useRef<WebSocket | null>(null);

  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/categories"],
  });

  // Filter products based on active filters
  const filteredProducts = products.filter((product: any) => {
    // Category filter
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }
    
    // Stock status filter
    if (filters.stockStatus === "inStock" && !product.inStock) {
      return false;
    }
    if (filters.stockStatus === "outOfStock" && product.inStock) {
      return false;
    }
    
    // Discount status filter
    if (filters.discountStatus === "discounted" && (!product.discount || product.discount <= 0)) {
      return false;
    }
    if (filters.discountStatus === "regular" && product.discount > 0) {
      return false;
    }
    
    // Search filter
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: "all",
      stockStatus: "all",
      discountStatus: "all",
      search: ""
    });
  };

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connected for real-time product updates');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        
        if (message.type === 'PRODUCT_UPDATED') {
          // Update both admin and general product queries immediately
          queryClient.setQueryData(["/api/admin/products"], (oldData: any[]) => {
            if (!oldData) return oldData;
            return oldData.map(product => 
              product.id === message.data.id ? { ...product, ...message.data } : product
            );
          });
          
          queryClient.setQueryData(["/api/products"], (oldData: any[]) => {
            if (!oldData) return oldData;
            return oldData.map(product => 
              product.id === message.data.id ? { ...product, ...message.data } : product
            );
          });
          
          // Update editingProduct state if the updated product is currently being edited
          if (editingProduct && editingProduct.id === message.data.id) {
            setEditingProduct((prev: any) => ({ ...prev, ...message.data }));
          }
          
          // Only show toast if this update is from another user (not current user)
          const isFromCurrentUser = editingProduct && editingProduct.id === message.data.id;
          if (!isFromCurrentUser) {
            toast({
              title: "Ürün Güncellendi!",
              description: `${message.data.name} ürünü başka bir yönetici tarafından güncellendi.`,
              duration: 3000,
            });
          }
        }
        
        if (message.type === 'PRODUCT_CREATED') {
          // Add the new product to local state
          queryClient.setQueryData(["/api/admin/products"], (oldData: any[]) => {
            return oldData ? [...oldData, message.data] : [message.data];
          });
          
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          
          toast({
            title: "Yeni Ürün Eklendi!",
            description: `${message.data.name} ürünü başka bir yönetici tarafından eklendi.`,
            duration: 3000,
          });
        }
        
        if (message.type === 'PRODUCT_DELETED') {
          // Remove the product from local state
          queryClient.setQueryData(["/api/admin/products"], (oldData: any[]) => {
            if (!oldData) return oldData;
            return oldData.filter(product => product.id !== message.data.id);
          });
          
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          
          toast({
            title: "Ürün Silindi!",
            description: `${message.data.product.name} ürünü başka bir yönetici tarafından silindi.`,
            duration: 3000,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [queryClient, toast, editingProduct]);

  const addProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/products", "POST", data);
    },
    onSuccess: (newProduct) => {
      toast({ title: "Başarılı!", description: "Ürün eklendi" });
      
      // Add the new product to the local state immediately
      queryClient.setQueryData(["/api/admin/products"], (oldData: any[]) => {
        return oldData ? [...oldData, newProduct] : [newProduct];
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Ürün eklenemedi", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/products/${id}`, "PATCH", updates);
    },
    onSuccess: (data, variables) => {
      console.log("Product update success:", data, variables);
      toast({ title: "Başarılı!", description: "Ürün güncellendi!" });
      
      // Close the edit dialog immediately after successful update
      setEditingProduct(null);
      
      // Immediately update local state for instant feedback
      queryClient.setQueryData(["/api/admin/products"], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(product => 
          product.id === variables.id ? { ...product, ...data } : product
        );
      });
      
      // Also update the general products query
      queryClient.setQueryData(["/api/products"], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(product => 
          product.id === variables.id ? { ...product, ...data } : product
        );
      });
      
      setEditingProduct(null);
    },
    onError: (error) => {
      console.error("Product update error:", error);
      toast({ title: "Hata", description: "Ürün güncellenemedi", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/products/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Ürün silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Ürün silinemedi", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ürün Yönetimi
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Ürün Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl h-[95vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                  <ProductForm 
                    categories={categories}
                    onSubmit={(data: any) => addProductMutation.mutate(data)}
                    onCancel={() => setIsAddDialogOpen(false)}
                    isLoading={addProductMutation.isPending}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Ürün ekleme, düzenleme ve silme işlemleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Filter */}
                <div className="space-y-2">
                  <Label htmlFor="search">Ürün Ara</Label>
                  <Input
                    id="search"
                    placeholder="Ürün adı ile ara..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Status Filter */}
                <div className="space-y-2">
                  <Label>Stok Durumu</Label>
                  <Select
                    value={filters.stockStatus}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, stockStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Stok durumu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="inStock">Stokta Var</SelectItem>
                      <SelectItem value="outOfStock">Stok Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Status Filter */}
                <div className="space-y-2">
                  <Label>İndirim Durumu</Label>
                  <Select
                    value={filters.discountStatus}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, discountStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="İndirim durumu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="discounted">İndirimli</SelectItem>
                      <SelectItem value="regular">Normal Fiyat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  disabled={filters.category === "all" && filters.stockStatus === "all" && filters.discountStatus === "all" && !filters.search}
                >
                  <X className="h-4 w-4 mr-2" />
                  Filtreleri Temizle
                </Button>
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} ürün gösteriliyor ({products.length} toplam)
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Mevcut Ürünler</h3>
                <p className="text-sm text-gray-600">{filteredProducts.length} ürün gösteriliyor</p>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {products.length === 0 ? "Henüz ürün eklenmemiş" : "Filtreye uygun ürün bulunamadı"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {products.length === 0 ? "İlk ürününüzü ekleyerek başlayın" : "Farklı filtre seçenekleri deneyin"}
                </p>
                {products.length > 0 && (
                  <Button variant="outline" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Tüm Filtreleri Temizle
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-lg divide-y">
                {filteredProducts.map((product: any) => (
                  <div key={product.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-600">
                              {product.category} • {product.price} ₺
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                        <div className="flex gap-2">
                          {product.discount > 0 && (
                            <Badge variant="destructive">
                              %{product.discount} İndirim
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Düzenle
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Ürün Düzenle</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <ProductForm 
                initialData={editingProduct}
                categories={categories}
                onSubmit={(data: any) => updateProductMutation.mutate({ id: editingProduct.id, updates: data })}
                onCancel={() => setEditingProduct(null)}
                isLoading={updateProductMutation.isPending}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


// Sipariş Yönetimi
function OrderManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/admin/orders/${id}/status`, "PUT", { status });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Sipariş durumu güncellendi."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setEditingOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Sipariş durumu güncellenemedi.",
        variant: "destructive"
      });
    },
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Ödeme Bekleniyor', color: 'bg-red-100 text-red-800', icon: '💳' };
      case 'preparing':
        return { label: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case 'ready_to_ship':
        return { label: 'Çıkışa Hazır', color: 'bg-blue-100 text-blue-800', icon: '📦' };
      case 'shipped':
        return { label: 'Kargoya Teslim Edildi', color: 'bg-orange-100 text-orange-800', icon: '🚚' };
      case 'in_transit':
        return { label: 'Kargodan Çıktı', color: 'bg-purple-100 text-purple-800', icon: '🚛' };
      case 'delivered':
        return { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'cancelled':
        return { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { label: 'Hazırlanıyor', color: 'bg-gray-100 text-gray-800', icon: '⏳' };
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Ödeme Bekleniyor' },
    { value: 'preparing', label: 'Hazırlanıyor' },
    { value: 'ready_to_ship', label: 'Çıkışa Hazır' },
    { value: 'shipped', label: 'Kargoya Teslim Edildi' },
    { value: 'in_transit', label: 'Kargodan Çıktı' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'cancelled', label: 'İptal Edildi' },
  ];

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-2 text-gray-600">Siparişler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sipariş Yönetimi
          </CardTitle>
          <CardDescription>
            Siparişlerin durumunu yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Henüz sipariş bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Sipariş #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString('tr-TR')} • {parseFloat(order.totalAmount).toLocaleString('tr-TR')} ₺
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon} {statusInfo.label}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingOrder(order)}
                          >
                            Düzenle
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p><strong>Müşteri:</strong> {order.user?.firstName} {order.user?.lastName}</p>
                          <p><strong>Ödeme Durumu:</strong> {order.paymentStatus === 'completed' ? 'Tamamlandı' : 'Bekliyor'}</p>
                        </div>
                        <div>
                          <p><strong>Ödeme Yöntemi:</strong></p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentMethod === 'bank-transfer' 
                              ? 'bg-blue-100 text-blue-800'
                              : order.paymentMethod === 'virtual-pos' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.paymentMethod === 'bank-transfer' ? '💰 Havale/EFT' : 
                             order.paymentMethod === 'virtual-pos' ? '💳 Sanal POS' :
                             order.paymentMethod === 'credit-card' ? '💳 Kredi Kartı' : order.paymentMethod}
                          </span>
                        </div>
                        <div>
                          <p><strong>Adres:</strong></p>
                          <p className="text-xs text-gray-600 mt-1">
                            {order.shippingAddress.split('\n')[0]}
                          </p>
                        </div>
                      </div>
                      
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium mb-2">Sipariş Detayları:</p>
                          <div className="space-y-2">
                            {order.items.slice(0, 3).map((item: any, index: number) => (
                              <div key={item.id || index} className="flex items-center gap-3 text-sm">
                                <img
                                  src={item.product?.image}
                                  alt={item.product?.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{item.product?.name}</p>
                                  <p className="text-gray-600">{item.quantity} adet × {parseFloat(item.price).toLocaleString('tr-TR')} ₺</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-gray-500">+{order.items.length - 3} ürün daha</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Order Status Dialog */}
      {editingOrder && (
        <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sipariş Durumunu Güncelle</DialogTitle>
              <DialogDescription>
                Sipariş #{editingOrder.orderNumber} durumunu değiştirin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Mevcut Durum</Label>
                <div className="mt-1">
                  <Badge className={getStatusInfo(editingOrder.status).color}>
                    {getStatusInfo(editingOrder.status).label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Yeni Durum</Label>
                <Select
                  defaultValue={editingOrder.status}
                  onValueChange={(value) => {
                    updateOrderStatusMutation.mutate({
                      id: editingOrder.id,
                      status: value
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <TrackingCodeSection order={editingOrder} />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingOrder(null)}>
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Kargo Takip Kodu Yönetimi Bileşeni
function TrackingCodeSection({ order }: { order: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTrackingCodeMutation = useMutation({
    mutationFn: async ({ id, trackingCode }: { id: string; trackingCode: string }) => {
      return await apiRequest(`/api/admin/orders/${id}/tracking`, "PUT", { trackingCode });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Kargo takip kodu güncellendi."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Kargo takip kodu güncellenemedi.",
        variant: "destructive"
      });
      setIsUpdating(false);
    },
  });

  const handleUpdate = () => {
    if (trackingCode.trim()) {
      setIsUpdating(true);
      updateTrackingCodeMutation.mutate({
        id: order.id,
        trackingCode: trackingCode.trim()
      });
    }
  };

  return (
    <div className="space-y-3 border-t pt-4">
      <Label>🚛 Kargo Takip Kodu</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Kargo takip numarasını girin"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleUpdate}
          disabled={!trackingCode.trim() || isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
      
      {order.trackingCode ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✅ <strong>Mevcut Takip Kodu:</strong> {order.trackingCode}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Müşteri bu kod ile kargo durumunu takip edebilir.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            ⚠️ Henüz kargo takip kodu girilmedi.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Sipariş kargoya verildiğinde takip kodunu buraya girin.
          </p>
        </div>
      )}
    </div>
  );
}

// İndirim Kuponları Yönetimi
function CouponManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const { data: coupons = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/admin/coupons"],
  });

  // API boş object döndürürse array'e çevir
  const couponArray = Array.isArray(coupons) ? coupons : [];

  const [couponForm, setCouponForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    validFrom: "",
    validUntil: "",
    isActive: true
  });

  const createCouponMutation = useMutation({
    mutationFn: async (coupon: any) => {
      return await apiRequest("/api/admin/coupons", "POST", coupon);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kupon oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Hata!", description: error.message, variant: "destructive" });
    }
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/coupons/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kupon güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setEditingCoupon(null);
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Hata!", description: error.message, variant: "destructive" });
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/coupons/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kupon silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
    onError: (error: any) => {
      toast({ title: "Hata!", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setCouponForm({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minOrderAmount: "",
      maxDiscount: "",
      usageLimit: "",
      validFrom: "",
      validUntil: "",
      isActive: true
    });
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, updates: couponForm });
    } else {
      createCouponMutation.mutate(couponForm);
    }
  };

  const startEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      usageLimit: coupon.usageLimit || "",
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
      isActive: coupon.isActive
    });
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>İndirim Kuponları</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              İndirim Kuponları
            </span>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Kupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon ? "Kuponu Düzenle" : "Yeni Kupon Oluştur"}
                  </DialogTitle>
                  <DialogDescription>
                    Müşterileriniz için indirim kuponları oluşturun
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Kupon Kodu</Label>
                      <Input
                        id="code"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        placeholder="INDIRIM25"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Kupon Adı</Label>
                      <Input
                        id="name"
                        value={couponForm.name}
                        onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                        placeholder="25% İndirim"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={couponForm.description}
                      onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      placeholder="Kupon açıklaması"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">İndirim Türü</Label>
                      <select
                        id="type"
                        value={couponForm.type}
                        onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="percentage">Yüzde (%)</option>
                        <option value="fixed_amount">Sabit Tutar (₺)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="value">
                        İndirim Değeri {couponForm.type === 'percentage' ? '(%)' : '(₺)'}
                      </Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={couponForm.value}
                        onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDiscount">Maks. İndirim (₺)</Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        step="0.01"
                        value={couponForm.maxDiscount}
                        onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                        placeholder="Sınırsız"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minOrderAmount">Min. Sipariş Tutarı (₺)</Label>
                      <Input
                        id="minOrderAmount"
                        type="number"
                        step="0.01"
                        value={couponForm.minOrderAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="usageLimit">Kullanım Limiti</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        value={couponForm.usageLimit}
                        onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                        placeholder="Sınırsız"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Geçerli Başlangıç</Label>
                      <Input
                        id="validFrom"
                        type="datetime-local"
                        value={couponForm.validFrom}
                        onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="validUntil">Son Geçerlilik</Label>
                      <Input
                        id="validUntil"
                        type="datetime-local"
                        value={couponForm.validUntil}
                        onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                    />
                    <Label htmlFor="isActive">Aktif</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={createCouponMutation.isPending || updateCouponMutation.isPending}>
                      {editingCoupon ? "Güncelle" : "Oluştur"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {couponArray.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz kupon oluşturulmamış</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Kod</th>
                      <th className="text-left py-2">Ad</th>
                      <th className="text-left py-2">İndirim</th>
                      <th className="text-left py-2">Kullanım</th>
                      <th className="text-left py-2">Durum</th>
                      <th className="text-left py-2">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponArray.map((coupon) => (
                      <tr key={coupon.id} className="border-b">
                        <td className="py-2 font-mono font-semibold">{coupon.code}</td>
                        <td className="py-2">{coupon.name}</td>
                        <td className="py-2">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `${parseFloat(coupon.value).toLocaleString('tr-TR')} ₺`}
                        </td>
                        <td className="py-2">
                          {coupon.usageLimit > 0 ? `${coupon.usedCount}/${coupon.usageLimit}` : `${coupon.usedCount}/∞`}
                        </td>
                        <td className="py-2">
                          <Badge variant={coupon.isActive ? "default" : "secondary"}>
                            {coupon.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(coupon)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCouponMutation.mutate(coupon.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Genel Ayarlar
function GeneralSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings from API
  const { data: settings, isLoading: isLoadingSettings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
  });

  const [formData, setFormData] = useState({
    siteTitle: "",
    siteDescription: "",
    companyAddress: "",
    contactPhone: "",
    contactEmail: "",
    instagramUrl: "",
    whatsappUrl: ""
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        siteTitle: settings.siteTitle || "",
        siteDescription: settings.siteDescription || "",
        companyAddress: settings.companyAddress || "",
        contactPhone: settings.contactPhone || "",
        contactEmail: settings.contactEmail || "",
        instagramUrl: settings.instagramUrl || "",
        whatsappUrl: settings.whatsappUrl || ""
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/settings", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Genel ayarlar başarıyla güncellendi."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Hata!",
        description: "Ayarlar güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    },
  });

  const handleSave = async () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Genel Ayarlar
          </CardTitle>
          <CardDescription>
            Website genel ayarları ve meta bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Başlığı</Label>
              <Input 
                value={formData.siteTitle}
                onChange={(e) => handleInputChange('siteTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Site Açıklaması</Label>
              <Input 
                value={formData.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Firma Adresi</Label>
            <Textarea 
              value={formData.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              rows={3} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>İletişim Telefonu</Label>
              <Input 
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>E-posta Adresi</Label>
              <Input 
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                type="email"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Sosyal Medya</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input 
                  value={formData.instagramUrl}
                  onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/hesabiniz"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp URL</Label>
                <Input 
                  value={formData.whatsappUrl}
                  onChange={(e) => handleInputChange('whatsappUrl', e.target.value)}
                  placeholder="https://wa.me/905551234567"
                  type="url"
                />
              </div>
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CorporateContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content, isLoading: isLoadingContent } = useQuery<any>({
    queryKey: ["/api/admin/corporate-content"],
  });

  const updateContentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/corporate-content", "PUT", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kurumsal içerik güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/corporate-content"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "İçerik güncellenemedi", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updates = {
      pageTitle: formData.get("pageTitle"),
      pageSubtitle: formData.get("pageSubtitle"),
      stat1Value: formData.get("stat1Value"),
      stat1Label: formData.get("stat1Label"),
      stat2Value: formData.get("stat2Value"),
      stat2Label: formData.get("stat2Label"),
      stat3Value: formData.get("stat3Value"),
      stat3Label: formData.get("stat3Label"),
      stat4Value: formData.get("stat4Value"),
      stat4Label: formData.get("stat4Label"),
      aboutTitle: formData.get("aboutTitle"),
      aboutParagraph1: formData.get("aboutParagraph1"),
      aboutParagraph2: formData.get("aboutParagraph2"),
      missionTitle: formData.get("missionTitle"),
      missionText: formData.get("missionText"),
      visionTitle: formData.get("visionTitle"),
      visionText: formData.get("visionText"),
      contactTitle: formData.get("contactTitle"),
      contactSubtitle: formData.get("contactSubtitle"),
    };

    updateContentMutation.mutate(updates);
  };

  if (isLoadingContent) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kurumsal İçerik Yönetimi</CardTitle>
        <CardDescription>
          Kurumsal sayfa içeriklerini düzenleyin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Sayfa Başlığı */}
          <div className="space-y-2">
            <Label htmlFor="pageTitle">Sayfa Başlığı</Label>
            <Input
              id="pageTitle"
              name="pageTitle"
              defaultValue={content?.pageTitle || ""}
              placeholder="Arçelik Hakkında"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageSubtitle">Sayfa Alt Başlığı</Label>
            <Textarea
              id="pageSubtitle"
              name="pageSubtitle"
              defaultValue={content?.pageSubtitle || ""}
              placeholder="Sayfa açıklama metni"
              rows={3}
            />
          </div>

          {/* İstatistikler */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İstatistikler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>İstatistik 1 Değeri</Label>
                <Input name="stat1Value" defaultValue={content?.stat1Value || ""} placeholder="70+" />
              </div>
              <div className="space-y-2">
                <Label>İstatistik 1 Etiketi</Label>
                <Input name="stat1Label" defaultValue={content?.stat1Label || ""} placeholder="Yıllık Deneyim" />
              </div>
              <div className="space-y-2">
                <Label>İstatistik 2 Değeri</Label>
                <Input name="stat2Value" defaultValue={content?.stat2Value || ""} placeholder="30M+" />
              </div>
              <div className="space-y-2">
                <Label>İstatistik 2 Etiketi</Label>
                <Input name="stat2Label" defaultValue={content?.stat2Label || ""} placeholder="Memnun Müşteri" />
              </div>
              <div className="space-y-2">
                <Label>İstatistik 3 Değeri</Label>
                <Input name="stat3Value" defaultValue={content?.stat3Value || ""} placeholder="50+" />
              </div>
              <div className="space-y-2">
                <Label>İstatistik 3 Etiketi</Label>
                <Input name="stat3Label" defaultValue={content?.stat3Label || ""} placeholder="Ülkede Hizmet" />
              </div>
              <div className="space-y-2">
                <Label>İstatistik 4 Değeri</Label>
                <Input name="stat4Value" defaultValue={content?.stat4Value || ""} placeholder="100+" />
              </div>
              <div className="space-y-2">
                <Label>İstatistik 4 Etiketi</Label>
                <Input name="stat4Label" defaultValue={content?.stat4Label || ""} placeholder="Ürün Çeşidi" />
              </div>
            </div>
          </div>

          {/* Hakkımızda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hakkımızda Bölümü</h3>
            <div className="space-y-2">
              <Label htmlFor="aboutTitle">Başlık</Label>
              <Input
                id="aboutTitle"
                name="aboutTitle"
                defaultValue={content?.aboutTitle || ""}
                placeholder="Hikayemiz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutParagraph1">1. Paragraf</Label>
              <Textarea
                id="aboutParagraph1"
                name="aboutParagraph1"
                defaultValue={content?.aboutParagraph1 || ""}
                placeholder="İlk paragraf metni"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutParagraph2">2. Paragraf</Label>
              <Textarea
                id="aboutParagraph2"
                name="aboutParagraph2"
                defaultValue={content?.aboutParagraph2 || ""}
                placeholder="İkinci paragraf metni"
                rows={4}
              />
            </div>
          </div>

          {/* Misyon */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Misyon</h3>
            <div className="space-y-2">
              <Label htmlFor="missionTitle">Başlık</Label>
              <Input
                id="missionTitle"
                name="missionTitle"
                defaultValue={content?.missionTitle || ""}
                placeholder="Misyonumuz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="missionText">Açıklama</Label>
              <Textarea
                id="missionText"
                name="missionText"
                defaultValue={content?.missionText || ""}
                placeholder="Misyon açıklaması"
                rows={4}
              />
            </div>
          </div>

          {/* Vizyon */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vizyon</h3>
            <div className="space-y-2">
              <Label htmlFor="visionTitle">Başlık</Label>
              <Input
                id="visionTitle"
                name="visionTitle"
                defaultValue={content?.visionTitle || ""}
                placeholder="Vizyonumuz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visionText">Açıklama</Label>
              <Textarea
                id="visionText"
                name="visionText"
                defaultValue={content?.visionText || ""}
                placeholder="Vizyon açıklaması"
                rows={4}
              />
            </div>
          </div>

          {/* İletişim */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İletişim Bölümü</h3>
            <div className="space-y-2">
              <Label htmlFor="contactTitle">Başlık</Label>
              <Input
                id="contactTitle"
                name="contactTitle"
                defaultValue={content?.contactTitle || ""}
                placeholder="İletişim"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactSubtitle">Alt Başlık</Label>
              <Input
                id="contactSubtitle"
                name="contactSubtitle"
                defaultValue={content?.contactSubtitle || ""}
                placeholder="İletişim açıklaması"
              />
            </div>
          </div>

          <Button type="submit" disabled={updateContentMutation.isPending}>
            {updateContentMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Campaign Management Component
function CampaignManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: campaignSettings } = useQuery({
    queryKey: ["/api/admin/campaign-settings"],
  });

  const addCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/campaigns", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kampanya eklendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Kampanya eklenemedi", variant: "destructive" });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/campaigns/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kampanya güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      setEditingCampaign(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Kampanya güncellenemedi", variant: "destructive" });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/campaigns/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kampanya silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kampanya silinemedi", variant: "destructive" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/campaign-settings", "PUT", data);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Kampanya ayarları güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaign-settings"] });
      setIsSettingsOpen(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Ayarlar güncellenemedi", variant: "destructive" });
    },
  });

  if (isLoading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      {/* Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kampanya Sayfa Ayarları</span>
            <Button onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Ayarları Düzenle
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Hero Başlık:</strong> {(campaignSettings as any)?.heroTitle || "Henüz ayarlanmamış"}
            </div>
            <div>
              <strong>Hero Alt Başlık:</strong> {(campaignSettings as any)?.heroSubtitle || "Henüz ayarlanmamış"}
            </div>
            <div>
              <strong>Öne Çıkan Başlık:</strong> {(campaignSettings as any)?.featuredTitle || "Henüz ayarlanmamış"}
            </div>
            <div>
              <strong>Tüm Kampanyalar Başlık:</strong> {(campaignSettings as any)?.allCampaignsTitle || "Henüz ayarlanmamış"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kampanya Yönetimi</span>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kampanya
            </Button>
          </CardTitle>
          <CardDescription>
            Toplam {campaigns.length} kampanya • {campaigns.filter((c: any) => c.isActive).length} aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign: any) => (
              <Card key={campaign.id} className="relative">
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500">
                      %{campaign.discount} İndirim
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {campaign.isFeatured && (
                      <Badge variant="outline" className="bg-yellow-100">
                        <Star className="h-3 w-3 mr-1" />
                        Öne Çıkan
                      </Badge>
                    )}
                    <Badge variant={campaign.isActive ? "default" : "secondary"}>
                      {campaign.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{campaign.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{campaign.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Calendar className="h-3 w-3" />
                    {campaign.endDate}
                  </div>
                  <Badge variant="outline" className="text-xs">{campaign.category}</Badge>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingCampaign(campaign)}>
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteCampaignMutation.mutate(campaign.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Campaign Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Kampanya Ekle</DialogTitle>
          </DialogHeader>
          <CampaignForm 
            onSubmit={(data: any) => addCampaignMutation.mutate(data)}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={addCampaignMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      {editingCampaign && (
        <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kampanya Düzenle</DialogTitle>
            </DialogHeader>
            <CampaignForm 
              initialData={editingCampaign}
              onSubmit={(data: any) => updateCampaignMutation.mutate({ id: editingCampaign.id, updates: data })}
              onCancel={() => setEditingCampaign(null)}
              isLoading={updateCampaignMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Campaign Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kampanya Sayfa Ayarları</DialogTitle>
            <DialogDescription>
              Kampanya sayfasının genel görünümünü düzenleyin
            </DialogDescription>
          </DialogHeader>
          <CampaignSettingsForm 
            initialData={campaignSettings}
            onSubmit={(data: any) => updateSettingsMutation.mutate(data)}
            onCancel={() => setIsSettingsOpen(false)}
            isLoading={updateSettingsMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Campaign Form Component
function CampaignForm({ initialData, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    discount: initialData?.discount || "",
    endDate: initialData?.endDate || "",
    image: initialData?.image || "",
    category: initialData?.category || "",
    redirectUrl: initialData?.redirectUrl || "",
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder || 0,
    sendEmail: false, // Default to false for email notifications
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kampanya Adı</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Büyük Beyaz Eşya Kampanyası"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>İndirim Oranı</Label>
          <Input
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            placeholder="%40"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Açıklama</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Kampanya açıklaması"
          rows={4}
          className="resize-y min-h-[100px] max-h-[200px] overflow-y-auto admin-textarea"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Buzdolabı">Buzdolabı</SelectItem>
              <SelectItem value="Çamaşır Makinesi">Çamaşır Makinesi</SelectItem>
              <SelectItem value="Klima">Klima</SelectItem>
              <SelectItem value="Bulaşık Makinesi">Bulaşık Makinesi</SelectItem>
              <SelectItem value="Ankastre">Ankastre</SelectItem>
              <SelectItem value="Küçük Ev Aletleri">Küçük Ev Aletleri</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bitiş Tarihi</Label>
          <Input
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            placeholder="31 Ağustos 2025"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sayfa Yönlendirme URL'si</Label>
        <Input
          value={formData.redirectUrl}
          onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
          placeholder="/kampanya-detay/beyaz-esya veya https://example.com/kampanya"
        />
        <p className="text-xs text-gray-500">
          "Kampanyayı İncele" butonuna tıklandığında yönlendirilecek sayfa adresi
        </p>
      </div>

      <div className="space-y-2">
        <Label>Kampanya Görseli URL</Label>
        <div className="flex gap-2">
          <Input
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
            required
          />
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const result = event.target?.result as string;
                    if (result) {
                      setFormData({ ...formData, image: result });
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Görsel Yükle
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          />
          <Label htmlFor="isFeatured">Öne Çıkan Kampanya</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <Label htmlFor="isActive">Aktif</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sendEmail"
            checked={formData.sendEmail}
            onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
          />
          <Label htmlFor="sendEmail">E-posta Gönder</Label>
        </div>
      </div>
      
      {formData.sendEmail && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            📧 Bu seçenek işaretlendiğinde, kampanya oluşturulduktan sonra tüm doğrulanmış e-posta adreslerine kampanya bildirimi gönderilecektir.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Sıralama (0 = En üstte)</Label>
        <Input
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

// Support Ticket Management Component  
function SupportTicketManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: allTickets = [], isLoading } = useQuery({
    queryKey: ["/api/admin/support/tickets"],
  });

  // Filter out closed tickets - only show open tickets
  const tickets = (allTickets as any[]).filter((ticket: any) => ticket.status !== "closed");

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/admin/support/tickets", selectedTicket?.id, "messages"],
    enabled: !!selectedTicket,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: string; message: string }) => {
      const response = await apiRequest(`/api/admin/support/tickets/${data.ticketId}/messages`, "POST", {
        message: data.message
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/admin/support/tickets", selectedTicket?.id, "messages"] 
      });
      toast({ title: "Başarılı", description: "Mesaj gönderildi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Mesaj gönderilemedi", variant: "destructive" });
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiRequest(`/api/admin/support/tickets/${ticketId}/close`, "PATCH");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      setSelectedTicket(null);
      toast({ title: "Başarılı", description: "Talep kapatıldı" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Talep kapatılamadı", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">Açık</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Kapalı</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">Yüksek</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Orta</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Düşük</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Destek Talepleri Yönetimi
          </CardTitle>
          <CardDescription>
            Müşteri destek taleplerini görüntüleyin ve yanıtlayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(tickets as any[]).length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz destek talebi yok
              </h3>
              <p className="text-gray-600">
                Müşteriler talep oluşturduğunda burada görünecek
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ticket List */}
              <div className="space-y-4">
                <h3 className="font-medium">Destek Talepleri ({(tickets as any[]).length})</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {(tickets as any[]).map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{ticket.subject}</h4>
                        <div className="flex gap-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <User className="h-3 w-3" />
                        <span>{ticket.user?.firstName} {ticket.user?.lastName}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Kategori: {ticket.category === "technical" ? "Teknik" : 
                                 ticket.category === "billing" ? "Fatura" : 
                                 ticket.category === "general" ? "Genel" : ticket.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket Detail and Chat */}
              <div className="space-y-4">
                {selectedTicket ? (
                  <>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Talep Detayları</h3>
                        {selectedTicket.status === "open" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => closeTicketMutation.mutate(selectedTicket.id)}
                            disabled={closeTicketMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Talebi Kapat
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div><strong>Konu:</strong> {selectedTicket.subject}</div>
                        <div><strong>Açıklama:</strong> 
                          <div className="mt-1 p-2 bg-gray-50 rounded text-xs whitespace-pre-wrap">
                            {selectedTicket.description}
                          </div>
                        </div>
                        <div><strong>Müşteri:</strong> {selectedTicket.user?.firstName} {selectedTicket.user?.lastName}</div>
                        <div><strong>E-posta:</strong> {selectedTicket.user?.email}</div>
                        <div><strong>Kategori:</strong> {
                          selectedTicket.category === "technical" ? "Teknik" : 
                          selectedTicket.category === "billing" ? "Fatura" : 
                          selectedTicket.category === "general" ? "Genel" : selectedTicket.category
                        }</div>
                        <div><strong>Öncelik:</strong> {
                          selectedTicket.priority === "high" ? "Yüksek" :
                          selectedTicket.priority === "medium" ? "Orta" :
                          selectedTicket.priority === "low" ? "Düşük" : selectedTicket.priority
                        }</div>
                        <div><strong>Durum:</strong> {getStatusBadge(selectedTicket.status)}</div>
                        <div><strong>Oluşturulma:</strong> {formatDate(selectedTicket.createdAt)}</div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="border rounded-lg">
                      <div className="p-4 border-b">
                        <h4 className="font-medium">Mesajlar</h4>
                      </div>
                      
                      <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                        {(messages as any[]).map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderType === "admin" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.senderType === "admin"
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderType === "admin" ? "text-white/80" : "text-gray-500"
                              }`}>
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Send Message */}
                      {selectedTicket.status === "open" && (
                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Mesajınızı yazın..."
                              rows={2}
                              className="resize-none"
                            />
                            <Button
                              onClick={() => sendMessageMutation.mutate({
                                ticketId: selectedTicket.id,
                                message: newMessage
                              })}
                              disabled={!newMessage.trim() || sendMessageMutation.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="border rounded-lg p-8 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Bir destek talebi seçin</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Campaign Settings Form Component
function CampaignSettingsForm({ initialData, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    heroBadge: initialData?.heroBadge || "Özel Kampanyalar",
    heroTitle: initialData?.heroTitle || "Büyük Fırsatlar Sizi Bekliyor!",
    heroSubtitle: initialData?.heroSubtitle || "Arçelik'in özel kampanyalarıyla hayalinizdeki ürünleri uygun fiyatlarla alın",
    featuredTitle: initialData?.featuredTitle || "Öne Çıkan Kampanyalar",
    featuredSubtitle: initialData?.featuredSubtitle || "En popüler ve avantajlı kampanyalarımız",
    allCampaignsTitle: initialData?.allCampaignsTitle || "Tüm Kampanyalar",
    allCampaignsSubtitle: initialData?.allCampaignsSubtitle || "Size uygun kampanyayı bulun ve tasarruf edin",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto scroll-container pr-2 space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hero Bölümü</h3>
          <div className="space-y-2">
            <Label>Hero Badge</Label>
            <Input
              value={formData.heroBadge}
              onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
              placeholder="Özel Kampanyalar"
            />
          </div>
          <div className="space-y-2">
            <Label>Hero Başlık</Label>
            <Input
              value={formData.heroTitle}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              placeholder="Büyük Fırsatlar Sizi Bekliyor!"
            />
          </div>
          <div className="space-y-2">
            <Label>Hero Alt Başlık</Label>
            <Textarea
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              placeholder="Sadece bizde bulabileceğiniz en özel kampanyalarıyla hayalinizdeki ürünleri uygun fiyatlarla alın"
              rows={4}
              className="resize-y min-h-[100px] max-h-[200px] overflow-y-auto"
              style={{ scrollbarWidth: 'thin' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Öne Çıkan Kampanyalar</h3>
          <div className="space-y-2">
            <Label>Başlık</Label>
            <Input
              value={formData.featuredTitle}
              onChange={(e) => setFormData({ ...formData, featuredTitle: e.target.value })}
              placeholder="Öne Çıkan Kampanyalar"
            />
          </div>
          <div className="space-y-2">
            <Label>Alt Başlık</Label>
            <Textarea
              value={formData.featuredSubtitle}
              onChange={(e) => setFormData({ ...formData, featuredSubtitle: e.target.value })}
              placeholder="En popüler ve avantajlı kampanyalarımız"
              rows={3}
              className="resize-y min-h-[80px] max-h-[150px] overflow-y-auto admin-textarea"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tüm Kampanyalar</h3>
          <div className="space-y-2">
            <Label>Başlık</Label>
            <Input
              value={formData.allCampaignsTitle}
              onChange={(e) => setFormData({ ...formData, allCampaignsTitle: e.target.value })}
              placeholder="Tüm Kampanyalar"
            />
          </div>
          <div className="space-y-2">
            <Label>Alt Başlık</Label>
            <Textarea
              value={formData.allCampaignsSubtitle}
              onChange={(e) => setFormData({ ...formData, allCampaignsSubtitle: e.target.value })}
              placeholder="Size uygun kampanyayı bulun ve tasarruf edin"
              rows={3}
              className="resize-y min-h-[80px] max-h-[150px] overflow-y-auto admin-textarea"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 pt-4 border-t bg-white sticky bottom-0">
          <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// İletişim Mesajları Yönetimi
function ContactMessagesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  // Contact messages query
  const { data: contactMessages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/contact-messages'],
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/contact-messages/${id}/read`, "PUT");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      toast({
        title: "Başarılı",
        description: "Mesaj okundu olarak işaretlendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      return await apiRequest(`/api/admin/contact-messages/${id}/response`, "PUT", { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      toast({
        title: "Başarılı",
        description: "Yanıt eklendi",
      });
      setIsResponseDialogOpen(false);
      setResponseText("");
      setSelectedMessage(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt eklenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleAddResponse = (message: any) => {
    setSelectedMessage(message);
    setResponseText(message.adminResponse || "");
    setIsResponseDialogOpen(true);
  };

  const submitResponse = () => {
    if (!selectedMessage || !responseText.trim()) return;
    
    addResponseMutation.mutate({
      id: selectedMessage.id,
      response: responseText.trim(),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            İletişim Mesajları
          </CardTitle>
          <CardDescription>
            Web sitesinden gelen iletişim form mesajlarını görüntüleyin ve yanıtlayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contactMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz hiç iletişim mesajı yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contactMessages.map((message: any) => (
                <Card key={message.id} className={`${!message.isRead ? 'border-l-4 border-l-primary bg-blue-50/30' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${message.isRead ? 'bg-gray-400' : 'bg-primary'}`} />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {message.firstName} {message.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {message.email} • {message.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {formatDate(message.createdAt)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Badge variant="outline" className="mb-2">
                        {message.subject}
                      </Badge>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>

                    {message.adminResponse && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Admin Yanıtı</span>
                        </div>
                        <p className="text-green-700 text-sm">
                          {message.adminResponse}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!message.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsReadMutation.mutate(message.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Okundu İşaretle
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleAddResponse(message)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {message.adminResponse ? 'Yanıtı Güncelle' : 'Yanıtla'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mesaja Yanıt Ver</DialogTitle>
            <DialogDescription>
              {selectedMessage && (
                <>
                  <strong>{selectedMessage.firstName} {selectedMessage.lastName}</strong> kişisinden gelen mesaja yanıt verin
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Orijinal Mesaj:</p>
                <p className="text-gray-800">{selectedMessage.message}</p>
              </div>
              
              <div>
                <Label htmlFor="response">Yanıtınız</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="mt-2 min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsResponseDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={submitResponse}
                  disabled={!responseText.trim() || addResponseMutation.isPending}
                >
                  {addResponseMutation.isPending ? (
                    "Gönderiliyor..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Yanıt Gönder
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// SEO Yönetimi Komponenti
function SeoManagement() {
  const [editingSettings, setEditingSettings] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPageType, setSelectedPageType] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // SEO ayarlarını getir
  const { data: seoSettings = [], isLoading: seoLoading } = useQuery({
    queryKey: ['/api/admin/seo-settings'],
  });

  // SEO ayarı ekleme mutation
  const addSeoMutation = useMutation({
    mutationFn: async (seoData: any) => {
      return await apiRequest('/api/admin/seo-settings', 'POST', seoData);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'SEO ayarı eklendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'SEO ayarı eklenemedi', variant: 'destructive' });
    },
  });

  // SEO ayarı güncelleme mutation
  const updateSeoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/seo-settings/${id}`, 'PUT', updates);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'SEO ayarı güncellendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      setEditingSettings(null);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'SEO ayarı güncellenemedi', variant: 'destructive' });
    },
  });

  // SEO ayarı silme mutation
  const deleteSeoMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/seo-settings/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'SEO ayarı silindi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'SEO ayarı silinemedi', variant: 'destructive' });
    },
  });

  // Bulk SEO generation mutation
  const bulkGenerateSeoMutation = useMutation({
    mutationFn: async (types: string[]) => {
      return await apiRequest('/api/admin/seo-settings/bulk-generate', 'POST', { types });
    },
    onSuccess: (data: any) => {
      const totalCreated = (data.results?.products || 0) + (data.results?.categories || 0) + (data.results?.blog_posts || 0);
      toast({ 
        title: 'Toplu SEO Oluşturma Tamamlandı!', 
        description: `✅ ${totalCreated} SEO ayarı başarıyla oluşturuldu\n📄 ${data.results?.products || 0} ürün\n📂 ${data.results?.categories || 0} kategori\n📝 ${data.results?.blog_posts || 0} blog yazısı`,
        duration: 8000,
        className: "bg-green-50 border-green-200 text-green-800"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
    },
    onError: (error: any) => {
      console.error('Bulk SEO generation error:', error);
      toast({ 
        title: 'Toplu SEO Oluşturma Hatası', 
        description: 'SEO ayarları oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
        duration: 6000
      });
    },
  });

  const pageTypes = [
    { value: 'home', label: 'Ana Sayfa' },
    { value: 'products', label: 'Ürünler Sayfası' },
    { value: 'category', label: 'Kategori Sayfaları' },
    { value: 'product-detail', label: 'Ürün Detay Sayfaları' },
    { value: 'blog', label: 'Blog Sayfaları' },
    { value: 'blog-post', label: 'Blog Yazı Detayları' },
    { value: 'about', label: 'Hakkımızda Sayfası' },
    { value: 'corporate', label: 'Kurumsal Sayfalar' },
    { value: 'campaigns', label: 'Kampanyalar Sayfası' },
    { value: 'contact', label: 'İletişim Sayfası' },
    { value: 'favorites', label: 'Favoriler Sayfası' },
    { value: 'cart', label: 'Sepet Sayfası' },
    { value: 'search', label: 'Arama Sonuçları' },
    { value: '404', label: '404 Hata Sayfası' },
    { value: 'warranty', label: 'Garanti Sayfaları' },
    { value: 'privacy', label: 'Gizlilik Politikası' },
    { value: 'terms', label: 'Kullanım Şartları' },
  ];

  if (seoLoading) {
    return <div className="flex items-center justify-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Yönetimi</h2>
          <p className="text-gray-600 mt-2">Website SEO ayarlarını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => bulkGenerateSeoMutation.mutate(['products', 'categories'])}
            disabled={bulkGenerateSeoMutation.isPending}
          >
            {bulkGenerateSeoMutation.isPending ? 'Oluşturuluyor...' : 'Toplu SEO Oluştur'}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni SEO Ayarı
          </Button>
        </div>
      </div>

      {/* SEO İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam SEO Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seoSettings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ürün SEO'ları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {seoSettings.filter((s: any) => s.pageType === 'product').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kategori SEO'ları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {seoSettings.filter((s: any) => s.pageType === 'category').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Diğer Sayfalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {seoSettings.filter((s: any) => !['product', 'category'].includes(s.pageType)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sayfa Türü:</label>
          <select 
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            value={selectedPageType}
            onChange={(e) => setSelectedPageType(e.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="product">Ürün Sayfaları ({seoSettings.filter((s: any) => s.pageType === 'product').length})</option>
            <option value="category">Kategori Sayfaları ({seoSettings.filter((s: any) => s.pageType === 'category').length})</option>
            <option value="blog_post">Blog Yazıları ({seoSettings.filter((s: any) => s.pageType === 'blog_post').length})</option>
            <option value="home">Ana Sayfalar ({seoSettings.filter((s: any) => ['home', 'about', 'contact', 'campaigns'].includes(s.pageType)).length})</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Toplam {selectedPageType === 'all' ? seoSettings.length : seoSettings.filter((s: any) => selectedPageType === 'home' ? ['home', 'about', 'contact', 'campaigns'].includes(s.pageType) : s.pageType === selectedPageType).length} sonuç gösteriliyor
        </div>
      </div>

      <div className="grid gap-4">
        {seoSettings
          .filter((setting: any) => {
            if (selectedPageType === 'all') return true;
            if (selectedPageType === 'home') return ['home', 'about', 'contact', 'campaigns'].includes(setting.pageType);
            return setting.pageType === selectedPageType;
          })
          .map((setting: any) => (
          <Card key={setting.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{setting.title}</CardTitle>
                  <CardDescription>
                    {pageTypes.find(pt => pt.value === setting.pageType)?.label || setting.pageType}
                    {setting.pageId && ` - ID: ${setting.pageId}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSettings(setting)}
                    data-testid={`edit-seo-${setting.id}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSeoMutation.mutate(setting.id)}
                    data-testid={`delete-seo-${setting.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Açıklama:</strong> {setting.description}</p>
                {setting.keywords && <p><strong>Anahtar Kelimeler:</strong> {setting.keywords}</p>}
                {setting.canonicalUrl && <p><strong>Canonical URL:</strong> {setting.canonicalUrl}</p>}
              </div>
            </CardContent>
          </Card>
        ))}

        {seoSettings.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz SEO ayarı eklenmemiş</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)} data-testid="add-first-seo-setting">
                İlk SEO Ayarını Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add SEO Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni SEO Ayarı Ekle</DialogTitle>
          </DialogHeader>
          <SeoForm
            onSubmit={(data: any) => addSeoMutation.mutate(data)}
            onCancel={() => setShowAddDialog(false)}
            isLoading={addSeoMutation.isPending}
            pageTypes={pageTypes}
          />
        </DialogContent>
      </Dialog>

      {/* Edit SEO Dialog */}
      {editingSettings && (
        <Dialog open={!!editingSettings} onOpenChange={() => setEditingSettings(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>SEO Ayarını Düzenle</DialogTitle>
            </DialogHeader>
            <SeoForm
              initialData={editingSettings}
              onSubmit={(data: any) => updateSeoMutation.mutate({ id: editingSettings.id, updates: data })}
              onCancel={() => setEditingSettings(null)}
              isLoading={updateSeoMutation.isPending}
              pageTypes={pageTypes}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Blog Yönetimi Komponenti
function BlogManagement() {
  const [activeBlogTab, setActiveBlogTab] = useState("posts");
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Blog Yönetimi</h2>
        <p className="text-gray-600 mt-2">Blog yazılarınızı ve kategorilerinizi yönetin</p>
      </div>

      <Tabs value={activeBlogTab} onValueChange={setActiveBlogTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="posts">Blog Yazıları</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="tags">Etiketler</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <BlogPostsManagement />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <BlogCategoriesManagement />
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <BlogTagsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Blog Yazıları Yönetimi
function BlogPostsManagement() {
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Blog yazılarını getir
  const { data: blogPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/admin/blog-posts'],
  });

  // Blog kategorilerini getir (dropdown için)
  const { data: blogCategories = [] } = useQuery({
    queryKey: ['/api/admin/blog-categories'],
  });

  // Blog yazısı ekleme mutation
  const addPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/admin/blog-posts', 'POST', postData);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog yazısı eklendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog yazısı eklenemedi', variant: 'destructive' });
    },
  });

  // Blog yazısı güncelleme mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/blog-posts/${id}`, 'PUT', updates);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog yazısı güncellendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      setEditingPost(null);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog yazısı güncellenemedi', variant: 'destructive' });
    },
  });

  // Blog yazısı silme mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/blog-posts/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog yazısı silindi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog yazısı silinemedi', variant: 'destructive' });
    },
  });

  if (postsLoading) {
    return <div className="flex items-center justify-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Blog Yazıları</h3>
          <p className="text-gray-600">Blog yazılarınızı yönetin</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} data-testid="add-blog-post">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Blog Yazısı
        </Button>
      </div>

      <div className="grid gap-4">
        {blogPosts.map((post: any) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription>
                    {post.category?.name} • {post.status === 'published' ? 'Yayında' : 'Taslak'} • {post.viewCount || 0} görüntülenme
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPost(post)}
                    data-testid={`edit-blog-post-${post.id}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePostMutation.mutate(post.id)}
                    data-testid={`delete-blog-post-${post.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {post.excerpt && (
              <CardContent>
                <p className="text-sm text-gray-600">{post.excerpt}</p>
              </CardContent>
            )}
          </Card>
        ))}

        {blogPosts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz blog yazısı eklenmemiş</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)} data-testid="add-first-blog-post">
                İlk Blog Yazısını Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Blog Post Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white z-[100]">
          <DialogHeader>
            <DialogTitle>Yeni Blog Yazısı Ekle</DialogTitle>
          </DialogHeader>
          <BlogPostForm
            onSubmit={(data: any) => addPostMutation.mutate(data)}
            onCancel={() => setShowAddDialog(false)}
            isLoading={addPostMutation.isPending}
            categories={blogCategories}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Blog Post Dialog */}
      {editingPost && (
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white z-[100]">
            <DialogHeader>
              <DialogTitle>Blog Yazısını Düzenle</DialogTitle>
            </DialogHeader>
            <BlogPostForm
              initialData={editingPost}
              onSubmit={(data: any) => updatePostMutation.mutate({ id: editingPost.id, updates: data })}
              onCancel={() => setEditingPost(null)}
              isLoading={updatePostMutation.isPending}
              categories={blogCategories}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Blog Kategorileri Yönetimi
function BlogCategoriesManagement() {
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Blog kategorilerini getir
  const { data: blogCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/admin/blog-categories'],
  });

  // Blog kategorisi ekleme mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest('/api/admin/blog-categories', 'POST', categoryData);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog kategorisi eklendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-categories'] });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog kategorisi eklenemedi', variant: 'destructive' });
    },
  });

  // Blog kategorisi güncelleme mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/blog-categories/${id}`, 'PUT', updates);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog kategorisi güncellendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-categories'] });
      setEditingCategory(null);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog kategorisi güncellenemedi', variant: 'destructive' });
    },
  });

  // Blog kategorisi silme mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/blog-categories/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog kategorisi silindi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-categories'] });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog kategorisi silinemedi', variant: 'destructive' });
    },
  });

  if (categoriesLoading) {
    return <div className="flex items-center justify-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Blog Kategorileri</h3>
          <p className="text-gray-600">Blog kategorilerinizi yönetin</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} data-testid="add-blog-category">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      <div className="grid gap-4">
        {blogCategories.map((category: any) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>Slug: {category.slug}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                    data-testid={`edit-blog-category-${category.id}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                    data-testid={`delete-blog-category-${category.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {blogCategories.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz kategori eklenmemiş</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)} data-testid="add-first-blog-category">
                İlk Kategoriyi Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Blog Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Blog Kategorisi Ekle</DialogTitle>
          </DialogHeader>
          <BlogCategoryForm
            onSubmit={(data: any) => addCategoryMutation.mutate(data)}
            onCancel={() => setShowAddDialog(false)}
            isLoading={addCategoryMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Blog Category Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Blog Kategorisini Düzenle</DialogTitle>
            </DialogHeader>
            <BlogCategoryForm
              initialData={editingCategory}
              onSubmit={(data: any) => updateCategoryMutation.mutate({ id: editingCategory.id, updates: data })}
              onCancel={() => setEditingCategory(null)}
              isLoading={updateCategoryMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Blog Etiketleri Yönetimi
function BlogTagsManagement() {
  const [editingTag, setEditingTag] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Blog etiketlerini getir
  const { data: blogTags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['/api/admin/blog-tags'],
  });

  // Blog etiketi ekleme mutation
  const addTagMutation = useMutation({
    mutationFn: async (tagData: any) => {
      return await apiRequest('/api/admin/blog-tags', 'POST', tagData);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog etiketi eklendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-tags'] });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog etiketi eklenemedi', variant: 'destructive' });
    },
  });

  // Blog etiketi güncelleme mutation
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/blog-tags/${id}`, 'PUT', updates);
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog etiketi güncellendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-tags'] });
      setEditingTag(null);
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog etiketi güncellenemedi', variant: 'destructive' });
    },
  });

  // Blog etiketi silme mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/blog-tags/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({ title: 'Başarılı!', description: 'Blog etiketi silindi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-tags'] });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Blog etiketi silinemedi', variant: 'destructive' });
    },
  });

  if (tagsLoading) {
    return <div className="flex items-center justify-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Blog Etiketleri</h3>
          <p className="text-gray-600">Blog etiketlerinizi yönetin</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} data-testid="add-blog-tag">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Etiket
        </Button>
      </div>

      <div className="grid gap-4">
        {blogTags.map((tag: any) => (
          <Card key={tag.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{tag.name}</CardTitle>
                  <CardDescription>Slug: {tag.slug}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTag(tag)}
                    data-testid={`edit-blog-tag-${tag.id}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTagMutation.mutate(tag.id)}
                    data-testid={`delete-blog-tag-${tag.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {blogTags.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz etiket eklenmemiş</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)} data-testid="add-first-blog-tag">
                İlk Etiketi Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Blog Tag Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Blog Etiketi Ekle</DialogTitle>
          </DialogHeader>
          <BlogTagForm
            onSubmit={(data: any) => addTagMutation.mutate(data)}
            onCancel={() => setShowAddDialog(false)}
            isLoading={addTagMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Blog Tag Dialog */}
      {editingTag && (
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Blog Etiketini Düzenle</DialogTitle>
            </DialogHeader>
            <BlogTagForm
              initialData={editingTag}
              onSubmit={(data: any) => updateTagMutation.mutate({ id: editingTag.id, updates: data })}
              onCancel={() => setEditingTag(null)}
              isLoading={updateTagMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// SEO Form Komponenti
function SeoForm({ initialData, onSubmit, onCancel, isLoading, pageTypes }: any) {
  const [formData, setFormData] = useState({
    pageType: initialData?.pageType || '',
    pageId: initialData?.pageId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    keywords: initialData?.keywords || '',
    ogTitle: initialData?.ogTitle || '',
    ogDescription: initialData?.ogDescription || '',
    ogImage: initialData?.ogImage || '',
    canonicalUrl: initialData?.canonicalUrl || '',
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sayfa Tipi*</Label>
          <Select 
            value={formData.pageType} 
            onValueChange={(value) => setFormData({ ...formData, pageType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sayfa tipini seçin" />
            </SelectTrigger>
            <SelectContent>
              {pageTypes.map((type: any) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sayfa ID</Label>
          <Input
            value={formData.pageId}
            onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
            placeholder="Kategori/Ürün ID (opsiyonel)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Başlık*</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="SEO başlığı"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Açıklama*</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="SEO açıklaması"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Anahtar Kelimeler</Label>
        <Input
          value={formData.keywords}
          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
          placeholder="virgül, ile, ayrılmış, anahtar, kelimeler"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>OG Başlık</Label>
          <Input
            value={formData.ogTitle}
            onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
            placeholder="Open Graph başlığı"
          />
        </div>

        <div className="space-y-2">
          <Label>OG Açıklama</Label>
          <Input
            value={formData.ogDescription}
            onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
            placeholder="Open Graph açıklaması"
          />
        </div>
      </div>

      <div className="space-y-2">
        <UniversalImageUploader
          label="OG Resim (Sosyal Medya)"
          currentImage={formData.ogImage}
          onImageUpdate={(url) => setFormData({ ...formData, ogImage: url })}
          uploadEndpoint="/api/admin/upload-image"
          imageSpecs={IMAGE_SPECS.ogImage}
          showUrlInput={false}
        />
      </div>

      <div className="space-y-2">
        <Label>Canonical URL</Label>
        <Input
          value={formData.canonicalUrl}
          onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
          placeholder="https://example.com/canonical-url"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

function BlogPostForm({ initialData, onSubmit, onCancel, isLoading, categories = [] }: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    categoryId: initialData?.categoryId || '',
    status: initialData?.status || 'draft',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || '',
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Slug otomatik oluşturma - URL-safe Türkçe karakter çevirisi
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      // Türkçe karakterleri ASCII'ye çevir
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/Ü/g, 'u')
      .replace(/ş/g, 's').replace(/Ş/g, 's')
      .replace(/ı/g, 'i').replace(/İ/g, 'i')
      .replace(/ö/g, 'o').replace(/Ö/g, 'o')
      .replace(/ç/g, 'c').replace(/Ç/g, 'c')
      // Sadece ASCII karakterler, sayılar, tire ve boşluk bırak
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Başlık*</Label>
          <Input
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Blog yazısı başlığı"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Slug*</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="blog-yazisi-slug"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent className="z-[100]" position="popper">
              {categories && categories.length > 0 ? (
                categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  Önce kategori oluşturun ({categories?.length || 0} kategori mevcut)
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Durum</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent className="z-[100]" position="popper">
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="published">Yayında</SelectItem>
              <SelectItem value="archived">Arşivlenmiş</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Özet</Label>
        <Textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Kısa özet yazın..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>İçerik*</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Blog yazısının tam içeriği..."
          rows={10}
          required
        />
      </div>

      <div className="space-y-2">
        <UniversalImageUploader
          label="Öne Çıkan Resim"
          currentImage={formData.featuredImage}
          onImageUpdate={(url) => setFormData({ ...formData, featuredImage: url })}
          uploadEndpoint="/api/admin/upload-image"
          imageSpecs={IMAGE_SPECS.blogPost}
          showUrlInput={false}
        />
      </div>

      {/* SEO Alanları */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-4">SEO Ayarları</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Meta Başlık</Label>
            <Input
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="SEO başlığı"
            />
          </div>

          <div className="space-y-2">
            <Label>Meta Açıklama</Label>
            <Textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="SEO açıklaması"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Meta Anahtar Kelimeler</Label>
            <Input
              value={formData.metaKeywords}
              onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
              placeholder="virgül, ile, ayrılmış, kelimeler"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}



// Blog Category Form Komponenti
function BlogCategoryForm({ initialData, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Slug otomatik oluşturma
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Kategori Adı*</Label>
        <Input
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Blog kategorisi adı"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Slug*</Label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="kategori-slug"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Açıklama</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Kategori açıklaması..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <UniversalImageUploader
          label="Kategori Görseli"
          currentImage={formData.image}
          onImageUpdate={(url) => setFormData({ ...formData, image: url })}
          uploadEndpoint="/api/admin/upload-image"
          imageSpecs={IMAGE_SPECS.blogCategory}
          showUrlInput={false}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

// Blog Tag Form Komponenti
function BlogTagForm({ initialData, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    color: initialData?.color || "#3b82f6",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Slug otomatik oluşturma
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Etiket Adı*</Label>
        <Input
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Blog etiketi adı"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Slug*</Label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="etiket-slug"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Renk</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-20"
          />
          <Input
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="#3b82f6"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Açıklama</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Etiket açıklaması..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}


// Komisyon Oranları Yönetimi Komponenti
function CommissionRatesManagement() {
  const [editingInstallment, setEditingInstallment] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Virtual POS konfigürasyonlarını getir
  const { data: virtualPosConfigs = [], isLoading: posLoading } = useQuery({
    queryKey: ["/api/admin/virtual-pos"],
  });

  // Tüm taksit seçeneklerini getir
  const { data: bankInstallments = [], isLoading: installmentsLoading } = useQuery({
    queryKey: ["/api/admin/bank-installments"],
  });

  // Taksit seçeneği ekleme mutation
  const addInstallmentMutation = useMutation({
    mutationFn: async (installmentData: any) => {
      return await apiRequest("/api/admin/bank-installments", "POST", installmentData);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Taksit seçeneği eklendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-installments"] });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Taksit seçeneği eklenemedi", variant: "destructive" });
    },
  });

  // Taksit seçeneği güncelleme mutation
  const updateInstallmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/bank-installments/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Komisyon oranı güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-installments"] });
      setEditingInstallment(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Komisyon oranı güncellenemedi", variant: "destructive" });
    },
  });

  // Taksit seçeneği silme mutation
  const deleteInstallmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/bank-installments/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Başarılı!", description: "Taksit seçeneği silindi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bank-installments"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Taksit seçeneği silinemedi", variant: "destructive" });
    },
  });

  // Virtual POS config bilgilerini bankInstallments ile birleştir
  const installmentsWithBankInfo = bankInstallments.map((installment: any) => {
    const posConfig = virtualPosConfigs.find((config: any) => config.id === installment.virtualPosConfigId);
    return {
      ...installment,
      bankName: posConfig?.bankName || "Bilinmeyen Banka"
    };
  });

  // Filtrelenmiş installments
  const filteredInstallments = selectedBankId === "all" 
    ? installmentsWithBankInfo 
    : installmentsWithBankInfo.filter((installment: any) => installment.virtualPosConfigId === selectedBankId);

  if (posLoading || installmentsLoading) {
    return <div className="flex items-center justify-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Komisyon Oranları Yönetimi</h2>
          <p className="text-gray-600 mt-2">Banka ve taksit komisyon oranlarını yönetin</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Komisyon Oranı
        </Button>
      </div>

      {/* Komisyon İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Bankalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{virtualPosConfigs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aktif Taksit Seçenekleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bankInstallments.filter((i: any) => i.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ortalama Komisyon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bankInstallments.length > 0 
                ? (bankInstallments.reduce((sum: number, i: any) => sum + parseFloat(i.commissionRate || 0), 0) / bankInstallments.length).toFixed(2)
                : "0"
              }%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">En Yüksek Komisyon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {bankInstallments.length > 0 
                ? Math.max(...bankInstallments.map((i: any) => parseFloat(i.commissionRate || 0))).toFixed(2)
                : "0"
              }%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Banka:</label>
          <select 
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
          >
            <option value="all">Tüm Bankalar</option>
            {virtualPosConfigs.map((config: any) => (
              <option key={config.id} value={config.id}>
                {config.bankName} ({bankInstallments.filter((i: any) => i.virtualPosConfigId === config.id).length} taksit)
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Toplam {filteredInstallments.length} komisyon oranı gösteriliyor
        </div>
      </div>

      {/* Komisyon Oranları Listesi */}
      <div className="grid gap-4">
        {filteredInstallments.map((installment: any) => (
          <Card key={installment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {installment.bankName}
                    <Badge variant={installment.isActive ? "default" : "secondary"}>
                      {installment.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    {installment.cardType === "all" ? "Tüm Kartlar" : installment.cardType.toUpperCase()} • {installment.installmentCount} Taksit
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingInstallment(installment)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteInstallmentMutation.mutate(installment.id)}
                    disabled={deleteInstallmentMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">Komisyon Oranı</div>
                  <div className="text-lg font-bold text-blue-600">%{installment.commissionRate}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Minimum Tutar</div>
                  <div className="text-lg font-semibold">{installment.minAmount} ₺</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Taksit Sayısı</div>
                  <div className="text-lg font-semibold">{installment.installmentCount === 1 ? "Tek Çekim" : `${installment.installmentCount} Ay`}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Yeni Komisyon Oranı Ekleme Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Komisyon Oranı Ekle</DialogTitle>
          </DialogHeader>
          <CommissionInstallmentForm
            virtualPosConfigs={virtualPosConfigs}
            onSubmit={(data) => addInstallmentMutation.mutate(data)}
            onCancel={() => setShowAddDialog(false)}
            isLoading={addInstallmentMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Komisyon Oranı Düzenleme Dialog */}
      <Dialog open={!!editingInstallment} onOpenChange={() => setEditingInstallment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Komisyon Oranı Düzenle</DialogTitle>
          </DialogHeader>
          {editingInstallment && (
            <CommissionInstallmentForm
              virtualPosConfigs={virtualPosConfigs}
              initialData={editingInstallment}
              onSubmit={(data) => updateInstallmentMutation.mutate({ 
                id: editingInstallment.id, 
                updates: data 
              })}
              onCancel={() => setEditingInstallment(null)}
              isLoading={updateInstallmentMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Komisyon Oranı Form Komponenti
function CommissionInstallmentForm({ 
  virtualPosConfigs, 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: any) {
  const [formData, setFormData] = useState({
    virtualPosConfigId: initialData?.virtualPosConfigId || "",
    cardType: initialData?.cardType || "all",
    installmentCount: initialData?.installmentCount || 1,
    commissionRate: initialData?.commissionRate || "",
    minAmount: initialData?.minAmount || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.virtualPosConfigId || !formData.commissionRate) {
      return;
    }
    
    onSubmit({
      ...formData,
      commissionRate: parseFloat(formData.commissionRate),
      minAmount: parseFloat(formData.minAmount) || 0,
      installmentCount: parseInt(formData.installmentCount.toString()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Banka *</Label>
          <Select 
            value={formData.virtualPosConfigId} 
            onValueChange={(value) => setFormData({ ...formData, virtualPosConfigId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Banka seçin" />
            </SelectTrigger>
            <SelectContent>
              {virtualPosConfigs.map((config: any) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Kart Türü</Label>
          <Select 
            value={formData.cardType} 
            onValueChange={(value) => setFormData({ ...formData, cardType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kartlar</SelectItem>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="mastercard">Mastercard</SelectItem>
              <SelectItem value="amex">American Express</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Taksit Sayısı *</Label>
          <Input
            type="number"
            min="1"
            max="24"
            value={formData.installmentCount}
            onChange={(e) => setFormData({ ...formData, installmentCount: parseInt(e.target.value) || 1 })}
            placeholder="1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Komisyon Oranı (%) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
            placeholder="2.50"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Tutar (₺)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.minAmount}
            onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isActive">Aktif</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : (initialData ? "Güncelle" : "Ekle")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
      </div>
    </form>
  );
}
