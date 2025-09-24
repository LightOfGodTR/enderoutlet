import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kullanım Şartları</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Genel Şartlar</h2>
              <p className="text-gray-700 leading-relaxed">
                Bu web sitesi ENDER DAY. TÜKETİM MALLARI İNŞ. TUR. SAN. VE TİC. LTD. ŞTİ. tarafından işletilmektedir. 
                Sitemizi kullanarak aşağıdaki şart ve koşulları kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Kullanım Kuralları</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Web sitesini yasal olmayan amaçlarla kullanamazsınız</li>
                <li>Başka kullanıcıların haklarını ihlal edecek davranışlarda bulunamazsınız</li>
                <li>Site içeriğini izinsiz kopyalayamaz veya dağıtamazsınız</li>
                <li>Sistemin güvenliğini tehlikeye atacak işlemler yapamazsınız</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Ürün ve Hizmet Bilgileri</h2>
              <p className="text-gray-700 leading-relaxed">
                Web sitemizde yer alan ürün bilgileri, fiyatlar ve görseller bilgilendirme amaçlıdır. 
                Gerçek ürün özellikleri ve fiyatları değişkenlik gösterebilir. Sipariş öncesi güncel bilgiler için 
                müşteri hizmetlerimizle iletişime geçiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sipariş ve Teslimat</h2>
              <p className="text-gray-700 leading-relaxed">
                Verdiğiniz siparişler onay sürecinden geçer. Stokta olmayan ürünler için size bilgi verilir. 
                Teslimat süresi ürüne ve bölgeye göre değişiklik gösterebilir. Teslimat sürecinde ortaya 
                çıkabilecek gecikmelerden dolayı şirketimiz sorumlu tutulamaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Ödeme ve Güvenlik</h2>
              <p className="text-gray-700 leading-relaxed">
                Tüm ödemeler güvenli ödeme sistemleri üzerinden gerçekleştirilir. Kredi kartı bilgileriniz 
                şifrelenerek korunur. Şirketimiz, ödeme bilgilerinizi saklamaz ve üçüncü kişilerle paylaşmaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. İade ve Değişim</h2>
              <p className="text-gray-700 leading-relaxed">
                14 gün içerisinde ürünlerinizi iade edebilir veya değiştirebilirsiniz. İade koşulları için 
                ayrıntılı bilgiyi İade ve Değişim Sözleşmesi'nden inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Sorumluluk Sınırları</h2>
              <p className="text-gray-700 leading-relaxed">
                Şirketimiz, web sitesinin kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumlu değildir. 
                Teknik aksaklıklar, sistem kesintileri veya veri kayıpları nedeniyle oluşabilecek zararlar için 
                sorumluluk kabul etmiyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Fikri Mülkiyet Hakları</h2>
              <p className="text-gray-700 leading-relaxed">
                Bu web sitesinde yer alan tüm içerik, tasarım, logo ve marka ENDER DAY. TÜKETİM MALLARI İNŞ. TUR. SAN. VE TİC. LTD. ŞTİ.'nin 
                mülkiyetindedir. İzinsiz kullanım yasaktır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Değişiklikler</h2>
              <p className="text-gray-700 leading-relaxed">
                Bu kullanım şartları önceden haber vermeksizin değiştirilebilir. Güncel şartları düzenli olarak 
                kontrol etmenizi öneririz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. İletişim</h2>
              <p className="text-gray-700 leading-relaxed">
                Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>E-posta:</strong> info@enderarcelik.com</p>
                <p><strong>Telefon:</strong> (0212) 880 40 95</p>
                <p><strong>Adres:</strong> Ginza Residence, Pınartepe, Yavuz Sultan Selim Blv. No:30F/13-14, 34500 Büyükçekmece/İstanbul</p>
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