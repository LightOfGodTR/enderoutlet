import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List, ChevronRight } from "lucide-react";
import type { Product, CategoryBanner } from "@shared/schema";

export default function CategoryPage() {
  const [match, params] = useRoute("/category/:category/:subcategory?");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [scrollY, setScrollY] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll efekti
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const category = params?.category || "";
  const subcategory = params?.subcategory || "";

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Array<{id: string, name: string, icon: string, subcategories: string[]}>>({
    queryKey: ["/api/admin/categories"],
  });

  // URL decode category names and map to Turkish category names
  const urlToTurkishCategoryMap: { [key: string]: string } = {
    "beyaz-esya": "Beyaz Eşya",
    "ankastre": "Ankastre", 
    "televizyon": "Televizyon",
    "elektronik": "Elektronik",
    "isitma-sogutma": "Isıtma Soğutma",
    "kucuk-ev-aletleri": "Küçük Ev Aletleri",
    "buzdolabi": "Buzdolabı",
    "camasir-makinesi": "Çamaşır Makinesi", 
    "bulasik-makinesi": "Bulaşık Makinesi",
    "klima": "Klima",
    "mikrodalga": "Mikrodalga"
  };
  
  const decodedCategory = urlToTurkishCategoryMap[category.toLowerCase()] || 
    decodeURIComponent(category)
      .replace(/-/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());

  // Category banner'ını fetch et - loading state ile flicker'ı önle
  const { data: categoryBanner, isLoading: bannerLoading } = useQuery<CategoryBanner>({
    queryKey: [`/api/category-banners/${decodedCategory}`],
    enabled: !!decodedCategory,
  });
  
  const decodedSubcategory = subcategory 
    ? urlToTurkishCategoryMap[subcategory.toLowerCase()] || 
        decodeURIComponent(subcategory)
          .replace(/-/g, " ")
          .replace(/\b\w/g, l => l.toUpperCase())
    : "";

  // Find current category data
  const currentCategory = categories.find((cat: any) => 
    cat.name.toLowerCase() === decodedCategory.toLowerCase()
  );

  const sortOptions = [
    { value: "name", label: "A-Z Sırala" },
    { value: "price-asc", label: "En Ucuz" },
    { value: "price-desc", label: "En Pahalı" },
    { value: "newest", label: "En Yeni" },
  ];

  // Filter products by category and subcategory
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product: Product) => {
      // İndirimli ürünler özel case'i
      if (decodedCategory.toLowerCase() === "indirimli urunler" || decodedCategory.toLowerCase() === "discounted") {
        return product.originalPrice !== null && product.originalPrice !== undefined;
      }
      
      // Enhanced normalize function for Turkish characters
      const normalizeStr = (str: string) => {
        return str.toLowerCase().trim()
          .replace(/ç/g, "c")
          .replace(/ğ/g, "g")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ş/g, "s")
          .replace(/ü/g, "u");
      };
      
      const productCategory = normalizeStr(product.category || "");
      const targetCategory = normalizeStr(decodedCategory);
      
      const categoryMatch = productCategory === targetCategory;
      
      if (decodedSubcategory) {
        const productSubcategory = normalizeStr(product.subcategory || "");
        const targetSubcategory = normalizeStr(decodedSubcategory);
        const subcategoryMatch = productSubcategory === targetSubcategory;
        return categoryMatch && subcategoryMatch;
      }
      
      return categoryMatch;
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
  }, [products, decodedCategory, decodedSubcategory, sortBy]);

  // Get unique subcategories for the current category
  const subcategories = useMemo(() => {
    if (!currentCategory?.subcategories) return [];
    
    return currentCategory.subcategories.map((sub: string) => ({
      name: sub,
      slug: sub.toLowerCase()
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ş/g, "s")
        .replace(/ü/g, "u")
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
    }));
  }, [currentCategory]);

  if (!match) {
    return null;
  }

  const pageTitle = decodedSubcategory 
    ? decodedSubcategory
    : decodedCategory;

  const pageDescription = decodedSubcategory
    ? `${decodedSubcategory} kategorisindeki tüm ürünler`
    : `${decodedCategory} kategorisindeki tüm ürünler ve alt kategoriler`;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <section className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Ana Sayfa
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link 
              href={`/category/${category.toLowerCase()
                .replace(/ç/g, "c")
                .replace(/ğ/g, "g")
                .replace(/ı/g, "i")
                .replace(/ö/g, "o")
                .replace(/ş/g, "s")
                .replace(/ü/g, "u")
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "")}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {decodedCategory}
            </Link>
            {decodedSubcategory && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{decodedSubcategory}</span>
              </>
            )}
          </nav>
        </div>
      </section>

      {/* Category Banner - Flicker'ı önlemek için loading kontrolü */}
      {!bannerLoading && categoryBanner && (
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

      {/* Fallback Page Header - Banner yoksa göster (loading sırasında değil) */}
      {!bannerLoading && !categoryBanner && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {pageTitle}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {pageDescription}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Subcategory Dropdown (if viewing main category) */}
      {!decodedSubcategory && subcategories.length > 0 && (
        <section className="py-6 border-b bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <label htmlFor="subcategory-select" className="text-sm font-medium text-gray-700">
                Alt Kategori Seç:
              </label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value) {
                    window.location.href = `/category/${category}/${value}`;
                  }
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Alt kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub: any) => (
                    <SelectItem key={sub.name} value={sub.slug}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      )}

      {/* Filters & Controls */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} ürün görüntüleniyor
                </p>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {pageTitle}
                </Badge>
              </div>
              
              {/* Quick subcategory selector for subcategory pages */}
              {decodedSubcategory && subcategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Diğer alt kategoriler:</span>
                  <Select
                    value={subcategory}
                    onValueChange={(value) => {
                      if (value) {
                        window.location.href = `/category/${category}/${value}`;
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Alt kategori değiştir" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub: any) => (
                        <SelectItem key={sub.name} value={sub.slug}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
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
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse aspect-square rounded-lg"></div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}>
              {filteredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Grid3X3 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ürün bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                Bu kategoride henüz ürün bulunmamaktadır.
              </p>
              <Link href="/products">
                <Button>
                  Tüm Ürünleri Göster
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}