import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Award, Users, Globe, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Corporate() {
  const { data: content, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/corporate-content"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            Kurumsal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content?.pageTitle || "Arçelik Hakkında"}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {content?.pageSubtitle ||
              "1955'ten bu yana Türkiye'nin önde gelen beyaz eşya markası olarak, milyonlarca aileye kaliteli ürünler sunuyoruz."}
          </p>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {content?.stat1Value || "70+"}
              </h3>
              <p className="text-gray-600">
                {content?.stat1Label || "Yıllık Deneyim"}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {content?.stat2Value || "30M+"}
              </h3>
              <p className="text-gray-600">
                {content?.stat2Label || "Memnun Müşteri"}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {content?.stat3Value || "50+"}
              </h3>
              <p className="text-gray-600">
                {content?.stat3Label || "Ülkede Hizmet"}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {content?.stat4Value || "100+"}
              </h3>
              <p className="text-gray-600">
                {content?.stat4Label || "Ürün Çeşidi"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {content?.aboutTitle || "Hikayemiz"}
              </h2>
              <p className="text-gray-600 mb-6">
                {content?.aboutParagraph1 ||
                  "1955 yılında kurulan Arçelik, Türkiye'nin en köklü beyaz eşya markalarından biridir. 70 yılı aşkın süredir, yenilikçi teknolojiler ve kaliteli ürünlerle milyonlarca ailenin hayatını kolaylaştırmaktayız."}
              </p>
              <p className="text-gray-600 mb-6">
                {content?.aboutParagraph2 ||
                  "Sürdürülebilir teknolojiler geliştirerek, çevre dostu üretim anlayışımızla geleceğe değer katıyoruz. Ar-Ge yatırımlarımız ve inovatif yaklaşımımızla sektörde öncü konumumuzu korumaktayız."}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Misyon ve Vizyonumuz
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-primary" />
                  <span>{content?.missionTitle || "Misyonumuz"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {content?.missionText ||
                    "Türkiye ve dünyada yaşam kalitesini artıran, çevre dostu, teknolojik ve estetik açıdan üstün ürünler geliştirerek, tüketicilerin hayatını kolaylaştırmak ve onlara değer katmaktır."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-6 w-6 text-primary" />
                  <span>{content?.visionTitle || "Vizyonumuz"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {content?.visionText ||
                    "Dünya standartlarında ürünler üreterek, global bir marka olmak ve sürdürülebilir teknolojilerle geleceğe yön veren bir şirket olarak sektörde liderliğimizi sürdürmektir."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {content?.contactTitle || "İletişim"}
            </h2>
            <p className="text-lg text-gray-600">
              {content?.contactSubtitle ||
                "Bizimle iletişime geçin, sorularınızı yanıtlayalım"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Store Locations */}
            <div className="space-y-6">
              {/* Beykent Store */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Beykent Mağazası</h3>
                      <p className="text-gray-600 mb-2">
                        Ginza Residence, Pınartepe<br />
                        Yavuz Sultan Selim Blv. No:30F/13-14<br />
                        34500 Büyükçekmece/İstanbul
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Çalışma Saatleri</span><br />
                          Pazartesi - Cumartesi: 08:30 - 21:00<br />
                          Pazar: 10:30 - 20:00
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-gray-600">(0212) 855 98 78</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gürpınar Store */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Gürpınar Mağazası</h3>
                      <p className="text-gray-600 mb-2">
                        Pınartepe<br />
                        Atatürk 4 Cd. No:19B<br />
                        34500 Büyükçekmece/İstanbul
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Çalışma Saatleri</span><br />
                          Pazartesi - Cumartesi: 08:30 - 20:00<br />
                          Pazar: Kapalı
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-gray-600">(0212) 880 40 95</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
