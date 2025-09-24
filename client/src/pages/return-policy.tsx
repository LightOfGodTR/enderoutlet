import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Yasal Belgeler</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            İade ve Değişim Sözleşmesi
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ürün iade ve değişim işlemleri ile ilgili detaylı bilgiler
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-gray">
            
            <h2>1. GENEL KURALLAR</h2>
            <p>
              Arçelik A.Ş., müşteri memnuniyetini en üst düzeyde tutmak amacıyla 
              ürünlerin iadesinde ve değişiminde esnek politikalar uygulamaktadır.
            </p>

            <h2>2. İADE ŞARTLARI</h2>
            <p>
              Ürün iadesinde aşağıdaki şartların tamamının yerine getirilmesi gerekmektedir:
            </p>
            <ul>
              <li>Ürünün teslim alındığı günden itibaren 14 gün içinde iade edilmesi</li>
              <li>Ürünün orijinal ambalajında, hasarsız ve eksiksiz olması</li>
              <li>Ürünle birlikte verilen tüm aksesuarların iade edilmesi</li>
              <li>Fatura aslının beraberinde gönderilmesi</li>
              <li>Ürünün kullanılmamış durumda olması</li>
            </ul>

            <h2>3. İADE EDİLEMEYECEK ÜRÜNLER</h2>
            <p>
              Aşağıda belirtilen ürünler sağlık ve hijyen kuralları gereğince iade edilemez:
            </p>
            <ul>
              <li>Hijyen kuralları gereği iade edilemeyecek ürünler</li>
              <li>Kişiye özel üretilmiş ürünler</li>
              <li>Ambalajı açılmış tek kullanımlık ürünler</li>
              <li>Test edilmiş veya kullanılmış ürünler</li>
              <li>Özel şartlarda saklanması gereken ürünler</li>
            </ul>

            <h2>4. İADE SÜRECİ</h2>
            <p>
              İade işlemlerinizi aşağıdaki yöntemlerle başlatabilirsiniz:
            </p>
            <ul>
              <li><strong>Online:</strong> Hesabınıza giriş yaparak "Siparişlerim" bölümünden</li>
              <li><strong>Telefon:</strong> (0212) 880 40 95 numaralı müşteri hizmetleri</li>
              <li><strong>E-posta:</strong> info@enderarcelik.com</li>
            </ul>

            <h2>5. KARGO VE NAKLİYE</h2>
            <p>
              İade işlemlerinde kargo ve nakliye koşulları:
            </p>
            <ul>
              <li>Ücretsiz kargo ile gönderilen siparişlerde iade kargo ücreti müşteriye aittir</li>
              <li>Hatalı ürün teslimatında iade kargo ücreti tarafımıza aittir</li>
              <li>Büyük beyaz eşya ürünlerinde nakliye koordinasyonu müşteri hizmetleri tarafından yapılır</li>
            </ul>

            <h2>6. PARA İADESİ</h2>
            <p>
              İade edilen ürünlerin bedeli:
            </p>
            <ul>
              <li>Kredi kartı ile yapılan ödemelerde kart hesabına iade edilir (1-5 iş günü)</li>
              <li>Havale/EFT ile yapılan ödemelerde belirtilen hesaba iade edilir (3-7 iş günü)</li>
              <li>Kapıda ödeme ile yapılan siparişlerde belirtilen hesaba iade edilir (3-7 iş günü)</li>
            </ul>

            <h2>7. DEĞİŞİM İŞLEMİ</h2>
            <p>
              Aynı kategorideki ürünlerle değişim yapılabilir. Fiyat farkı varsa:
            </p>
            <ul>
              <li>Fazla olan miktar iade edilir</li>
              <li>Eksik olan miktar tahsil edilir</li>
              <li>Değişim işlemi 14 gün içinde yapılmalıdır</li>
            </ul>

            <h2>8. GARANTİ KAPSAMINDA İADE</h2>
            <p>
              Garanti kapsamındaki arızalı ürünlerde:
            </p>
            <ul>
              <li>Ücretsiz onarım hakkı</li>
              <li>Onarım mümkün değilse değişim veya iade</li>
              <li>Teknik servis raporu gerekmektedir</li>
            </ul>

            <h2>9. İLETİŞİM BİLGİLERİ</h2>
            <p>
              İade ve değişim işlemleriniz için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Online:</strong> Hesabınıza giriş yaparak "Siparişlerim" bölümünden</li>
                <li><strong>Telefon:</strong> (0212) 880 40 95 numaralı müşteri hizmetleri</li>
                <li><strong>E-posta:</strong> info@enderarcelik.com</li>
              </ul>
            </div>

            <h2>10. ÖZEL DURUMLAR</h2>
            <p>
              Doğal afet, salgın hastalık gibi mücbir sebep hallerde 
              iade ve değişim süreleri uzatılabilir. Bu durumlar müşteri hizmetleri 
              tarafından değerlendirilir.
            </p>

            <p className="text-sm text-gray-600 mt-8">
              Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}