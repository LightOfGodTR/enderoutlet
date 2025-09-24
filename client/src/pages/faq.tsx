import Header from "@/components/header";
import Footer from "@/components/footer";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  Truck,
  Settings,
  Phone,
  FileText,
} from "lucide-react";

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  // Ürün Bilgileri
  {
    id: 1,
    category: "Ürün Bilgileri",
    icon: <Settings className="w-5 h-5" />,
    question: "Buzdolabı seçerken nelere dikkat etmeliyim?",
    answer:
      "Buzdolabı seçerken aile büyüklüğünüz, mutfak alanınız, enerji verimliliği (A++ veya üzeri), kapı açılım yönü, dondurucu hacmi ve özel özellikler (No Frost, dijital kontrol, antibakteriyel teknoloji) gibi faktörleri göz önünde bulundurmalısınız.",
  },
  {
    id: 2,
    category: "Ürün Bilgileri",
    icon: <Settings className="w-5 h-5" />,
    question: "Çamaşır makinesi kaç yıl kullanılabilir?",
    answer:
      "Kaliteli bir çamaşır makinesi normal kullanım koşullarında ortalama 10-15 yıl kullanılabilir. Düzenli bakım ve doğru kullanım ile bu süre uzatılabilir. Arçelik ürünleri dayanıklılığı ile bilinir ve uzun ömürlü kullanım sağlar.",
  },
  {
    id: 3,
    category: "Ürün Bilgileri",
    icon: <Settings className="w-5 h-5" />,
    question: "Klima hangi BTU değerinde olmalı?",
    answer:
      "Klima BTU hesaplaması için oda metrekaresi × 500-600 BTU formülü kullanılır. 20 m² oda için 12.000 BTU, 30 m² için 18.000 BTU yeterlidir. Cam yüzeyi fazla, üst kat veya güney cepheli odalar için daha yüksek BTU tercih edilmelidir.",
  },

  // Teslimat ve Montaj
  {
    id: 4,
    category: "Teslimat ve Montaj",
    icon: <Truck className="w-5 h-5" />,
    question: "Teslimat süresi ne kadar?",
    answer:
      "Stokta bulunan ürünler İstanbul içi 1-2 iş günü, Türkiye geneli 2-5 iş günü içinde teslim edilir. Büyük beyaz eşya için ücretsiz teslimat hizmeti sunuyoruz. Teslimat öncesi SMS ile bilgilendirme yapılır.",
  },
  {
    id: 5,
    category: "Teslimat ve Montaj",
    icon: <Truck className="w-5 h-5" />,
    question: "Montaj hizmeti veriliyor mu?",
    answer:
      "Tüm büyük beyaz eşya ürünlerimiz için profesyonel montaj hizmeti sunuyoruz. Klima, çamaşır makinesi, bulaşık makinesi ve ankastre ürünler deneyimli teknisyenlerimiz tarafından monte edilir. Montaj randevusu teslimat sonrası belirlenir.",
  },
  {
    id: 6,
    category: "Teslimat ve Montaj",
    icon: <Truck className="w-5 h-5" />,
    question: "Eski cihazımı geri alıyor musunuz?",
    answer:
      "Evet, yeni beyaz eşya alımınızda eski cihazınızı ücretsiz olarak geri alıyoruz. Çevre dostu geri dönüşüm sürecimizle eski cihazlarınız sorumlu şekilde değerlendirilir. Bu hizmet sadece büyük beyaz eşya için geçerlidir.",
  },

  // Garanti ve Servis
  {
    id: 7,
    category: "Garanti ve Servis",
    icon: <ShieldCheck className="w-5 h-5" />,
    question: "Garanti süresi ne kadar?",
    answer:
      "Arçelik ürünleri 2 yıl üretici garantisi ile gelir. Elektronik aksamlar 2 yıl, motor ve kompresör gibi ana parçalar için 5-10 yıl garanti sunuyoruz. Garanti belgesi mutlaka saklanmalıdır.",
  },
  {
    id: 8,
    category: "Garanti ve Servis",
    icon: <ShieldCheck className="w-5 h-5" />,
    question: "Servis nasıl çağırırım?",
    answer:
      "Arçelik Çağrı Merkezi: 444 0 888. Online servis talebi için web sitemizden 'Servis Talebi' bölümünü kullanabilirsiniz. Ürün seri numarası ve arıza tanımı ile talebinizi iletebilirsiniz. Teknisyen randevusu 24 saat içinde verilir.",
  },
  {
    id: 9,
    category: "Garanti ve Servis",
    icon: <ShieldCheck className="w-5 h-5" />,
    question: "Garanti kapsamında neler var?",
    answer:
      "Garanti; üretim hatası, elektronik aksam arızaları, motor ve kompresör sorunları kapsar. Yanlış kullanım, dış etken hasarları, elektrik problemi kaynaklı arızalar garanti kapsamı dışındadır. Orijinal parça ve yetkili servis garantisi vardır.",
  },

  // Ödeme ve Fiyat
  {
    id: 10,
    category: "Ödeme ve Fiyat",
    icon: <FileText className="w-5 h-5" />,
    question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    answer:
      "Kredi kartı (tüm bankalar), banka kartı, havale/EFT seçenekleri mevcuttur. 7 aya varan taksit imkanı sunuyoruz. Ayrıca bazı bankalarla özel kampanyalar düzenliyoruz.",
  },
  {
    id: 11,
    category: "Ödeme ve Fiyat",
    icon: <FileText className="w-5 h-5" />,
    question: "Fiyatlarda indirim var mı?",
    answer:
      "Sezonsal kampanyalar, özel günler indirimleri ve erken ödeme indirimleri düzenli olarak sunuyoruz. Email aboneliği ile kampanyalardan haberdar olabilirsiniz. Toplu alımlarda ek indirim fırsatları vardır.",
  },
  {
    id: 12,
    category: "Ödeme ve Fiyat",
    icon: <FileText className="w-5 h-5" />,
    question: "Fatura ve vergi durumu nasıl?",
    answer:
      "Tüm satışlarımız %20 KDV dahil fiyattır. İstenirse kurumsal fatura kesilebilir. E-fatura ve kağıt fatura seçeneği mevcuttur. Fatura bilgileri siparişte belirtilmelidir.",
  },

  // Teknik Destek
  {
    id: 13,
    category: "Teknik Destek",
    icon: <Phone className="w-5 h-5" />,
    question: "Cihazım çalışmıyor, ne yapmalıyım?",
    answer:
      "Önce elektrik bağlantısını ve sigortaları kontrol edin. Kullanım kılavuzundaki 'Sorun Giderme' bölümünü inceleyin. Sorun devam ederse 444 0 888 numaralı müşteri hizmetlerimizi arayın. Telefon desteği 7/24 hizmet vermektedir.",
  },
  {
    id: 14,
    category: "Teknik Destek",
    icon: <Phone className="w-5 h-5" />,
    question: "Enerji tüketimi nasıl hesaplanır?",
    answer:
      "Ürün enerji etiketindeki yıllık tüketim değerini 365'e bölerek günlük tüketimi, elektrik birim fiyatı ile çarparak aylık maliyeti hesaplayabilirsiniz. A+++ sınıfı ürünler %50'ye kadar enerji tasarrufu sağlar.",
  },
  {
    id: 15,
    category: "Teknik Destek",
    icon: <Phone className="w-5 h-5" />,
    question: "Bakım ne sıklıkla yapılmalı?",
    answer:
      "Klima filtreleri ayda 1, buzdolabı kondensatör temizliği 6 ayda 1, çamaşır makinesi kireç temizliği 3 ayda 1 yapılmalıdır. Düzenli bakım cihaz ömrünü uzatır ve enerji verimliliğini artırır. Bakım hatırlatma servisi mevcuttur.",
  },
];

