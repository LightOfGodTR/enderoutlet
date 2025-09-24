import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroSlider from "@/components/hero-slider-new";
import ProductCard from "@/components/product-card";
import CategoryIconsSection from "@/components/category-icons-section";
import ProductCardsSection from "@/components/ProductCardsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Zap, Shield, Truck, Headphones, Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import type { Product, HomepageSection } from "@shared/schema";

export default function Home() {
  // Fetch homepage sections
  const { data: sections = [] } = useQuery<HomepageSection[]>({
    queryKey: ["/api/admin/homepage-sections"],
  });

  // Fetch products for each section
  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/homepage-sections/featured_products/products"],
  });

  const { data: popularProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/homepage-sections/popular_products/products"],
  });

  // Preload first few product images for better performance
  useEffect(() => {
    const preloadProductImages = () => {
      [...featuredProducts.slice(0, 4), ...popularProducts.slice(0, 4)].forEach(product => {
        if (product.image) {
          const img = new Image();
          img.src = product.image;
        }
      });
    };
    
    if (featuredProducts.length > 0 || popularProducts.length > 0) {
      preloadProductImages();
    }
  }, [featuredProducts, popularProducts]);

  // Get section titles
  const featuredSection = sections.find(
    (s) => s.sectionKey === "featured_products",
  );
  const popularSection = sections.find(
    (s) => s.sectionKey === "popular_products",
  );

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Slider - Full width container */}
      <div className="relative w-full">
        <HeroSlider />
        <div className="absolute top-0 left-0 right-0 z-50">
          <Header />
        </div>
      </div>

      {/* Category Icons Section */}
      <CategoryIconsSection />

      {/* Product Cards Section */}
      <ProductCardsSection />

      {/* Features Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-6">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                Yenilikçi Teknoloji
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                En son teknolojilerle donatılmış ürünler
              </p>
            </div>

            <div className="text-center p-3 sm:p-6">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                Garantili Kalite
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                Uzun ömürlü ve dayanıklı ürünler
              </p>
            </div>

            <div className="text-center p-3 sm:p-6">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                Ücretsiz Kargo
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                Tüm İstanbul'da ücretsiz teslimat
              </p>
            </div>

            <div className="text-center p-3 sm:p-6">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Headphones className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                Çalışma Saatleri İçinde Destek
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                Kesintisiz müşteri hizmetleri
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredSection && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <Badge variant="outline" className="mb-2 sm:mb-4 text-xs sm:text-sm">
                {featuredSection.title}
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                {featuredSection.subtitle}
              </h2>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {featuredProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-500">
                  Bu bölüm için ürünler admin panelinden seçilmemiş.
                </p>
              </div>
            )}

            <div className="text-center mt-6 sm:mt-8 md:mt-12">
              <Link href="/products">
                <Button size="default" className="w-full sm:w-auto" variant="outline">
                  Tüm Ürünleri Görüntüle
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Products */}
      {popularSection && (
        <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <Badge variant="outline" className="mb-2 sm:mb-4 text-xs sm:text-sm">
                {popularSection.title}
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                {popularSection.subtitle}
              </h2>
            </div>

            {popularProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {popularProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-500">
                  Bu bölüm için ürünler admin panelinden seçilmemiş.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* İletişim Merkezi - Arçelik Tarzı */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <Badge variant="outline" className="mb-3 bg-white/80 text-gray-700 border-gray-300">
              İletişim Merkezi
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Size Nasıl Yardımcı Olabiliriz?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Ürün seçiminden teknik desteğe kadar tüm ihtiyaçlarınız için yanınızdayız
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Ürün Danışmanlığı Kartı */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 md:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                 onClick={() => window.location.href = 'tel:+905550816004'}>
              <div className="relative z-10">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ürün Danışmanlığı</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Hangi ürün size uygun? Uzman ekibimiz size en doğru seçimi yapmanızda yardımcı olur.
                </p>
                <div className="bg-white/20 rounded-lg px-4 py-2 text-center mb-3">
                  <span className="font-semibold">0555 081 60 04</span>
                </div>
                <div className="flex items-center text-blue-100 text-sm">
                  <span>Hemen ara</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>

            {/* Teknik Destek Kartı */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 md:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                 onClick={() => window.location.href = '/sss'}>
              <div className="relative z-10">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Teknik Destek Merkezi</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Ürününüzde sorun mu var? SSS bölümümüzden hızlı çözümler bulun veya destek alın.
                </p>
                <div className="bg-white/20 rounded-lg px-4 py-2 text-center mb-3">
                  <span className="font-semibold">Sıkça Sorulan Sorular</span>
                </div>
                <div className="flex items-center text-emerald-100 text-sm">
                  <span>Çözümleri keşfet</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>

            {/* İletişim Formu Kartı */}
            <Link href="/contact">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 md:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                <div className="relative z-10">
                  <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mesaj Gönderin</h3>
                  <p className="text-purple-100 text-sm mb-4">
                    Özel sorularınız mı var? Detaylı bilgi için iletişim formumuzu doldurun.
                  </p>
                  <div className="bg-white/20 rounded-lg px-4 py-2 text-center mb-3">
                    <span className="font-semibold">info@enderarcelik.com</span>
                  </div>
                  <div className="flex items-center text-purple-100 text-sm">
                    <span>Formu doldur</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
