import { Link } from "wouter";
import { Phone, Mail, MapPin, Instagram, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Logo from "./logo";

interface FooterLink {
  id: string;
  sectionTitle: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  sectionOrder: number;
}

export default function Footer() {
  // Genel ayarları çek
  const { data: generalSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
  }) as { data: any };

  // Footer linklerini çek
  const { data: footerLinks = [] } = useQuery<FooterLink[]>({
    queryKey: ["/api/footer-links"],
  });

  // Footer linklerini bölümlere göre grupla
  const groupedLinks = footerLinks.reduce((acc, link) => {
    if (!acc[link.sectionTitle]) {
      acc[link.sectionTitle] = [];
    }
    acc[link.sectionTitle].push(link);
    return acc;
  }, {} as Record<string, FooterLink[]>);

  // Her bölümü sortOrder'a göre sırala
  Object.keys(groupedLinks).forEach(section => {
    groupedLinks[section].sort((a, b) => a.sortOrder - b.sortOrder);
  });

  // Bölümleri sectionOrder'a göre sırala
  const sortedSections = Object.entries(groupedLinks)
    .sort(([,a], [,b]) => (a[0]?.sectionOrder || 0) - (b[0]?.sectionOrder || 0));

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 ${sortedSections.length > 0 ? `lg:grid-cols-${Math.min(sortedSections.length + 1, 6)}` : 'lg:grid-cols-2'}`}>
          {/* Company Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Logo className="text-white text-lg md:text-xl" />
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              {generalSettings?.siteDescription ||
                "Türkiye'nin önde gelen beyaz eşya markası olarak, yenilikçi teknolojiler ve kaliteli ürünlerle hayatınızı kolaylaştırıyoruz."}
            </p>
            <div className="flex space-x-4 mt-4">
              {generalSettings?.instagramUrl &&
                generalSettings.instagramUrl.trim() && (
                  <a
                    href={generalSettings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-800"
                    data-testid="link-instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              {generalSettings?.whatsappUrl &&
                generalSettings.whatsappUrl.trim() && (
                  <a
                    href={generalSettings.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-800"
                    data-testid="link-whatsapp"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
            </div>
          </div>

          {/* Contact - Always shown as second column */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-semibold">İletişim</h3>
            <div className="space-y-3 text-sm md:text-base">
              <div className="flex items-start space-x-2">
                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Müşteri Hizmetleri</p>
                  <p className="text-white font-semibold">0555 081 60 04</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">E-posta</p>
                  <p className="text-white">info@enderarcelik.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Beykent</p>
                  <p className="text-white text-sm">
                    Ginza Residence, Pınartepe,
                    <br />
                    Yavuz Sultan Selim Blv. No:30F/13-14,
                    <br />
                    34500 Büyükçekmece/İstanbul
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Gürpınar</p>
                  <p className="text-white text-sm">
                    Pınartepe, Atatürk 4 Cd. No:19B,
                    <br />
                    34500 Büyükçekmece/İstanbul
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Footer Links */}
          {sortedSections.map(([sectionTitle, links]) => (
            <div key={sectionTitle} className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold" data-testid={`section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`}>
                {sectionTitle}
              </h3>
              <ul className="space-y-2 text-sm md:text-base">
                {links.map((link) => (
                  <li key={link.id}>
                    {link.linkUrl.startsWith('http') ? (
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        data-testid={`link-${link.linkText.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.linkText}
                      </a>
                    ) : (
                      <Link
                        href={link.linkUrl}
                        className="text-gray-400 hover:text-white transition-colors"
                        data-testid={`link-${link.linkText.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.linkText}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Fallback sections if no dynamic links */}
          {sortedSections.length === 0 && (
            <>
              {/* Products Fallback */}
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold">Ürünler</h3>
                <ul className="space-y-2 text-sm md:text-base">
                  <li>
                    <Link
                      href="/products?category=Buzdolabı"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Buzdolabı
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products?category=Çamaşır Makinesi"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Çamaşır Makinesi
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products?category=Klima"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Klima
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support Fallback */}
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold">Destek</h3>
                <ul className="space-y-2 text-sm md:text-base">
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Müşteri Hizmetleri
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/support"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Kullanım Kılavuzları
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="text-center">
          <div className="text-sm md:text-base text-gray-400">
            © 2025 {generalSettings?.siteTitle || "Ender Ticaret"}. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
}
