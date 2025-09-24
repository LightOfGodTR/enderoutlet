import { useState } from "react";
import * as React from "react";
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
  Smartphone
} from "lucide-react";

// Using dynamic categories from API instead of static data
const staticCategories = [
  {
    id: "beyaz-esya",
    name: "Beyaz Eşya",
    icon: <Refrigerator className="h-8 w-8" />,
    subcategories: [
      {
        title: "Çeyiz Seti Buzdolabı",
        items: [
          "No Frost Buzdolabı",
          "Alttan Donduruculu Buzdolabı",
          "Üstten Donduruculu Buzdolabı",
          "Gardrop Tipi Buzdolabı",
          "Statik Buzdolabı",
          "Mini Buzdolabı",
          "Ankastre Buzdolabı"
        ]
      },
      {
        title: "Bulaşık Makinesi",
        items: [
          "3 Programlı Bulaşık Makinesi",
          "4 Programlı Bulaşık Makinesi",
          "5 Programlı Bulaşık Makinesi",
          "6 Programlı Bulaşık Makinesi",
          "8 Programlı Bulaşık Makinesi",
          "Ankastre Bulaşık Makinesi"
        ]
      },
      {
        title: "Derin Dondurucu",
        items: [
          "Sandık Tipi Derin Dondurucu",
          "Çekmeceli Derin Dondurucu"
        ]
      },
      {
        title: "Çamaşır Makinesi",
        items: [
          "8 Kg Çamaşır Makinesi",
          "9 Kg Çamaşır Makinesi",
          "10 Kg Çamaşır Makinesi",
          "11 Kg Çamaşır Makinesi",
          "12 Kg Çamaşır Makinesi"
        ]
      },
      {
        title: "Kurutma Makinesi",
        items: [
          "8 Kg Kurutma Makinesi",
          "9 Kg Kurutma Makinesi",
          "10 Kg Kurutma Makinesi",
          "11 Kg Kurutma Makinesi",
          "12 Kg Kurutma Makinesi"
        ]
      },
      {
        title: "Ankastre Buzdolabı",
        items: [
          "Tezgah Altı Bulaşık Makinesi",
          "Tam Ankastre Bulaşık Makinesi",
          "Yarı Ankastre Bulaşık Makinesi"
        ]
      },
      {
        title: "Su Sebili",
        items: [
          "Su Sebili"
        ]
      }
    ]
  },
  {
    id: "ankastre",
    name: "Ankastre",
    icon: <Home className="h-8 w-8" />,
    subcategories: [
      {
        title: "Ankastre Set",
        items: [
          "Ankastre Fırın",
          "Ankastre Standart Fırın",
          "Buhar Destekli Fırın",
          "AFry Buhar Destekli Fırın",
          "A Fry Ankastre Fırın",
          "Tam Buharlı A Fry Fırın"
        ]
      },
      {
        title: "Ankastre Mikrodalga",
        items: [
          "Ankastre Mikrodalga",
          "Ankastre Mikrodalga Çerçevesi"
        ]
      },
      {
        title: "Ankastre Ocak",
        items: [
          "Entegre Davlumbazlı Ocak",
          "İndüksiyonlu Ocak",
          "Vitroseramik Ocak",
          "Gazlı Cam Tablalı Ocak",
          "Gazlı Metal Tablalı Ocak",
          "Domino Ocak",
          "Elektrikli Ocak"
        ]
      },
      {
        title: "Ankastre Davlumbaz",
        items: [
          "Ankastre Ada Tipi Davlumbaz",
          "Ankastre Duvar Tipi Davlumbaz"
        ]
      },
      {
        title: "Ankastre Aspiratör",
        items: [
          "Ankastre Sürgülü Aspiratör",
          "Ankastre Gömme Aspiratör"
        ]
      },
      {
        title: "Ankastre Bulaşık Makinesi",
        items: [
          "Tezgah Altı Bulaşık Makinesi",
          "Tam Ankastre Bulaşık Makinesi",
          "Yarı Ankastre Bulaşık Makinesi"
        ]
      }
    ]
  },
  {
    id: "televizyon",
    name: "Televizyon",
    icon: <Tv className="h-8 w-8" />,
    subcategories: [
      {
        title: "Smart TV",
        items: [
          "QLED",
          "OLED",
          "Google TV",
          "Imperium TV",
          "Full HD & HD",
          "Dev Ekran TV",
          "4K TV",
          "LED TV"
        ]
      },
      {
        title: "Mutfak Televizyonu",
        items: [
          "32 İnç (80 Ekran) TV",
          "40 İnç (100 Ekran) TV",
          "43 İnç (109 Ekran) TV",
          "50 İnç (127 Ekran) TV",
          "55 İnç (140 Ekran) TV",
          "65 İnç (165 Ekran) TV",
          "75 İnç (190 Ekran) TV"
        ]
      },
      {
        title: "Hotel Tv",
        items: [
          "Philips TV",
          "Grundig TV",
          "TCL TV"
        ]
      }
    ]
  },
  {
    id: "elektronik",
    name: "Elektronik",
    icon: <Smartphone className="h-8 w-8" />,
    subcategories: [
      {
        title: "Cep Telefonu",
        items: [
          "iPhone Telefon Modelleri",
          "Android Telefon Modelleri"
        ]
      },
      {
        title: "Ödeme Sistemleri",
        items: [
          "Yazar Kasa POS",
          "Android POS",
          "Pompa Yazarkasa",
          "Aksesuarlar"
        ]
      },
      {
        title: "Cep Telefonu Aksesuarları",
        items: [
          "Şarj Cihazları",
          "Şarj Kabloları",
          "Powerbank",
          "Diğer Telefon Aksesuarları",
          "Telefon Kulaklığı",
          "Telefon Kılıfı"
        ]
      },
      {
        title: "Bilgisayar",
        items: [
          "Laptop",
          "Tablet",
          "Masaüstü Bilgisayar"
        ]
      },
      {
        title: "Ses Görüntü",
        items: [
          "Ses Sistemleri",
          "Kulaklık",
          "Medya Oynatıcı"
        ]
      },
      {
        title: "Giyilebilir Teknoloji",
        items: [
          "VR Gözlük",
          "Akıllı Saat",
          "Akıllı Bileklik",
          "Saat ve Bileklik Aksesuarı"
        ]
      },
      {
        title: "Spor ve Outdoor",
        items: [
          "Elektrikli Scooter"
        ]
      },
      {
        title: "Hobi - Oyun (Gaming) Ürünleri",
        items: [
          "Oyun Konsolu",
          "Fotoğraf Kamera",
          "Bilgisayar Aksesuarları",
          "Oyuncu Ekipmanları",
          "Konsol Oyunları",
          "Oyun Konsolu Aksesuarları",
          "Masaüstü Bilgisayarlar",
          "Bilgisayar Çevre Birimleri"
        ]
      }
    ]
  },
  {
    id: "isitma-sogutma",
    name: "Isıtma Soğutma",
    icon: <Wind className="h-8 w-8" />,
    subcategories: [
      {
        title: "Klima",
        items: [
          "Split Klima",
          "Salon Tipi Klima",
          "Portatif Klima",
          "7000 BTU Klima",
          "9000 BTU Klima",
          "12000 BTU Klima",
          "18000 BTU Klima",
          "24000 BTU Klima",
          "26000 BTU Klima",
          "34000 BTU Klima",
          "48000 BTU Klima",
          "55000 BTU Klima"
        ]
      },
      {
        title: "Kombi",
        items: [
          "Premix Yoğuşmalı Kombi",
          "Oda Termostatu"
        ]
      },
      {
        title: "İç Hava Kalitesi",
        items: [
          "Hava Soğutucu"
        ]
      },
      {
        title: "Vantilatör",
        items: [
          "Ayaklı Vantilatör",
          "Tavan Tipi Vantilatör",
          "Kule Tipi Vantilatör"
        ]
      },
      {
        title: "Termosifon",
        items: [
          "Standart Termosifon",
          "Dijital Termosifon",
          "Smart Termosifon"
        ]
      },
      {
        title: "Elektrikli Isıtıcı",
        items: [
          "Seramik Isıtıcı",
          "İnfrared Isıtıcı",
          "Yağlı Radyatör",
          "Konvektör Isıtıcı"
        ]
      },

    ]
  },
  {
    id: "kucuk-ev-aletleri",
    name: "Küçük Ev Aletleri",
    icon: <Microwave className="h-8 w-8" />,
    subcategories: [
      {
        title: "Küçük Ev Aletleri Mutfak Setleri",
        items: []
      },
      {
        title: "Elektrikli Süpürge",
        items: [
          "Şarjlı Dikey Süpürge",
          "Robot Süpürge",
          "Toz Torbasız Süpürge",
          "Toz Torbalı Süpürge",
          "Islak Kuru Süpürge",
          "Toz Torbası"
        ]
      },
      {
        title: "Ütü",
        items: [
          "Buharlı Ütü",
          "Kazanlı Ütü",
          "Buharlı Kırışık Giderici",
          "Ütü Masası"
        ]
      },
      {
        title: "Kahve Makinesi",
        items: [
          "Espresso Makinesi",
          "Türk Kahve Makinesi",
          "Filtre Kahve Makinesi",
          "Kapsül Kahve",
          "Kahve Öğütücü",
          "Kahve Demleme Ekipmanları"
        ]
      },
      {
        title: "Çay Makinesi",
        items: []
      },
      {
        title: "Slush ve Buzlu İçecek Makineleri",
        items: []
      },
      {
        title: "Semaver",
        items: []
      },
      {
        title: "Kettle",
        items: []
      },
      {
        title: "Katı Meyve Sıkacağı",
        items: []
      },
      {
        title: "Narenciye Sıkacağı",
        items: []
      },
      {
        title: "Karıştırıcı & Doğrayıcı",
        items: [
          "El Blender",
          "Blender",
          "Mikser",
          "Doğrayıcı",
          "Kıyma Makinesi",
          "Mutfak Robotu",
          "Mutfak Makinesi"
        ]
      },
      {
        title: "Pişirici",
        items: [
          "Tost Makinesi",
          "Ekmek Kızartma Makinesi",
          "Çok Amaçlı Pişirici",
          "Az Yağlı Fritöz",
          "Waffle Makinesi"
        ]
      },
      {
        title: "Yoğurt & Kefir Makinesi",
        items: []
      },
      {
        title: "Kişisel Bakım",
        items: [
          "Saç Kurutma Makinesi",
          "Saç Düzleştirici",
          "Saç Maşası",
          "Baskül",
          "Tıraş Makineleri",
          "Saç Sakal Kesme Makineleri",
          "Epilatör"
        ]
      },
      {
        title: "Outdoor Ekipman",
        items: [
          "Termos",
          "Kahve Demleme Ekipmanları"
        ]
      },

      {
        title: "Buz Makinesi",
        items: []
      }
    ]
  },
  {
    id: "arcelik-enerji",
    name: "Arçelik Enerji Çözümleri",
    icon: <Zap className="h-8 w-8" />,
    subcategories: [
      {
        title: "Güneş Enerjisi Sistemleri",
        items: [
          "Güneş Panelleri",
          "İnvertör Sistemleri",
          "Enerji Depolama",
          "Hibrit Sistemler"
        ]
      },
      {
        title: "Elektrikli Araç Şarj İstasyonu",
        items: [
          "Ev Tipi Şarj İstasyonu",
          "İşyeri Şarj Çözümleri",
          "Hızlı Şarj İstasyonları"
        ]
      },
      {
        title: "Akıllı Ev Sistemleri",
        items: [
          "Akıllı Termostat",
          "Enerji Yönetim Sistemleri",
          "Akıllı Priz ve Kontrol",
          "Ev Otomasyonu"
        ]
      }
    ]
  },
  {
    id: "su-aritma",
    name: "Su Arıtma",
    icon: <Droplets className="h-8 w-8" />,
    subcategories: [
      {
        title: "Su Arıtma Cihazları",
        items: [
          "Tezgah Altı Su Arıtma",
          "Tezgah Üstü Su Arıtma",
          "Inline Su Filtresi",
          "UV Su Arıtma"
        ]
      },
      {
        title: "Su Filtresi ve Yedek Parçalar",
        items: [
          "Karbon Filtre",
          "Sediment Filtre",
          "RO Membran",
          "Post Karbon Filtre"
        ]
      },
      {
        title: "Su Yumuşatma Sistemleri",
        items: [
          "Otomatik Su Yumuşatma",
          "Manuel Su Yumuşatma",
          "Tuz ve Kimyasallar"
        ]
      },
      {
        title: "Endüstriyel Su Arıtma",
        items: [
          "RO Sistemleri",
          "UV Dezenfeksiyon",
          "Ozon Sistemleri"
        ]
      }
    ]
  }
];

