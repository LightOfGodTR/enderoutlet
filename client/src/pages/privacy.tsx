import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            Yasal Belgeler
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Gizlilik Sözleşmesi
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Kişisel verilerinizin korunması ve gizliliği bizim için çok
            önemlidir.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-gray">
            <h2>1. VERİ SORUMLUSU</h2>
            <p>
              İşbu Gizlilik Politikası, Arçelik A.Ş. tarafından işletilen
              www.arcelik.com.tr internet sitesi üzerinden sunulan hizmetler
              kapsamında, kişisel verilerin 6698 sayılı Kişisel Verilerin
              Korunması Kanunu ("KVKK") uyarınca işlenmesine ilişkin usul ve
              esasları düzenlemektedir.
            </p>

            <h2>2. KİŞİSEL VERİLERİN TOPLANMASI VE İŞLENME AMAÇLARI</h2>
            <p>
              Kişisel verileriniz aşağıdaki amaçlarla toplanmakta ve
              işlenmektedir:
            </p>
            <ul>
              <li>Müşteri hizmetlerinin sunulması</li>
              <li>Sipariş süreçlerinin yönetimi</li>
              <li>Ürün ve hizmet satışının gerçekleştirilmesi</li>
              <li>Müşteri memnuniyeti araştırmalarının yapılması</li>
              <li>Pazarlama faaliyetlerinin yürütülmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>

            <h2>3. TOPLANAN KİŞİSEL VERİ KATEGORİLERİ</h2>
            <p>Web sitemiz üzerinden aşağıdaki kişisel veriler toplanabilir:</p>
            <ul>
              <li>Kimlik bilgileri (ad, soyad, T.C. kimlik numarası)</li>
              <li>İletişim bilgileri (telefon, e-posta, adres)</li>
              <li>
                Müşteri işlem bilgileri (sipariş geçmişi, ödeme bilgileri)
              </li>
              <li>Dijital iz bilgileri (IP adresi, çerez bilgileri)</li>
            </ul>

            <h2>4. ÇEREZ POLİTİKASI</h2>
            <p>
              Web sitemizde kullanıcı deneyimini geliştirmek amacıyla çerezler
              kullanılmaktadır. Çerezlerin kullanımını tarayıcınızdan kontrol
              edebilirsiniz.
            </p>

            <h2>5. HAKLARINIZ</h2>
            <p>KVKK kapsamında sahip olduğunuz haklar:</p>
            <ul>
              <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
              <li>
                Kişisel verilerin işlenme amacını ve bunların amacına uygun
                kullanılıp kullanılmadığını öğrenme
              </li>
              <li>
                Kişisel verilerin düzeltilmesini veya silinmesini talep etme
              </li>
              <li>Kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
            </ul>

            <h2>6. İLETİŞİM</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime
              geçebilirsiniz:
            </p>
            <p>
              <strong>E-posta:</strong> info@enderarcelik.com
              <br />
              <strong>Telefon:</strong> (0212) 880 40 95
              <br />
              <strong>Adres:</strong> Ginza Residence, Pınartepe, Yavuz Sultan
              Selim Blv. No:30F/13-14, 34500 Büyükçekmece/İstanbu
            </p>

            <h2>7. DEĞİŞİKLİKLER</h2>
            <p>
              Bu gizlilik politikası güncellenebilir. Değişiklikler web
              sitemizde yayımlanacaktır.
            </p>

            <p className="text-sm text-gray-600 mt-8">
              Son güncelleme tarihi: {new Date().toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
