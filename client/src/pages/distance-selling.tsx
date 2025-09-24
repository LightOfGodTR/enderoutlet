import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";

export default function DistanceSelling() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Yasal Belgeler</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Online alışveriş işlemlerinizle ilgili hak ve yükümlülükleriniz
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-gray">
            
            <h2>MADDE 1 – TARAFLAR</h2>
            
            <div className="bg-gray-100 p-6 rounded-lg border-l-4 border-primary">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SATICI BİLGİLERİ</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Firma Ünvanı:</strong> ENDER DAY. TÜKETİM MALLARI İNŞ. TUR. SAN. VE TİC. LTD. ŞTİ.</p>
                <p><strong>Adres:</strong> Pınar tepe. Mah. Atatürk 4 Cad. No:19/B Gürpınar-Büyükçekmece-İSTANBUL</p>
                <p><strong>E-posta:</strong> info@enderarcelik.com</p>
                <p><strong>Telefon:</strong> (0212) 8804095</p>
                <p><strong>Fax:</strong> (0212) 8802029</p>
              </div>
            </div>

            <h2>MADDE 2 – KONU</h2>
            <p>
              İşbu sözleşme, Satıcı'nın www.arcelik.com.tr internet sitesi üzerinden elektronik ortamda 
              Alıcı'ya satışını yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürün/ürünlerin 
              satış ve teslimat koşullarını kapsar.
            </p>

            <h2>MADDE 3 – SÖZLEŞME KONUSU ÜRÜN/HIZMET BİLGİLERİ</h2>
            <p>
              Satıcı tarafından Alıcı'ya satılacak mal/hizmetin/ürünün;
            </p>
            <ul>
              <li>Temel özellikleri (türü, miktarı, markası, modeli, rengi, adedi) ürün detay sayfasında yer almaktadır</li>
              <li>Satış bedeli ürün detay sayfasında yer alan fiyattır</li>
              <li>Ödeme şekli ve planı sipariş özet sayfasında belirtilmiştir</li>
            </ul>

            <h2>MADDE 4 – GENEL HÜKÜMLER</h2>
            <p>
              Alıcı, sözleşme konusu ürünün temel niteliklerini, satış fiyatını ve ödeme şeklini 
              incelediğini ve elektronik ortamda gerekli teyidi verdiğini kabul, beyan ve taahhüt eder.
            </p>

            <h2>MADDE 5 – TESLİMAT</h2>
            <p>
              Ürün sipariş tarihinden itibaren 30 gün içinde teslim edilir. Teslimat süresi, 
              ürünün özelliğine, tedarik durumuna ve teslimat adresine göre değişiklik gösterebilir.
            </p>

            <h2>MADDE 6 – CAYMA HAKKI</h2>
            <p>
              Alıcı, sözleşme konusu ürünü teslim aldığı günden itibaren 14 (on dört) gün içinde 
              herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin malı reddederek 
              sözleşmeden cayma hakkını kullanabilir.
            </p>

            <h2>MADDE 7 – CAYMA HAKKININ KULLANILMASI</h2>
            <p>
              Cayma hakkının kullanılması için bu süre içinde Satıcı'ya yazılı olarak bildirimde 
              bulunulması şarttır. Bu hakkın kullanılması halinde:
            </p>
            <ul>
              <li>3. kişiye veya Alıcı'ya teslim edilen ürünün Satıcı'ya iade edilmesi zorunludur</li>
              <li>Ürün eksiksiz ve zarar görmemiş olarak iade edilmelidir</li>
              <li>Fatura aslının iade edilmesi gerekmektedir</li>
            </ul>

            <h2>MADDE 8 – CAYMA HAKKININ KULLANILAMAYACAĞI DURUMLAR</h2>
            <p>
              Aşağıdaki hallerde Alıcı'nın cayma hakkı bulunmamaktadır:
            </p>
            <ul>
              <li>Kişiye özel üretilmiş ürünler</li>
              <li>Hijyen kuralları gereği iade edilemeyecek ürünler</li>
              <li>Teslim sonrası ambalaj açılmış olan tek kullanımlık ürünler</li>
              <li>Özel şartlarda saklanması gereken veya son kullanma tarihi geçebilecek ürünler</li>
            </ul>

            <h2>MADDE 9 – YETKİLİ MAHKEME</h2>
            <p>
              İşbu sözleşme ile ilgili çıkabilecek uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanır. 
              İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>

            <h2>MADDE 10 – YÜRÜRLÜK</h2>
            <p>
              İşbu sözleşme elektronik ortamda Alıcı tarafından okunup, kabul edilmekle 
              yürürlüğe girer ve tarafları bağlar.
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