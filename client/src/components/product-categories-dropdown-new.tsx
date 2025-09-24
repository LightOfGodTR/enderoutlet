import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Refrigerator,
  Shirt,
  Tv,
  Speaker,
  Microwave,
  Home,
  Zap,
  Droplets,
  Wind,
  ShoppingBag,
  Wrench,
  Smartphone,
} from "lucide-react";

// Kategori görselleri
import beyazEsyaImg from "@assets/kategori-gorseli-beyaz-esya_1757592510812.png";
import ankastreImg from "@assets/ankastreset_1757592513130.png";
import televizyonImg from "@assets/Ar-elik-Televizyon-ana-kategori_1757592516526.png";
import elektronikImg from "@assets/elektronik-ikon_1757592520170.png";
import isitmaSogutmaImg from "@assets/isitma-sogutma_1757592524611.png";
import kucukEvAletleriImg from "@assets/kategori-gorseli-kucuk-ev-aletleri_1757592527866.png";

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

interface ProductCategoriesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get appropriate icon for category
function getIconForCategory(categoryName: string) {
  switch (categoryName) {
    case "Beyaz Eşya":
      return <img src={beyazEsyaImg} alt="Beyaz Eşya" className="h-20 w-20 object-contain" />;
    case "Ankastre":
      return <img src={ankastreImg} alt="Ankastre" className="h-20 w-20 object-contain" />;
    case "Televizyon":
      return <img src={televizyonImg} alt="Televizyon" className="h-20 w-20 object-contain" />;
    case "Elektronik":
      return <img src={elektronikImg} alt="Elektronik" className="h-20 w-20 object-contain" />;
    case "Isıtma Soğutma":
      return <img src={isitmaSogutmaImg} alt="Isıtma Soğutma" className="h-20 w-20 object-contain" />;
    case "İşitma Soğutma":
      return <img src={isitmaSogutmaImg} alt="İşitma Soğutma" className="h-20 w-20 object-contain" />;
    case "Küçük Ev Aletleri":
      return <img src={kucukEvAletleriImg} alt="Küçük Ev Aletleri" className="h-20 w-20 object-contain" />;
    case "Arçelik Enerji Çözümleri":
      return <Zap className="h-20 w-20" />;
    case "Su Arıtma":
      return <Droplets className="h-20 w-20" />;
    default:
      return <Home className="h-20 w-20" />;
  }
}

