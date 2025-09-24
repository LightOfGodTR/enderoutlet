import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Phone, Mail, MapPin, Clock, MessageCircleQuestion, FileText, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has existing support tickets
  const { data: userTickets } = useQuery({
    queryKey: ['/api/support/tickets'],
    enabled: isAuthenticated && !!user,
  });

  // Contact form state
  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
      subject: "Genel Bilgi",
    },
  });

  // Contact form submission
  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      const response = await apiRequest("/api/contact-messages", "POST", data);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "İletişim formu başarıyla gönderildi. En kısa sürede size geri dönüş yapacağız.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      console.error("Contact form error:", error);
    },
  });

  const onSubmit = (data: InsertContactMessage) => {
    contactMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bize Ulaşın</h1>
            <p className="text-lg text-gray-600 mb-6">
              Ürünlerimiz hakkında bilgi almak, teknik destek talebinde bulunmak veya mağazalarımızı ziyaret etmek için bizimle iletişime geçebilirsiniz.
            </p>
            
            {/* Support Ticket Button */}
            <div className="max-w-lg mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/destek-talebi-olustur")}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3"
                  size="lg"
                >
                  <MessageCircleQuestion className="h-6 w-6" />
                  Destek Talebi Açın
                </Button>
                
                {/* Show "Taleplerim" button if user has existing tickets */}
                {isAuthenticated && userTickets && Array.isArray(userTickets) && userTickets.length > 0 ? (
                  <Button 
                    onClick={() => navigate("/destek-taleplerim")}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3"
                    size="lg"
                  >
                    <FileText className="h-6 w-6" />
                    Taleplerim
                  </Button>
                ) : null}
              </div>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                Teknik sorunlar, garanti işlemleri veya diğer konular için destek talebi oluşturun
                {isAuthenticated && userTickets && Array.isArray(userTickets) && userTickets.length > 0 ? (
                  <span className="block mt-1">
                    Mevcut taleplerinizi görüntülemek için "Taleplerim" butonuna tıklayın
                  </span>
                ) : null}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="font-semibold">Hemen Arayin</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-red-600" />
                <span className="font-semibold">E-posta Gönderin</span>
              </div>
            </div>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Telefon
              </h3>
              <p className="text-gray-600 mb-1">Müşteri Hizmetleri</p>
              <a href="tel:+905550816004" className="text-xl font-bold text-primary hover:underline">0555 081 60 04</a>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                E-posta
              </h3>
              <p className="text-gray-600 mb-1">Genel Bilgi</p>
              <a href="mailto:info@enderarcelik.com" className="text-lg font-semibold text-primary hover:underline">
                info@enderarcelik.com
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Çalışma Saatleri
              </h3>
              <p className="text-gray-600 mb-2">Pazartesi - Cumartesi</p>
              <p className="text-lg font-bold text-gray-900">08:30 - 21:00</p>
              <p className="text-gray-600 mt-2">Pazar Kapalı</p>
            </div>
          </div>

          {/* Store Locations */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Mağazalarımız
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Beykent Store */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="p-8">
                  <div className="flex items-start space-x-3 mb-4">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Beykent Mağazası
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Ginza Residence, Pınartepe
                        <br />
                        Yavuz Sultan Selim Blv. No:30F/13-14
                        <br />
                        34500 Büyükçekmece/İstanbul
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 mb-4">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Çalışma Saatleri
                      </p>
                      <p className="text-gray-600">
                        Pazartesi - Cumartesi: 08:30 - 21:00
                      </p>
                      <p className="text-gray-600">Pazar: 10.30 - 20:00</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Telefon</p>
                      <a href="tel:+902128559878" className="text-gray-600 hover:text-primary hover:underline">(0212) 855 98 78</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gürpınar Store */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="p-8">
                  <div className="flex items-start space-x-3 mb-4">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Gürpınar Mağazası
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Pınartepe
                        <br />
                        Atatürk 4 Cd. No:19B
                        <br />
                        34500 Büyükçekmece/İstanbul
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 mb-4">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Çalışma Saatleri
                      </p>
                      <p className="text-gray-600">
                        Pazartesi - Cumartesi: 08:30 - 20:00
                      </p>
                      <p className="text-gray-600">Pazar: Kapalı</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Telefon</p>
                      <a href="tel:+902128804095" className="text-gray-600 hover:text-primary hover:underline">(0212) 880 40 95</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              İletişim Formu
            </h3>
            <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
              Kurumsal iş birlikleri, ürün bilgileri ve genel sorularınız için aşağıdaki formu doldurun. En kısa sürede size geri dönüş yapacağız.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Adınızı girin" 
                              {...field}
                              data-testid="input-firstName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soyad *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Soyadınızı girin" 
                              {...field}
                              data-testid="input-lastName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0512 345 67 89" 
                              {...field}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="ornek@email.com" 
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konu</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || "Genel Bilgi"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-subject">
                              <SelectValue placeholder="Konu seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Genel Bilgi">Genel Bilgi</SelectItem>
                            <SelectItem value="Ürün Bilgisi">Ürün Bilgisi</SelectItem>
                            <SelectItem value="İş Birliği">İş Birliği</SelectItem>
                            <SelectItem value="Mağaza Bilgisi">Mağaza Bilgisi</SelectItem>
                            <SelectItem value="Diğer">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mesaj *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mesajınızı yazın..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-center">
                    <Button 
                      type="submit" 
                      disabled={contactMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"
                      data-testid="button-submit-contact"
                    >
                      {contactMutation.isPending ? (
                        "Gönderiliyor..."
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Mesaj Gönder
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Additional Contact Section */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Diğer İletişim Yolları
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Acil durumlar için telefon veya e-posta ile de bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+905550816004"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Hemen Arayın
              </a>
              <a
                href="mailto:info@enderarcelik.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                E-posta Gönderin
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}