import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, AlertTriangle, ArrowLeft } from "lucide-react";
import Header from "@/components/header";

interface VerificationResult {
  success: boolean;
  message: string;
}

export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setResult({
        success: false,
        message: "Doğrulama token'ı bulunamadı. Lütfen e-posta linkini kontrol edin."
      });
      setIsLoading(false);
      return;
    }

    // Verify the email token
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setResult({
            success: true,
            message: data.message || "E-posta adresiniz başarıyla doğrulandı!"
          });
        } else {
          setResult({
            success: false,
            message: data.error || "Doğrulama başarısız oldu."
          });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setResult({
          success: false,
          message: "Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin."
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, []);

  const handleBackToAccount = () => {
    navigate("/account");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>E-posta Doğrulanıyor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">Lütfen bekleyin, e-posta adresiniz doğrulanıyor...</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {result?.success ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600">Doğrulama Başarılı</span>
                </>
              ) : (
                <>
                  <X className="h-6 w-6 text-red-600" />
                  <span className="text-red-600">Doğrulama Başarısız</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {result?.success ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{result.message}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    E-posta adresiniz başarıyla doğrulandı. Artık hesabınızın tüm özelliklerini kullanabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-red-800">{result?.message}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Doğrulama linki geçersiz olabilir veya süresi dolmuş olabilir. 
                    Hesabınızdan yeni bir doğrulama e-postası talep edebilirsiniz.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              {result?.success ? (
                <Button 
                  onClick={handleBackToAccount}
                  className="w-full"
                  data-testid="button-account"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Hesabıma Git
                </Button>
              ) : (
                <Button 
                  onClick={handleBackToAccount}
                  variant="outline"
                  className="w-full"
                  data-testid="button-retry"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tekrar Dene
                </Button>
              )}
              
              <Button 
                onClick={handleBackToHome}
                variant={result?.success ? "outline" : "default"}
                className="w-full"
                data-testid="button-home"
              >
                Ana Sayfaya Git
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}