interface ProductCategoriesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiCategory {
  id: string;
  name: string;
  subcategories?: string[];
}

export default function ProductCategoriesDropdown({ isOpen, onClose }: ProductCategoriesDropdownProps) {
  // Dynamic categories from API with real-time updates
  const { data: apiCategories = [] } = useQuery<ApiCategory[]>({
    queryKey: ["/api/admin/categories"],
  });

  // Helper function to get appropriate icon for category
  function getIconForCategory(categoryName: string) {
    switch (categoryName) {
      case 'Beyaz Eşya': return <Refrigerator className="h-8 w-8" />;
      case 'Ankastre': return <Home className="h-8 w-8" />;
      case 'Televizyon': return <Tv className="h-8 w-8" />;
      case 'Elektronik': return <Smartphone className="h-8 w-8" />;
      case 'İşitma Soğutma': return <Wind className="h-8 w-8" />;
      case 'Küçük Ev Aletleri': return <ShoppingBag className="h-8 w-8" />;
      case 'Arçelik Enerji Çözümleri': return <Zap className="h-8 w-8" />;
      case 'Su Arıtma': return <Droplets className="h-8 w-8" />;
      default: return <Home className="h-8 w-8" />;
    }
  }

  // Map API categories to display format
  const displayCategories = apiCategories.length > 0 ? apiCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: getIconForCategory(cat.name),
    subcategories: cat.subcategories || []
  })) : staticCategories;

  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Update selected category when API data loads - fix infinite loop
  React.useEffect(() => {
    if (displayCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(displayCategories[0]);
    }
  }, [apiCategories.length, selectedCategory]); // Only depend on the length, not the whole array

  if (!isOpen) return null;
  if (!selectedCategory) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
      />
      
      {/* Dropdown Content */}
      <div className="fixed top-16 left-0 w-full bg-white shadow-xl border-t z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Top Category Icons Row */}
          <div className="grid grid-cols-6 md:grid-cols-12 gap-4 mb-8 border-b pb-6">
            {displayCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                onMouseEnter={() => setSelectedCategory(category)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group ${
                  selectedCategory.id === category.id ? "bg-red-50 border border-red-200" : ""
                }`}
              >
                <div className={`text-gray-600 group-hover:text-primary transition-colors ${
                  selectedCategory.id === category.id ? "text-primary" : ""
                }`}>
                  {category.icon}
                </div>
                <span className={`text-xs text-center leading-tight ${
                  selectedCategory.id === category.id ? "text-primary font-medium" : "text-gray-700"
                }`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Three Columns - Subcategories */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 ? (
                  <div className="col-span-full">
                    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-red-500">
                      {selectedCategory.name} Alt Kategorileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedCategory.subcategories.map((subcategory: string, index: number) => (
                        <Link
                          key={index}
                          href="/products"
                          onClick={onClose}
                          className="text-sm text-gray-600 hover:text-primary transition-colors block py-2 px-3 rounded hover:bg-gray-50 border border-gray-200"
                        >
                          {subcategory}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-2 flex justify-center">{selectedCategory.icon}</div>
                    <p className="text-gray-500">Bu kategori için alt kategoriler yakında eklenecek.</p>
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
            </div>

            {/* Right Column - Featured Banner */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 text-white relative overflow-hidden h-64">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">AQUAtouch teknolojili ile</h3>
                  <p className="text-gray-300 mb-2">hassas çamaşırlarnıa konuşkan</p>
                  <p className="text-sm text-gray-400 mb-4">Zemanın hazırı değil</p>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span className="w-2 h-2 bg-white/50 rounded-full"></span>
                    <span className="w-2 h-2 bg-white/50 rounded-full"></span>
                  </div>
                </div>
                <div className="absolute right-4 bottom-4 w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center">
                  <Shirt className="h-10 w-10" />
                </div>
                <div className="absolute top-2 right-2 w-12 h-8 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">ECO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}