const categories = Array.from(new Set(faqData.map((item) => item.category)));

export default function FAQPage() {
  const [activeItems, setActiveItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<string>("Tüm Kategoriler");

  const toggleItem = (id: number) => {
    setActiveItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredFAQ =
    activeCategory === "Tüm Kategoriler"
      ? faqData
      : faqData.filter((item) => item.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Ürün Bilgileri":
        return <Settings className="w-4 h-4" />;
      case "Teslimat ve Montaj":
        return <Truck className="w-4 h-4" />;
      case "Garanti ve Servis":
        return <ShieldCheck className="w-4 h-4" />;
      case "Ödeme ve Fiyat":
        return <FileText className="w-4 h-4" />;
      case "Teknik Destek":
        return <Phone className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Arçelik ürünleri hakkında merak ettiğiniz her şey burada! Hızlı
            çözümler için SSS bölümümüzü inceleyin.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Kategori Seçin
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveCategory("Tüm Kategoriler")}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === "Tüm Kategoriler"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                data-testid="filter-all-categories"
              >
                <Zap className="w-4 h-4 mr-2" />
                Tüm Kategoriler
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  data-testid={`filter-${category.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800">
                {activeCategory === "Tüm Kategoriler"
                  ? `Toplam ${filteredFAQ.length} Soru`
                  : `${activeCategory} - ${filteredFAQ.length} Soru`}
              </h3>
            </div>

            {filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  data-testid={`faq-question-${item.id}`}
                >
                  <div className="flex items-center flex-1">
                    <div className="flex items-center mr-4">
                      <span className="text-blue-600 mr-2">{item.icon}</span>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 flex-1">
                      {item.question}
                    </h3>
                  </div>
                  {activeItems.includes(item.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {activeItems.includes(item.id) && (
                  <div
                    className="px-6 pb-4"
                    data-testid={`faq-answer-${item.id}`}
                  >
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Cevabını Bulamadınız mı?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Aradığınız cevabı bulamadıysanız, müşteri hizmetlerimizle
              iletişime geçebilir veya destek talebi oluşturabilirsiniz. Uzman
              ekibimiz size yardımcı olmak için hazır!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0555 081 60 04"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                data-testid="button-call-support"
              >
                <Phone className="w-5 h-5 mr-2" />
                0555 081 60 04 (7/24)
              </a>
              <a
                href="/contact"
                className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                data-testid="button-contact-page"
              >
                <FileText className="w-5 h-5 mr-2" />
                İletişim Formu
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
