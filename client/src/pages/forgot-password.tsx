import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Hata",
        description: "Lütfen e-posta adresinizi girin.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Hata", 
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("/api/auth/forgot-password", "POST", { email });
      
      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Başarılı!",
          description: "Şifre sıfırlama talimatları e-posta adresinize gönderildi.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        const errorData = await response.text();
        let errorMessage = "Bir hata oluştu.";
        
        try {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.error || errorMessage;
        } catch (e) {
          // Keep default message
        }
        
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bağlantı hatası oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">E-posta Gönderildi</CardTitle>
                <CardDescription className="text-gray-600">
                  Şifre sıfırlama talimatları <strong>{email}</strong> adresine gönderildi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 text-center">
                  E-postayı görmüyorsanız spam klasörünüzü kontrol edin.
                </div>
                <div className="space-y-3">
                  <Link href="/login">
                    <Button className="w-full" variant="outline" data-testid="button-back-to-login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Giriş sayfasına dön
                    </Button>
                  </Link>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                    className="w-full text-sm text-primary hover:underline"
                    data-testid="button-send-again"
                  >
                    Tekrar gönder
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Şifremi Unuttum</CardTitle>
              <CardDescription className="text-gray-600">
                E-posta adresinizi girin, size şifre sıfırlama talimatları gönderelim.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta adresi</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading ? "Gönderiliyor..." : "Şifre sıfırlama talimatları gönder"}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <Link href="/login" className="text-sm text-primary hover:underline" data-testid="link-login">
                  Giriş sayfasına dön
                </Link>
                <div className="text-sm text-gray-500">
                  Henüz hesabınız yok mu?{" "}
                  <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
                    Kayıt olun
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}