export default function ProductCategoriesDropdown({
  isOpen,
  onClose,
}: ProductCategoriesDropdownProps) {
  // Dynamic categories from API with real-time updates
  const { data: apiCategories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Initialize selected category when data is loaded
  useEffect(() => {
    if (apiCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(apiCategories[0].id);
    }
  }, [apiCategories, selectedCategoryId]);

  if (!isOpen || isLoading) return null;
  if (apiCategories.length === 0) return null;

  const selectedCategory =
    apiCategories.find((cat: any) => cat.id === selectedCategoryId) ||
    apiCategories[0];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />

      {/* Dropdown Content */}
      <div className="fixed top-24 left-0 w-full bg-white shadow-xl border-t z-[70] max-h-[calc(100vh-96px)] overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Top Category Icons Row */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-8 border-b pb-6">
            {apiCategories.map((category: any) => (
              <Link
                key={`category-${category.id}`}
                href={`/category/${category.name
                  .toLowerCase()
                  .replace(/ç/g, "c")
                  .replace(/ğ/g, "g")
                  .replace(/ı/g, "i")
                  .replace(/ö/g, "o")
                  .replace(/ş/g, "s")
                  .replace(/ü/g, "u")
                  .replace(/\s+/g, "-")
                  .replace(/[^\w-]/g, "")}`}
                onClick={onClose}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group ${
                  selectedCategoryId === category.id
                    ? "bg-red-50 border border-red-200"
                    : ""
                }`}
                onMouseEnter={() => setSelectedCategoryId(category.id)}
              >
                <div
                  className={`text-gray-600 group-hover:text-primary transition-colors ${
                    selectedCategoryId === category.id ? "text-primary" : ""
                  }`}
                >
                  {getIconForCategory(category.name)}
                </div>
                <span
                  className={`text-xs text-center leading-tight ${
                    selectedCategoryId === category.id
                      ? "text-primary font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Three Columns - Subcategories */}
            <div className="lg:col-span-3">
              {selectedCategory &&
              selectedCategory.subcategories &&
              selectedCategory.subcategories.length > 0 ? (
                <div>
                  <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-red-500">
                    {selectedCategory.name} Ürünleri
                  </h3>

                  {/* Alt Kategoriler - Üstte */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Tüm Alt Kategoriler
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {selectedCategory.subcategories.map(
                        (subcategory: string, index: number) => {
                          const categorySlug = selectedCategory.name
                            .toLowerCase()
                            .replace(/ç/g, "c")
                            .replace(/ğ/g, "g")
                            .replace(/ı/g, "i")
                            .replace(/ö/g, "o")
                            .replace(/ş/g, "s")
                            .replace(/ü/g, "u")
                            .replace(/\s+/g, "-")
                            .replace(/[^\w-]/g, "");

                          const subcategorySlug = subcategory
                            .toLowerCase()
                            .replace(/ç/g, "c")
                            .replace(/ğ/g, "g")
                            .replace(/ı/g, "i")
                            .replace(/ö/g, "o")
                            .replace(/ş/g, "s")
                            .replace(/ü/g, "u")
                            .replace(/\s+/g, "-")
                            .replace(/[^\w-]/g, "");

                          return (
                            <Link
                              key={`subcategory-${selectedCategory.id}-${index}`}
                              href={`/category/${categorySlug}/${subcategorySlug}`}
                              onClick={onClose}
                              className="text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors block py-2 px-3 rounded border border-gray-200"
                            >
                              {subcategory}
                            </Link>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Ana Kategori Grupları - Altta */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Ana Kategoriler
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(() => {
                        const categorySlug = selectedCategory.name
                          .toLowerCase()
                          .replace(/ç/g, "c")
                          .replace(/ğ/g, "g")
                          .replace(/ı/g, "i")
                          .replace(/ö/g, "o")
                          .replace(/ş/g, "s")
                          .replace(/ü/g, "u")
                          .replace(/\s+/g, "-")
                          .replace(/[^\w-]/g, "");

                        // Ana ürün grupları tanımla
                        const mainGroups = [
                          {
                            name: "Buzdolabı",
                            subcategory: "buzdolabi",
                            description: "Tüm buzdolabı modelleri",
                          },
                          {
                            name: "Çamaşır Makinesi",
                            subcategory: "camasir-makinesi",
                            description: "Tüm çamaşır makinesi modelleri",
                          },
                          {
                            name: "Bulaşık Makinesi",
                            subcategory: "bulasik-makinesi",
                            description: "Tüm bulaşık makinesi modelleri",
                          },
                          {
                            name: "Klima",
                            subcategory: "klima",
                            description: "Tüm klima modelleri",
                          },
                          {
                            name: "Ankastre",
                            subcategory: "ankastre",
                            description: "Tüm ankastre ürünler",
                          },
                          {
                            name: "Küçük Ev Aletleri",
                            subcategory: "kucuk-ev-aletleri",
                            description: "Küçük ev aletleri",
                          },
                        ];

                        return mainGroups.map((group, index) => (
                          <Link
                            key={`maingroup-${selectedCategory.id}-${group.name}-${index}`}
                            href={`/products?category=${group.name}`}
                            onClick={onClose}
                            className="group p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-red-50 transition-all duration-200"
                          >
                            <h5 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                              {group.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {group.description}
                            </p>
                          </Link>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2 flex justify-center">
                    {getIconForCategory(selectedCategory?.name || "")}
                  </div>
                  <p className="text-gray-500">
                    Bu kategori için alt kategoriler yakında eklenecek.
                  </p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="inline-block mt-4 text-primary hover:underline"
                  >
                    Tüm Ürünleri Görüntüle
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column - Featured Banner */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 text-center">
                <div className="text-primary mb-4 flex justify-center">
                  <Zap className="h-12 w-12" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Özel Kampanyalar
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Seçili kategorilerde indirimleri görmek için.
                </p>
                <Link
                  href="/campaigns"
                  onClick={onClose}
                  className="inline-block bg-primary text-white text-sm px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                >
                  İncele
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
