import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Gift, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Campaign, CampaignSettings } from "@shared/schema";

export default function Campaigns() {
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: settings } = useQuery<CampaignSettings>({
    queryKey: ["/api/campaign-settings"],
    staleTime: 5 * 60 * 1000,
  });

  const featuredCampaigns = campaigns.filter(c => c.isFeatured);
  const regularCampaigns = campaigns.filter(c => !c.isFeatured);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">{settings?.heroBadge || "Özel Kampanyalar"}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {settings?.heroTitle || "Büyük Fırsatlar Sizi Bekliyor!"}
          </h1>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            {settings?.heroSubtitle || "Arçelik'in özel kampanyalarıyla hayalinizdeki ürünleri uygun fiyatlarla alın"}
          </p>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {settings?.featuredTitle || "Öne Çıkan Kampanyalar"}
            </h2>
            <p className="text-lg text-gray-600">
              {settings?.featuredSubtitle || "En popüler ve avantajlı kampanyalarımız"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {featuredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="discount-badge absolute top-4 left-4 text-lg px-3 py-1">
                    %{campaign.discount} İndirim
                  </Badge>
                  <Badge variant="outline" className="absolute top-4 right-4 bg-white">
                    {campaign.category}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {campaign.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Bitiş: {campaign.endDate}</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{campaign.isActive ? "Aktif" : "Pasif"}</span>
                    </div>
                  </div>
                  
                  {campaign.redirectUrl ? (
                    campaign.redirectUrl.startsWith('http') ? (
                      <a href={campaign.redirectUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button className="w-full btn-primary">
                          <Tag className="h-4 w-4 mr-2" />
                          Kampanyayı İncele
                        </Button>
                      </a>
                    ) : (
                      <Link href={campaign.redirectUrl} className="block w-full">
                        <Button className="w-full btn-primary">
                          <Tag className="h-4 w-4 mr-2" />
                          Kampanyayı İncele
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Button className="w-full btn-primary" disabled>
                      <Tag className="h-4 w-4 mr-2" />
                      Kampanyayı İncele
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Campaigns */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {settings?.allCampaignsTitle || "Tüm Kampanyalar"}
            </h2>
            <p className="text-lg text-gray-600">
              {settings?.allCampaignsSubtitle || "Size uygun kampanyayı bulun ve tasarruf edin"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularCampaigns.map((campaign) => (
              <Card key={campaign.id} className="group hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="discount-badge absolute top-3 left-3">
                    %{campaign.discount} İndirim
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {campaign.category}
                  </Badge>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {campaign.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Bitiş: {campaign.endDate}</span>
                    <span className={campaign.isActive ? "text-green-600" : "text-red-600"}>
                      {campaign.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  
                  {campaign.redirectUrl ? (
                    campaign.redirectUrl.startsWith('http') ? (
                      <a href={campaign.redirectUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button size="sm" className="w-full">
                          Detayları Gör
                        </Button>
                      </a>
                    ) : (
                      <Link href={campaign.redirectUrl} className="block w-full">
                        <Button size="sm" className="w-full">
                          Detayları Gör
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Button size="sm" className="w-full" disabled>
                      Detayları Gör
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white text-center">
            <Gift className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">
              Özel Müşteri Ayrıcalıkları
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Bülten aboneliği ile kampanyalardan ilk siz haberdar olun ve özel indirimlerden yararlanın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900"
              />
              <Button className="btn-primary">
                Abone Ol
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
