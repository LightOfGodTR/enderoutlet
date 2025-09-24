import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List } from "lucide-react";
import type { Product, CategoryBanner } from "@shared/schema";

export default function Products() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const categoryFromUrl = urlParams.get('category') || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [scrollY, setScrollY] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  // URL'deki category parametresi değiştiğinde state'i güncelle
  useEffect(() => {
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Parallax scroll efekti
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Category banner'ını fetch et
  const { data: categoryBanner } = useQuery<CategoryBanner>({
    queryKey: [`/api/category-banners/${selectedCategory}`],
    enabled: selectedCategory !== "all" && selectedCategory !== "discounted",
  });

  const categories = [
    { value: "all", label: "Tüm Ürünler" },
    { value: "discounted", label: "İndirimli Ürünler" },
    // Ana kategoriler
    { value: "Beyaz Eşya", label: "Beyaz Eşya" },
    { value: "Ankastre", label: "Ankastre" },
    { value: "Televizyon", label: "Televizyon" },
    { value: "Elektronik", label: "Elektronik" },
    { value: "Isıtma Soğutma", label: "Isıtma Soğutma" },
    { value: "Küçük Ev Aletleri", label: "Küçük Ev Aletleri" },
    // Alt kategoriler
    { value: "Buzdolabı", label: "Buzdolabı" },
    { value: "Çamaşır Makinesi", label: "Çamaşır Makinesi" },
    { value: "Bulaşık Makinesi", label: "Bulaşık Makinesi" },
    { value: "Klima", label: "Klima" },
    { value: "Mikrodalga", label: "Mikrodalga" },
  ];

  const sortOptions = [
    { value: "name", label: "A-Z Sırala" },
    { value: "price-asc", label: "En Ucuz" },
    { value: "price-desc", label: "En Pahalı" },
    { value: "newest", label: "En Yeni" },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product: Product) => {
      if (selectedCategory === "all") return true;
      
      // İndirimli ürünler filtresi - sadece gerçek indirimli ürünleri göster
      if (selectedCategory === "discounted") {
        return product.originalPrice !== null && 
               product.originalPrice !== undefined && 
               product.originalPrice > product.price;
      }
      
      // Önce category'yi kontrol et - tam eşleşme varsa direkt kabul et
      if (product.category === selectedCategory) {
        return true;
      }
      
      // Category eşleşmezse subcategory içinde arama yap
      const categoryMap: { [key: string]: string[] } = {
        // Ana kategoriler
        "Beyaz Eşya": ["beyaz", "eşya", "buzdolabı", "çamaşır", "bulaşık", "dondurucu"],
        "Ankastre": ["ankastre", "fırın", "ocak"],
        "Televizyon": ["televizyon", "tv", "smart"],
        "Elektronik": ["elektronik", "ses", "görüntü", "oyun"],
        "Isıtma Soğutma": ["klima", "ısıtma", "soğutma", "kombi", "termosifon"],
        "Küçük Ev Aletleri": ["küçük", "blender", "kahve", "ütü", "süpürge"],
        // Alt kategoriler
        "Buzdolabı": ["buzdolabı", "dondurucu"],
        "Çamaşır Makinesi": ["çamaşır"],
        "Bulaşık Makinesi": ["bulaşık"],
        "Klima": ["klima", "klimati"],
        "Mikrodalga": ["mikrodalga", "micro"]
      };
      
      const keywords = categoryMap[selectedCategory];
      if (!keywords) return false;
      
      const subcategory = (product.subcategory || "").toLowerCase();
      return keywords.some(keyword => subcategory.includes(keyword.toLowerCase()));
    });

    // Sıralama
    if (sortBy === "price-asc") {
      filtered.sort((a: Product, b: Product) => {
        const priceA = parseFloat(String(a.price)) || 0;
        const priceB = parseFloat(String(b.price)) || 0;
        
        if (priceA <= 0 && priceB > 0) return 1;
        if (priceB <= 0 && priceA > 0) return -1;
        if (priceA <= 0 && priceB <= 0) return 0;
        
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      filtered.sort((a: Product, b: Product) => {
        const priceA = parseFloat(String(a.price)) || 0;
        const priceB = parseFloat(String(b.price)) || 0;
        
        if (priceA <= 0 && priceB > 0) return 1;
        if (priceB <= 0 && priceA > 0) return -1;
        if (priceA <= 0 && priceB <= 0) return 0;
        
        return priceB - priceA;
      });
    } else if (sortBy === "name") {
      filtered.sort((a: Product, b: Product) => a.name.localeCompare(b.name, 'tr'));
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <Header />


      {/* Category Banner - Kategori seçiliyse göster */}
      {categoryBanner && (
        <section 
          ref={bannerRef}
          className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100 ease-out"
            style={{ 
              backgroundImage: `url(${categoryBanner.imageUrl})`,
              transform: `translateY(${scrollY * 0.5}px)`
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center text-white px-4">
              <div className="max-w-4xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                  {categoryBanner.title}
                </h1>
                {categoryBanner.description && (
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                    {categoryBanner.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters & Controls */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          {/* Mobile Category Filter */}
          <div className="md:hidden mb-4">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`whitespace-nowrap flex-shrink-0 text-xs px-3 ${
                    selectedCategory === category.value ? "btn-primary" : ""
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Alt Kategori Seçici - Mobil */}
          <div className="md:hidden mb-4">
            <Select value="" onValueChange={(value) => setSelectedCategory(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alt kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ürünler</SelectItem>
                <SelectItem value="discounted">İndirimli Ürünler</SelectItem>
                <SelectItem value="Buzdolabı">Buzdolabı</SelectItem>
                <SelectItem value="Çamaşır Makinesi">Çamaşır Makinesi</SelectItem>
                <SelectItem value="Klima">Klima</SelectItem>
                <SelectItem value="Ankastre">Ankastre</SelectItem>
                <SelectItem value="Bulaşık Makinesi">Bulaşık Makinesi</SelectItem>
                <SelectItem value="Mikrodalga">Mikrodalga</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex md:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "btn-primary" : ""}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Alt Kategori Seçici - Desktop */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Kategori Seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center justify-between">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs sm:text-sm text-gray-600">
              {filteredProducts.length} ürün görüntüleniyor
            </p>
            
            {selectedCategory !== "all" && (
              <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                {categories.find(c => c.value === selectedCategory)?.label}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse aspect-square rounded-lg"></div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={`grid gap-3 sm:gap-4 md:gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-1"
            }`}>
              {filteredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <Grid3X3 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                Ürün bulunamadı
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Bu kategoride ürün bulunmamaktadır.
              </p>
              <Button 
                onClick={() => setSelectedCategory("all")}
                size="sm"
                className="w-full sm:w-auto"
              >
                Tüm Ürünleri Göster
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
