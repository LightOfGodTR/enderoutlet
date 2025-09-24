import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Çerez Politikası
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Çerez Nedir?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Çerezler (cookies), bir web sitesini ziyaret ettiğinizde
                bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin
                dosyalarıdır. Bu dosyalar, web sitesinin düzgün çalışmasını
                sağlar ve kullanıcı deneyimini iyileştirir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Çerez Türleri
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Zorunlu Çerezler
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Web sitesinin temel işlevlerini yerine getirmesi için gerekli
                çerezlerdir. Bu çerezler olmadan site düzgün çalışamaz.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>Oturum yönetimi çerezleri</li>
                <li>Güvenlik çerezleri</li>
                <li>Alışveriş sepeti çerezleri</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Performans Çerezleri
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Web sitesinin performansını ölçmek ve iyileştirmek için
                kullanılan çerezlerdir.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>Sayfa görüntüleme istatistikleri</li>
                <li>Site kullanım analitiği</li>
                <li>Hata raporlama</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                İşlevsellik Çerezleri
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kullanıcı deneyimini kişiselleştirmek için kullanılan
                çerezlerdir.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>Dil tercihlerinizi hatırlama</li>
                <li>Kullanıcı ayarlarını saklama</li>
                <li>Kişiselleştirilmiş içerik gösterimi</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Hedefleme/Reklamcılık Çerezleri
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Size uygun reklamlar göstermek için kullanılan çerezlerdir.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>İlgi alanlarınıza göre reklam gösterimi</li>
                <li>Sosyal medya entegrasyonu</li>
                <li>Üçüncü taraf reklam ağları</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Çerez Kullanım Amaçlarımız
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Ender Arçelik olarak çerezleri aşağıdaki amaçlarla kullanıyoruz:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                <li>Web sitesinin güvenli ve düzgün çalışmasını sağlamak</li>
                <li>Kullanıcı tercihlerini hatırlamak</li>
                <li>Site performansını analiz etmek ve iyileştirmek</li>
                <li>Kişiselleştirilmiş içerik ve öneriler sunmak</li>
                <li>Müşteri hizmetleri kalitesini artırmak</li>
                <li>Pazarlama faaliyetlerini optimize etmek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Çerez Yönetimi
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Çerezleri kontrol etmek için tarayıcı ayarlarınızı
                kullanabilirsiniz. Çoğu tarayıcı çerezleri otomatik olarak kabul
                eder, ancak isterseniz bunu değiştirebilirsiniz.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Popüler Tarayıcılarda Çerez Ayarları:
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik →
                  Çerezler ve diğer site verileri
                </li>
                <li>
                  <strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik →
                  Çerezler ve Site Verileri
                </li>
                <li>
                  <strong>Safari:</strong> Tercihler → Gizlilik → Çerezler ve
                  web sitesi verileri
                </li>
                <li>
                  <strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Üçüncü Taraf Çerezleri
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Web sitemizde üçüncü taraf hizmet sağlayıcılar tarafından
                oluşturulan çerezler bulunabilir:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                <li>
                  <strong>Google Analytics:</strong> Site trafiği ve kullanım
                  analitiği
                </li>
                <li>
                  <strong>Sosyal Medya:</strong> İçerik paylaşımı ve sosyal
                  medya entegrasyonu
                </li>
                <li>
                  <strong>Ödeme Sistemleri:</strong> Güvenli ödeme işlemleri
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Çerezleri Reddetmenin Sonuçları
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Çerezleri reddetmeniz durumunda:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                <li>Bazı site özellikleri düzgün çalışmayabilir</li>
                <li>Alışveriş sepeti işlevleri etkilenebilir</li>
                <li>Kişiselleştirilmiş deneyim sağlanamayabilir</li>
                <li>Her ziyaretinizde tekrar giriş yapmanız gerekebilir</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Veri Saklama Süresi
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Çerezler türüne göre farklı sürelerde saklanır:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                <li>
                  <strong>Oturum çerezleri:</strong> Tarayıcı kapatıldığında
                  silinir
                </li>
                <li>
                  <strong>Kalıcı çerezler:</strong> Belirtilen süre sonunda
                  silinir (1 gün - 2 yıl arası)
                </li>
                <li>
                  <strong>Güvenlik çerezleri:</strong> Güvenlik amaçlı gereken
                  süre boyunca
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. İletişim
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Çerez politikası hakkında sorularınız için bizimle iletişime
                geçebilirsiniz:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p>
                  <strong>E-posta:</strong> info@enderarcelik.com
                </p>
                <p>
                  <strong>Telefon:</strong> (0212) 880 40 95
                </p>
                <p>
                  <strong>Adres:</strong> Ginza Residence, Pınartepe, Yavuz
                  Sultan Selim Blv. No:30F/13-14, 34500 Büyükçekmece/İstanbul
                </p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Son Güncelleme:</strong> 21 Ağustos 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
